import { env } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';

const cloudflareEnv = env as unknown as Record<string, string | undefined>;
const scriptUrl = (cloudflareEnv.MILLANADA_SCRIPT_URL || process.env.MILLANADA_SCRIPT_URL || '').trim();

const demoState = {
  people: [],
  totalAttending: 0,
  dishClaims: {},
  updatedAt: null,
  closed: false,
};

async function readJsonSafely(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, error: 'La respuesta de Apps Script no es JSON válido.', raw: text.slice(0, 400) };
  }
}

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get('action') || 'state';
  if (!scriptUrl) return NextResponse.json({ ok: true, demo: true, state: demoState });

  const upstreamUrl = new URL(scriptUrl);
  upstreamUrl.searchParams.set('action', action);

  try {
    const upstream = await fetch(upstreamUrl.toString(), { cache: 'no-store' });
    const data = await readJsonSafely(upstream);
    const status = !upstream.ok ? 502 : data.ok === false ? 400 : 200;
    return NextResponse.json(data, { status });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'No se pudo conectar con Apps Script.' },
      { status: 502 },
    );
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { action?: unknown; payload?: unknown };
  const action = typeof body.action === 'string' ? body.action : 'rsvp';
  const payload = body.payload ?? body;

  if (!scriptUrl) {
    return NextResponse.json({ ok: true, demo: true, state: demoState });
  }

  try {
    const upstream = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, payload }),
      cache: 'no-store',
    });
    const data = await readJsonSafely(upstream);
    const status = !upstream.ok ? 502 : data.ok === false ? 400 : 200;
    return NextResponse.json(data, { status });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'No se pudo conectar con Apps Script.' },
      { status: 502 },
    );
  }
}
