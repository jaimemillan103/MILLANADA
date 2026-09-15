'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  RSVP_CLOSE_ISO,
  RSVP_DEADLINE,
  dishGroups,
  dishNames,
  guests,
  type Attendee,
  type Guest,
  type GuestAge,
  type PublicState,
  type RsvpPayload,
} from './data';

type ExtraGuest = {
  id: string;
  name: string;
  age: GuestAge;
};

type ApiEnvelope = {
  ok?: boolean;
  error?: string;
  demo?: boolean;
  state?: PublicState;
  rsvp?: RsvpPayload | null;
};

const emptyState: PublicState = {
  totalAttending: 0,
  dishCounts: {},
  updatedAt: null,
  closed: false,
};

const DEMO_KEY = 'millanada-rsvps-v2';

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-ES')
    .trim();
}

function readDemoRsvps(): RsvpPayload[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(DEMO_KEY) ?? '[]') as RsvpPayload[];
  } catch {
    return [];
  }
}

function writeDemoRsvp(payload: RsvpPayload) {
  const current = readDemoRsvps().filter((item) => item.searcherId !== payload.searcherId);
  current.push(payload);
  window.localStorage.setItem(DEMO_KEY, JSON.stringify(current));
}

function buildDemoState(): PublicState {
  const all = readDemoRsvps();
  const dishCounts: PublicState['dishCounts'] = {};
  let totalAttending = 0;

  all.forEach((rsvp) => {
    rsvp.attendees.forEach((attendee) => {
      if (!attendee.attending) return;
      totalAttending += 1;
      attendee.dishes.forEach((dishName) => {
        dishCounts[dishName] ??= [];
        dishCounts[dishName].push({
          name: attendee.name,
          familia: rsvp.familia,
          searcherId: rsvp.searcherId,
        });
      });
    });
  });

  const latest = [...all].sort((a, b) => a.updatedAt.localeCompare(b.updatedAt)).at(-1);
  return {
    totalAttending,
    dishCounts,
    updatedAt: latest?.updatedAt ?? null,
    closed: Date.now() >= new Date(RSVP_CLOSE_ISO).getTime(),
  };
}

function makeDefaultAttendance(branch: Guest[], checked: boolean) {
  return Object.fromEntries(branch.map((member) => [member.id, checked])) as Record<string, boolean>;
}

