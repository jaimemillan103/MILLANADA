'use client';

import { useState } from 'react';
import type { KahootPayload } from './data';

type ApiEnvelope = {
  ok?: boolean;
  error?: string;
  demo?: boolean;
};

export default function KahootForm() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function submitKahoot() {
    const trimmedQuestion = question.trim();
    const trimmedAnswer = answer.trim();
    if (!trimmedQuestion || !trimmedAnswer) {
      setStatus('error');
      setMessage('Escribe una pregunta y su respuesta para poder usarla en el juego.');
      return;
    }

    const payload: KahootPayload = {
      question: trimmedQuestion,
      answer: trimmedAnswer,
      submittedAt: new Date().toISOString(),
    };

    setStatus('saving');
    setMessage('Enviando…');

    try {
      const response = await fetch('/api/millanada', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'kahoot', payload }),
      });
      const data = (await response.json()) as ApiEnvelope;
      if (!response.ok || data.ok === false) throw new Error(data.error || 'No se pudo guardar la pregunta.');
      setQuestion('');
      setAnswer('');
      setStatus('saved');
      setMessage('¡Pregunta guardada! Puedes mandar otra cuando quieras.');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'No se pudo guardar la pregunta.');
    }
  }

  return (
    <section id="kahoot" className="kahoot-section" aria-labelledby="kahoot-title">
      <div className="kahoot-card">
        <div className="section-head kahoot-head">
          <span className="eyebrow">Anónimo · puedes mandar las que quieras</span>
          <h2 id="kahoot-title">¿Se te ocurre una pregunta para el Kahoot?</h2>
          <p>Mándala aquí con la respuesta correcta. No hace falta haber confirmado asistencia antes.</p>
        </div>

        <div className="kahoot-fields">
          <label>
            <span>Pregunta</span>
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder='Ej. “¿Cómo me llamo? a) Lola b) Juan c) Teresa”'
            />
          </label>
          <label>
            <span>Respuesta <b className="req">· obligatoria</b></span>
            <input
              type="text"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Ej. Teresa (opción c)"
            />
          </label>
        </div>

        <button className="kahoot-button" type="button" onClick={submitKahoot} disabled={status === 'saving'}>
          {status === 'saving' ? 'Enviando…' : 'Enviar pregunta'}
        </button>
        {message && <p className={`kahoot-message ${status === 'error' ? 'is-error' : status === 'saved' ? 'is-saved' : ''}`}>{message}</p>}
      </div>
    </section>
  );
}
