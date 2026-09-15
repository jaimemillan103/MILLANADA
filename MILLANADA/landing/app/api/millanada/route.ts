import { env } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';

const cloudflareEnv = env as unknown as Record<string, string | undefined>;
const scriptUrl = (cloudflareEnv.MILLANADA_SCRIPT_URL || process.env.MILLANADA_SCRIPT_URL || '').trim();

const demoState = {
  totalAttending: 0,
  dishCounts: {},
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

function demoGet(action: string) {
  if (action === 'rsvp') return NextResponse.json({ ok: true, demo: true, rsvp: null });
  return NextResponse.json({ ok: true, demo: true, state: demoState });
}

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get('action') || 'state';
  const searcherId = request.nextUrl.searchParams.get('searcherId') || '';

  if (!scriptUrl) return demoGet(action);

  const upstreamUrl = new URL(scriptUrl);
  upstreamUrl.searchParams.set('action', action);
  if (searcherId) upstreamUrl.searchParams.set('searcherId', searcherId);

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
  const payload = await request.json();

  if (!scriptUrl) {
    return NextResponse.json({ ok: true, demo: true, state: demoState });
  }

  try {
    const upstream = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'submit', payload }),
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