export default function RsvpFlow() {
  const [query, setQuery] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [branch, setBranch] = useState<Guest[]>([]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [extras, setExtras] = useState<ExtraGuest[]>([]);
  const [selectedDishes, setSelectedDishes] = useState<Set<string>>(new Set());
  const [otherDish, setOtherDish] = useState('');
  const [notes, setNotes] = useState('');
  const [kahootQuestion, setKahootQuestion] = useState('');
  const [publicState, setPublicState] = useState<PublicState>(emptyState);
  const [backendMode, setBackendMode] = useState<'checking' | 'live' | 'demo' | 'error'>('checking');
  const [savedStatus, setSavedStatus] = useState<'idle' | 'loading' | 'saving' | 'saved' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [savedPayload, setSavedPayload] = useState<RsvpPayload | null>(null);
  const [hasSavedRsvp, setHasSavedRsvp] = useState<boolean | null>(null);
  const [closedByClock, setClosedByClock] = useState(false);

  const isClosed = closedByClock || Boolean(publicState.closed);

  useEffect(() => {
    const refreshDeadline = () => setClosedByClock(Date.now() >= new Date(RSVP_CLOSE_ISO).getTime());
    refreshDeadline();
    const timer = window.setInterval(refreshDeadline, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const loadPublicState = useCallback(async () => {
    try {
      const response = await fetch('/api/millanada?action=state', { cache: 'no-store' });
      const data = (await response.json()) as ApiEnvelope;
      if (!response.ok || data.ok === false) throw new Error(data.error || 'No se pudo leer el reparto.');

      if (data.demo) {
        setBackendMode('demo');
        setPublicState(buildDemoState());
        return;
      }

      setBackendMode('live');
      if (data.state) setPublicState(data.state);
    } catch {
      setBackendMode('error');
    }
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(loadPublicState, 0);
    const timer = window.setInterval(loadPublicState, 8_000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, [loadPublicState]);

  const matches = useMemo(() => {
    const normalized = normalize(query);
    if (normalized.length < 2 || selectedGuest) return [];
    return guests
      .filter((guest) => normalize(guest.name).includes(normalized))
      .slice(0, 8);
  }, [query, selectedGuest]);

  const resetFormForGuest = useCallback((guest: Guest) => {
    const nextBranch = guests.filter((item) => item.familia === guest.familia);
    setBranch(nextBranch);
    setAttendance(makeDefaultAttendance(nextBranch, !isClosed));
    setExtras([]);
    setSelectedDishes(new Set());
    setOtherDish('');
    setNotes('');
    setKahootQuestion('');
    setSavedPayload(null);
    setHasSavedRsvp(null);
    setSavedStatus('loading');
    setMessage('Buscando si ya habíais respondido…');
  }, [isClosed]);

  const applySavedRsvp = useCallback((rsvp: RsvpPayload | null, fallbackBranch: Guest[]) => {
    if (!rsvp) {
      setAttendance(makeDefaultAttendance(fallbackBranch, !isClosed));
      setHasSavedRsvp(false);
      setSavedStatus('idle');
      setMessage(isClosed ? 'No hay una confirmación guardada para este nombre.' : '');
      return;
    }

    const attendanceMap = makeDefaultAttendance(fallbackBranch, false);
    const branchIds = new Set(fallbackBranch.map((member) => member.id));
    const nextExtras: ExtraGuest[] = [];

    rsvp.attendees.forEach((attendee) => {
      if (branchIds.has(attendee.id)) {
        attendanceMap[attendee.id] = Boolean(attendee.attending);
      } else if (attendee.extra) {
        nextExtras.push({
          id: attendee.id,
          name: attendee.name,
          age: (['Adulto', 'Joven adulto', 'Niño/a'].includes(attendee.age) ? attendee.age : 'Adulto') as GuestAge,
        });
      }
    });

    const knownDishes = new Set(dishNames);
    setAttendance(attendanceMap);
    setExtras(nextExtras);
    setSelectedDishes(new Set(rsvp.dishSelection.filter((dish) => knownDishes.has(dish))));
    setOtherDish(rsvp.otherDish || '');
    setNotes(rsvp.notes || '');
    setKahootQuestion(rsvp.kahootQuestion || '');
    setSavedPayload(rsvp);
    setHasSavedRsvp(true);
    setSavedStatus('idle');
    setMessage(isClosed ? 'Esta es la última respuesta guardada.' : 'Hemos recuperado vuestra respuesta anterior. Podéis cambiarla y volver a guardar.');
  }, [isClosed]);

  async function chooseGuest(guest: Guest) {
    setSelectedGuest(guest);
    setQuery('');
    resetFormForGuest(guest);
    const nextBranch = guests.filter((item) => item.familia === guest.familia);

    try {
      const response = await fetch(`/api/millanada?action=rsvp&searcherId=${encodeURIComponent(guest.id)}`, { cache: 'no-store' });
      const data = (await response.json()) as ApiEnvelope;
      if (!response.ok || data.ok === false) throw new Error(data.error || 'No se pudo recuperar la respuesta.');

      if (data.demo) {
        setBackendMode('demo');
        const local = readDemoRsvps().find((item) => item.searcherId === guest.id) ?? null;
        applySavedRsvp(local, nextBranch);
        return;
      }

      setBackendMode('live');
      applySavedRsvp(data.rsvp ?? null, nextBranch);
    } catch (error) {
      setHasSavedRsvp(false);
      setSavedStatus('error');
      setMessage(error instanceof Error ? error.message : 'No se pudo recuperar la respuesta anterior.');
    }
  }

  function changeGuest() {
    setSelectedGuest(null);
    setQuery('');
    setBranch([]);
    setAttendance({});
    setExtras([]);
    setSelectedDishes(new Set());
    setOtherDish('');
    setNotes('');
    setKahootQuestion('');
    setSavedPayload(null);
    setHasSavedRsvp(null);
    setSavedStatus('idle');
    setMessage('');
  }

  function addExtra() {
    if (isClosed || !selectedGuest) return;
    const id = `x-${selectedGuest.id}-${Date.now()}-${extras.length}`;
    setExtras((current) => [...current, { id, name: '', age: 'Adulto' }]);
  }

  function updateExtra(id: string, patch: Partial<ExtraGuest>) {
    setExtras((current) => current.map((extra) => (extra.id === id ? { ...extra, ...patch } : extra)));
  }

  function removeExtra(id: string) {
    if (isClosed) return;
    setExtras((current) => current.filter((extra) => extra.id !== id));
  }

  function toggleDish(name: string) {
    if (isClosed) return;
    setSelectedDishes((current) => {
      const next = new Set(current);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function dishTag(name: string) {
    if (selectedDishes.has(name)) return 'vosotros lo traéis';
    const carriers = publicState.dishCounts[name] || [];
    if (!carriers.length) return 'libre';
    const names = carriers.slice(0, 2).map((carrier) => carrier.name).join(', ');
    return `ya lo trae ${names}${carriers.length > 2 ? ' y otros' : ''}`;
  }

  function makePayload(): RsvpPayload | null {
    if (!selectedGuest) return null;

    const attendees: Attendee[] = branch.map((member) => ({
      id: member.id,
      name: member.name,
      age: member.age,
      attending: Boolean(attendance[member.id]),
      extra: false,
      dishes: [],
    }));

    extras
      .filter((extra) => extra.name.trim())
      .forEach((extra) => {
        attendees.push({
          id: extra.id,
          name: extra.name.trim(),
          age: extra.age,
          attending: true,
          extra: true,
          dishes: [],
        });
      });

    const canonicalDishes = Array.from(selectedDishes);
    const trimmedOtherDish = otherDish.trim();
    const dishSelection = trimmedOtherDish ? [...canonicalDishes, trimmedOtherDish] : canonicalDishes;
    const carrier = attendees.find((attendee) => attendee.id === selectedGuest.id && attendee.attending)
      ?? attendees.find((attendee) => attendee.attending);
    if (carrier) carrier.dishes = dishSelection;

    return {
      searcherId: selectedGuest.id,
      searcherName: selectedGuest.name,
      familia: selectedGuest.familia,
      attendees,
      dishSelection,
      otherDish: trimmedOtherDish,
      notes: notes.trim(),
      kahootQuestion: kahootQuestion.trim(),
      updatedAt: new Date().toISOString(),
    };
  }

  async function submitRsvp() {
    if (isClosed) {
      setSavedStatus('error');
      setMessage('Confirmaciones cerradas — habla con Teresa.');
      return;
    }

    const payload = makePayload();
    if (!payload) return;

    setSavedStatus('saving');
    setMessage('Guardando…');

    try {
      const response = await fetch('/api/millanada', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as ApiEnvelope;
      if (!response.ok || data.ok === false) throw new Error(data.error || 'No se ha podido guardar.');

      if (data.demo) {
        writeDemoRsvp(payload);
        setBackendMode('demo');
        setPublicState(buildDemoState());
      } else {
        setBackendMode('live');
        if (data.state) setPublicState(data.state);
      }

      setSavedPayload(payload);
      setHasSavedRsvp(true);
      setSavedStatus('saved');
      setMessage(data.demo ? 'Guardado solo en este navegador porque falta conectar Google Sheets.' : 'Guardado en Google Sheets.');
    } catch (error) {
      setSavedStatus('error');
      setMessage(error instanceof Error ? error.message : 'No se ha podido guardar, prueba otra vez en unos segundos.');
    }
  }

  const attendingNames = savedPayload?.attendees.filter((attendee) => attendee.attending).map((attendee) => attendee.name) ?? [];
  const summaryDishes = savedPayload?.dishSelection ?? [];

  return (
    <section id="confirmar" className="rsvp-wrap" aria-labelledby="rsvp-heading">
      <div className="rsvp-heading-block">
        <div className="eyebrow">Confirmaciones · hasta el {RSVP_DEADLINE}</div>
        <h2 id="rsvp-heading">¿Quién viene y qué traéis?</h2>
        <p>Buscad un nombre de vuestra rama y dejadlo todo resuelto en un minuto.</p>
      </div>

      {isClosed && (
        <div className="closed-banner" role="status">
          <strong>Confirmaciones cerradas — habla con Teresa.</strong>
          <span>Podéis consultar lo que quedó guardado, pero ya no se puede modificar desde la web.</span>
        </div>
      )}

      {backendMode === 'demo' && (
        <div className="backend-banner warning" role="status">
          <strong>Modo prueba:</strong> la web funciona, pero todavía no está enlazada con el Google Sheet en este entorno.
        </div>
      )}

      {backendMode === 'error' && (
        <div className="backend-banner error" role="status">
          No hemos podido leer el estado del reparto. Puedes seguir consultando la página y volver a intentarlo en unos segundos.
        </div>
      )}

      <div className="rsvp-column">
        <section className="rsvp-card">
          <div className="step-label"><span className="step-num">1</span><span className="step-title">Buscad vuestro nombre</span></div>
          <div className="step-sub">Escribid quién de vosotros rellena esto — luego confirmáis por toda vuestra rama de la familia.</div>

          {!selectedGuest ? (
            <div className="search-wrap">
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Empieza a escribir tu nombre…"
                autoComplete="off"
                aria-label="Buscar nombre"
              />
              {matches.length > 0 && (
                <div className="search-results">
                  {matches.map((guest) => (
                    <button type="button" className="result-row" key={guest.id} onClick={() => chooseGuest(guest)}>
                      <span>{guest.name}</span><span className="result-fam">{guest.familia}</span>
                    </button>
                  ))}
                </div>
              )}
              {normalize(query).length >= 2 && matches.length === 0 && (
                <p className="search-empty">No aparece ese nombre. Prueba solo con el nombre de pila.</p>
              )}
            </div>
          ) : (
            <div className="me-badge">
              <span>Rellenando como {selectedGuest.name} · {selectedGuest.familia}</span>
              <button type="button" onClick={changeGuest}>cambiar</button>
            </div>
          )}
        </section>

        {selectedGuest && savedStatus !== 'saved' && (
          <>
            <section className="rsvp-card">
              <div className="step-label"><span className="step-num">2</span><span className="step-title">¿Quién de vuestro grupo viene?</span></div>
              <div className="step-sub">Están marcados todos por defecto — desmarcad quien no pueda venir, y añadid a quien falte en la lista.</div>

              <div className="member-list">
                {branch.map((member) => (
                  <label className="member-row" key={member.id}>
                    <input
                      type="checkbox"
                      checked={Boolean(attendance[member.id])}
                      disabled={isClosed}
                      onChange={(event) => setAttendance((current) => ({ ...current, [member.id]: event.target.checked }))}
                    />
                    <span className="member-copy">
                      <span className="member-name">{member.name}</span>
                      <span className="member-age">{member.age}</span>
                    </span>
                  </label>
                ))}
              </div>

              <div className="extra-list">
                {extras.map((extra) => (
                  <div className="extra-row" key={extra.id}>
                    <input
                      type="text"
                      value={extra.name}
                      readOnly={isClosed}
                      placeholder="Nombre"
                      onChange={(event) => updateExtra(extra.id, { name: event.target.value })}
                    />
                    <select value={extra.age} disabled={isClosed} onChange={(event) => updateExtra(extra.id, { age: event.target.value as GuestAge })}>
                      <option>Adulto</option>
                      <option>Joven adulto</option>
                      <option>Niño/a</option>
                    </select>
                    {!isClosed && <button type="button" aria-label={`Quitar ${extra.name || 'acompañante'}`} onClick={() => removeExtra(extra.id)}>✕</button>}
                  </div>
                ))}
              </div>

              {!isClosed && <button className="add-btn" type="button" onClick={addExtra}>+ Añadir a alguien más de la familia</button>}
            </section>

            <section className="rsvp-card">
              <div className="step-label"><span className="step-num">3</span><span className="step-title">¿Qué plato podéis traer?</span></div>
              <div className="step-sub">Este es el reparto ya pensado para el menú (~30 personas). Si algo está en rojo es que alguien lo ha apuntado ya — elegid otra cosa si podéis. Podéis marcar más de un plato.</div>

              <div className="dish-area">
                {dishGroups.map((group) => (
                  <div className="cat-block" key={group.category}>
                    <div className={`cat-head ${group.className}`}>{group.category}</div>
                    {group.note && <div className="cat-note">{group.note}</div>}
                    <div className="dish-grid">
                      {group.items.map((item) => {
                        const selected = selectedDishes.has(item.name);
                        const taken = !selected && (publicState.dishCounts[item.name] || []).length > 0;
                        return (
                          <button
                            type="button"
                            disabled={isClosed}
                            className={`dish ${selected ? 'selected' : ''} ${taken ? 'taken' : ''}`}
                            key={item.num}
                            onClick={() => toggleDish(item.name)}
                          >
                            <span className="dnum">Nº {item.num}</span>
                            <span className="dname">{item.name}</span>
                            <span className="dqty">{item.qty}</span>
                            <span className="dtag">{dishTag(item.name)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="other-row">
                <input
                  type="text"
                  value={otherDish}
                  readOnly={isClosed}
                  onChange={(event) => setOtherDish(event.target.value)}
                  placeholder="Otro plato que se os ocurra…"
                />
              </div>
            </section>

            <section className="rsvp-card">
              <div className="step-label"><span className="step-num">4</span><span className="step-title">Algo más</span></div>
              <div className="step-sub">Alergias, si lleváis silla para peques, hora aproximada de llegada… lo que sea útil (opcional).</div>
              <textarea
                value={notes}
                readOnly={isClosed}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Escribe aquí si hace falta…"
              />
            </section>

            <section className="rsvp-card kahoot-card">
              <div className="step-label"><span className="step-num">5</span><span className="step-title">¿Se te ocurre una pregunta para el Kahoot de esa noche? 🎯</span></div>
              <div className="step-sub">Cada respuesta suma una pregunta al concurso familiar. Es opcional, pero nos viene fenomenal.</div>
              <textarea
                value={kahootQuestion}
                readOnly={isClosed}
                onChange={(event) => setKahootQuestion(event.target.value)}
                placeholder="Escribe aquí tu pregunta (y su respuesta, si quieres)…"
              />

              {!isClosed && (
                <button className="submit-rsvp" type="button" disabled={savedStatus === 'saving' || savedStatus === 'loading'} onClick={submitRsvp}>
                  {savedStatus === 'saving' ? 'Guardando…' : 'Confirmar asistencia'}
                </button>
              )}
              {message && <div className={`submit-msg ${savedStatus === 'error' ? 'is-error' : ''}`}>{message}</div>}
            </section>
          </>
        )}

        {selectedGuest && savedStatus === 'saved' && savedPayload && (
          <section className="rsvp-card confirm-card">
            <div className="confirm-flower">🌸</div>
            <div className="confirm-big">¡Apuntado, gracias!</div>
            <div className="confirm-summary">
              <p><strong>Vienen:</strong> {attendingNames.length ? attendingNames.join(', ') : 'nadie por ahora'}.</p>
              <p><strong>Traéis:</strong> {summaryDishes.length ? summaryDishes.join(', ') : 'nada apuntado todavía'}.</p>
              {savedPayload.kahootQuestion && <p><strong>Pregunta para el Kahoot:</strong> {savedPayload.kahootQuestion}</p>}
            </div>
            <div className="saved-note">{message}</div>
            <button className="edit-again" type="button" onClick={() => setSavedStatus('idle')}>Editar mi respuesta</button>
          </section>
        )}
      </div>

      <div className="live-counter" aria-live="polite">
        {publicState.totalAttending > 0
          ? <><b>{publicState.totalAttending}</b> personas confirmadas hasta ahora</>
          : 'Todavía no hay confirmaciones guardadas.'}
      </div>

      {selectedGuest && hasSavedRsvp === false && isClosed && (
        <p className="readonly-note">No había una respuesta guardada para {selectedGuest.name}; por eso no hay datos que consultar.</p>
      )}
    </section>
  );
}
