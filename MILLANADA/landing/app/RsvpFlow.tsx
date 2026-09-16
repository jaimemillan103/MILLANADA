'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  RSVP_CLOSE_ISO,
  RSVP_DEADLINE,
  dishGroups,
  type Person,
  type PublicState,
  type RsvpPayload,
} from './data';

type ApiEnvelope = {
  ok?: boolean;
  error?: string;
  demo?: boolean;
  state?: PublicState;
};

const emptyState: PublicState = {
  people: [],
  totalAttending: 0,
  dishClaims: {},
  updatedAt: null,
  closed: false,
};

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-ES')
    .trim();
}

function attendanceMapForBranch(branch: Person[]) {
  return Object.fromEntries(branch.map((member) => [member.id, member.confirmed])) as Record<string, boolean>;
}

export default function RsvpFlow() {
  const [publicState, setPublicState] = useState<PublicState>(emptyState);
  const [backendMode, setBackendMode] = useState<'checking' | 'live' | 'demo' | 'error'>('checking');
  const [query, setQuery] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<Person | null>(null);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [selectedDish, setSelectedDish] = useState('');
  const [notes, setNotes] = useState('');
  const [showOnlyFree, setShowOnlyFree] = useState(true);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [closedByClock, setClosedByClock] = useState(false);

  const isClosed = closedByClock || Boolean(publicState.closed);

  const loadPublicState = useCallback(async () => {
    try {
      const response = await fetch('/api/millanada?action=state', { cache: 'no-store' });
      const data = (await response.json()) as ApiEnvelope;
      if (!response.ok || data.ok === false) throw new Error(data.error || 'No se pudo cargar la organización.');
      setBackendMode(data.demo ? 'demo' : 'live');
      if (data.state) setPublicState(data.state);
    } catch {
      setBackendMode('error');
    }
  }, []);

  useEffect(() => {
    const refreshDeadline = () => setClosedByClock(Date.now() >= new Date(RSVP_CLOSE_ISO).getTime());
    refreshDeadline();
    const deadlineTimer = window.setInterval(refreshDeadline, 60_000);
    const first = window.setTimeout(loadPublicState, 0);
    const stateTimer = window.setInterval(loadPublicState, 12_000);
    return () => {
      window.clearInterval(deadlineTimer);
      window.clearTimeout(first);
      window.clearInterval(stateTimer);
    };
  }, [loadPublicState]);

  const matches = useMemo(() => {
    const needle = normalize(query);
    if (needle.length < 2 || selectedGuest) return [];
    return publicState.people
      .filter((person) => normalize(person.name).includes(needle))
      .slice(0, 10);
  }, [publicState.people, query, selectedGuest]);

  const branch = useMemo(() => {
    if (!selectedGuest) return [];
    return publicState.people.filter((person) => person.familia === selectedGuest.familia);
  }, [publicState.people, selectedGuest]);

  const selectedGuestCurrentDish = useMemo(() => {
    if (!selectedGuest) return '';
    for (const [dishName, carriers] of Object.entries(publicState.dishClaims)) {
      if (carriers.some((carrier) => carrier.searcherId === selectedGuest.id)) return dishName;
    }
    return '';
  }, [publicState.dishClaims, selectedGuest]);

  function chooseGuest(person: Person) {
    const nextBranch = publicState.people.filter((item) => item.familia === person.familia);
    setSelectedGuest(person);
    setQuery('');
    setAttendance(attendanceMapForBranch(nextBranch));

    let existingDish = '';
    for (const [dishName, carriers] of Object.entries(publicState.dishClaims)) {
      if (carriers.some((carrier) => carrier.searcherId === person.id)) {
        existingDish = dishName;
        break;
      }
    }
    setSelectedDish(existingDish);
    setNotes('');
    setStatus('idle');
    setMessage('');
  }

  function changeGuest() {
    setSelectedGuest(null);
    setQuery('');
    setAttendance({});
    setSelectedDish('');
    setNotes('');
    setStatus('idle');
    setMessage('');
  }

  function carriersOtherThanMe(dishName: string) {
    const carriers = publicState.dishClaims[dishName] || [];
    if (!selectedGuest) return carriers;
    return carriers.filter((carrier) => carrier.searcherId !== selectedGuest.id);
  }

  function dishIsTaken(dishName: string) {
    return carriersOtherThanMe(dishName).length > 0;
  }

  function dishTag(dishName: string) {
    if (selectedDish === dishName && selectedGuestCurrentDish === dishName) return 'tu plato actual';
    if (selectedDish === dishName) return 'seleccionado';
    const carriers = carriersOtherThanMe(dishName);
    if (!carriers.length) return 'libre';
    const names = carriers.slice(0, 2).map((carrier) => carrier.name).join(', ');
    return `ya lo trae ${names}${carriers.length > 2 ? ' y otros' : ''}`;
  }

  const anyAttending = branch.some((member) => Boolean(attendance[member.id]));

  async function submitRsvp() {
    if (!selectedGuest) return;
    if (isClosed) {
      setStatus('error');
      setMessage('Confirmaciones cerradas — habla con Teresa.');
      return;
    }
    if (anyAttending && !selectedDish) {
      setStatus('error');
      setMessage('Si viene alguien de vuestra rama, tenéis que elegir un plato antes de confirmar.');
      return;
    }
    if (selectedDish && dishIsTaken(selectedDish)) {
      setStatus('error');
      setMessage('Ese plato acaba de quedar ocupado. Elige otro y vuelve a confirmar.');
      await loadPublicState();
      return;
    }

    const payload: RsvpPayload = {
      searcherId: selectedGuest.id,
      searcherName: selectedGuest.name,
      familia: selectedGuest.familia,
      attendees: branch.map((member) => ({
        id: member.id,
        name: member.name,
        attending: Boolean(attendance[member.id]),
      })),
      dish: anyAttending ? selectedDish : '',
      notes: notes.trim(),
      submittedAt: new Date().toISOString(),
    };

    setStatus('saving');
    setMessage('Guardando…');

    try {
      const response = await fetch('/api/millanada', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rsvp', payload }),
      });
      const data = (await response.json()) as ApiEnvelope;
      if (!response.ok || data.ok === false) throw new Error(data.error || 'No se pudo guardar la confirmación.');
      if (data.state) setPublicState(data.state);
      setBackendMode(data.demo ? 'demo' : 'live');
      setStatus('saved');
      setMessage('Confirmación guardada.');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'No se pudo guardar. Prueba otra vez en unos segundos.');
    }
  }

  const selectedAttendingNames = branch.filter((member) => attendance[member.id]).map((member) => member.name);

  return (
    <section id="confirmar" className="confirm-section" aria-labelledby="confirm-title">
      <div className="section-head confirm-head">
        <span className="eyebrow">Confirmaciones · hasta el {RSVP_DEADLINE}</span>
        <h2 id="confirm-title">Confirmaciones</h2>
        <p>Busca tu nombre (si hay varios, elige el que vaya con los apellidos de tu familia), marca quién viene de vuestra rama y elegid qué vais a traer.</p>
      </div>

      {isClosed && (
        <div className="status-banner error-banner" role="status">
          <strong>Confirmaciones cerradas — habla con Teresa.</strong>
          <span>La información sigue visible, pero ya no se puede modificar desde la web.</span>
        </div>
      )}
      {backendMode === 'error' && (
        <div className="status-banner error-banner" role="status">No podemos conectar ahora mismo con la hoja de organización. Prueba de nuevo en unos segundos.</div>
      )}
      {backendMode === 'demo' && (
        <div className="status-banner demo-banner" role="status">Modo de prueba: falta conectar el Apps Script de la hoja «organización».</div>
      )}

      <div className="confirm-column">
        <section className="conf-card">
          <div className="step-label"><span className="step-num">1</span><span className="step-title">Nombre de quien está rellenando el cuestionario</span></div>
          <p className="step-sub">Escribe tu nombre. Si se repite en la familia, verás también la rama para elegir bien.</p>

          {!selectedGuest ? (
            <div className="search-wrap">
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={backendMode === 'checking' ? 'Cargando nombres…' : 'Empieza a escribir tu nombre…'}
                autoComplete="off"
                disabled={backendMode === 'checking' || backendMode === 'error'}
                aria-label="Buscar nombre"
              />
              {matches.length > 0 && (
                <div className="search-results">
                  {matches.map((person) => (
                    <button type="button" className="result-row" key={person.id} onClick={() => chooseGuest(person)}>
                      <span>{person.name}</span><span className="result-fam">{person.familia}</span>
                    </button>
                  ))}
                </div>
              )}
              {normalize(query).length >= 2 && matches.length === 0 && backendMode === 'live' && (
                <p className="search-empty">No aparece ese nombre. Prueba solo con el nombre de pila.</p>
              )}
            </div>
          ) : (
            <div className="me-badge">
              <span><strong>{selectedGuest.name}</strong> · {selectedGuest.familia}</span>
              <button type="button" onClick={changeGuest}>cambiar</button>
            </div>
          )}
        </section>

        {selectedGuest && status !== 'saved' && (
          <>
            <section className="conf-card">
              <div className="step-label"><span className="step-num">2</span><span className="step-title">¿Quién de vuestro grupo viene?</span></div>
              <p className="step-sub">Aparecen marcados quienes ya constan como confirmados. Toca cualquier fila para cambiarlo.</p>
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
                    {member.confirmed && <span className="status-tag confirmado">CONFIRMADO</span>}
                  </label>
                ))}
              </div>
            </section>

            <section className="conf-card">
              <div className="step-label"><span className="step-num">3</span><span className="step-title">¿Qué plato podéis traer?</span></div>
              <p className="step-sub">{anyAttending ? <>Obligatorio si viene alguien de vuestra rama <span className="req">· elegid uno</span></> : 'Como no hay nadie marcado, no hace falta elegir plato.'}</p>

              <div className="dish-toolbar">
                <label className="free-toggle">
                  <input type="checkbox" checked={showOnlyFree} onChange={(event) => setShowOnlyFree(event.target.checked)} />
                  <span className="switch-ui" aria-hidden="true" />
                  Mostrar solo libres
                </label>
              </div>

              <div className="dish-area">
                {dishGroups.map((group) => {
                  const visibleItems = group.items.filter((item) => !showOnlyFree || !dishIsTaken(item.name) || selectedDish === item.name);
                  if (!visibleItems.length) return null;
                  return (
                    <details className="dish-category" key={`${selectedGuest.id}-${group.category}`}>
                      <summary className={`cat-head ${group.className}`}>
                        <span>{group.category}</span><span className="chevron">⌄</span>
                      </summary>
                      {group.note && <p className="cat-note">{group.note}</p>}
                      <div className="dish-grid">
                        {visibleItems.map((item) => {
                          const taken = dishIsTaken(item.name);
                          const selected = selectedDish === item.name;
                          return (
                            <button
                              type="button"
                              key={item.name}
                              className={`dish ${taken ? 'taken' : ''} ${selected ? 'selected' : ''}`}
                              disabled={isClosed || (taken && !selected)}
                              onClick={() => setSelectedDish(selected ? '' : item.name)}
                            >
                              <span className="dish-main"><span className="dnum">#{item.num}</span><span className="dname">{item.name}</span></span>
                              <span className="dqty">{item.qty}</span>
                              <span className="dtag">{dishTag(item.name)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </details>
                  );
                })}
              </div>

              <div className="notes-block">
                <label htmlFor="rsvp-notes">¿Algo más que debamos saber? <span>opcional</span></label>
                <textarea
                  id="rsvp-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  disabled={isClosed}
                  placeholder="Alergias, silla para niños, hora aproximada de llegada…"
                />
              </div>
            </section>

            <button className="confirm-button" type="button" onClick={submitRsvp} disabled={isClosed || status === 'saving'}>
              {status === 'saving' ? 'Guardando…' : 'Confirmar asistencia'}
            </button>
            {message && <p className={`submit-msg ${status === 'error' ? 'is-error' : ''}`}>{message}</p>}
          </>
        )}

        {selectedGuest && status === 'saved' && (
          <section className="conf-card confirm-result" aria-live="polite">
            <div className="confirm-icon">✓</div>
            <h3>¡Guardado!</h3>
            <p>{selectedAttendingNames.length ? <>Vienen: <strong>{selectedAttendingNames.join(', ')}</strong>.</> : 'Habéis indicado que no viene nadie de esta rama.'}</p>
            {selectedDish && <p>Plato: <strong>{selectedDish}</strong>.</p>}
            {notes.trim() && <p>También hemos guardado vuestra nota.</p>}
            <button type="button" className="secondary-button" onClick={() => setStatus('idle')}>Modificar esta respuesta</button>
          </section>
        )}
      </div>

      {backendMode === 'live' && <p className="live-counter"><strong>{publicState.totalAttending}</strong> personas constan ahora mismo como confirmadas.</p>}
    </section>
  );
}
