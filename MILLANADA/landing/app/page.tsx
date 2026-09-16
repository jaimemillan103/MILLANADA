'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import KahootForm from './KahootForm';
import PhotoLoop from './PhotoLoop';
import RsvpFlow from './RsvpFlow';
import { EVENT_DATE_ISO, schedule } from './data';

function getCountdown() {
  const distance = Math.max(new Date(EVENT_DATE_ISO).getTime() - Date.now(), 0);
  const day = 1000 * 60 * 60 * 24;
  const hour = 1000 * 60 * 60;
  const minute = 1000 * 60;
  return {
    days: Math.floor(distance / day),
    hours: Math.floor((distance % day) / hour),
    minutes: Math.floor((distance % hour) / minute),
  };
}

export default function Home() {
  const [countdown, setCountdown] = useState(() => getCountdown());

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(getCountdown()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="site-shell">
      <nav className="site-nav" aria-label="Navegación principal">
        <a className="nav-brand" href="#inicio" aria-label="Inicio de Millanada 2026">M26</a>
        <div className="nav-links">
          <a href="#recap">Recap 2024</a>
          <a className="nav-confirm" href="#confirmar">Confirmar</a>
          <a href="#kahoot">Kahoot</a>
        </div>
      </nav>

      <header id="inicio" className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Reunión familiar · Córdoba</span>
          <h1>MILLANADA <em>2026</em></h1>
          <p className="hero-lede">Un domingo entero en el chalet: el reencuentro familiar más esperado del año, buena comida y risas aseguradas.</p>
          <div className="hero-info">
            <span className="chip">📅 Domingo 11 de octubre</span>
            <span className="chip">🕜 Desde las 13:30</span>
            <span className="chip">🏡 Córdoba</span>
          </div>
          <a className="primary-cta" href="#confirmar">Confirmar asistencia</a>
          <div className="countdown" aria-label="Cuenta atrás para La Millanada">
            <span><b>{countdown.days}</b> días</span>
            <span><b>{countdown.hours}</b> horas</span>
            <span><b>{countdown.minutes}</b> min</span>
          </div>
        </div>

        <figure className="hero-photo-card">
          <Image
            src="/hero-millanada.webp"
            alt="Foto grupal de una edición anterior de La Millanada"
            fill
            priority
            sizes="(max-width: 760px) 94vw, 920px"
            className="hero-group-photo"
          />
        </figure>
      </header>

      <div className="highlights" aria-label="Claves del día">
        <article className="highlight-card orange"><span>🍽️</span><p>Comida en equipo: cada uno trae su plato asignado.</p></article>
        <article className="highlight-card green"><span>📸</span><p>Reencuentro de cuatro generaciones: va tocando renovar la foto grupal.</p></article>
        <article className="highlight-card red"><span>🎉</span><p>Actividades y juegos dinámicos: parte del plan es no aburrirse.</p></article>
      </div>

      <section id="recap" className="recap-section">
        <div className="section-head">
          <span className="eyebrow">Recap 2024</span>
          <h2>Recap 2024</h2>
          <p>La última (noviembre 2024) fue épica: comilona, sobremesa animada, juegos para todas las edades, espectáculo musical y teatral… y mucho más.</p>
        </div>
        <PhotoLoop />
        <p className="loop-hint">El carrusel se mueve solo y se pausa cuando pasas el ratón o interactúas con él.</p>
      </section>

      <section id="plan" className="plan-section">
        <div className="section-head plan-head">
          <span className="eyebrow">El plan</span>
          <h2>Desde la comida hasta que el cuerpo aguante.</h2>
          <p>Organigrama orientativo del día.</p>
        </div>
        <div className="timeline">
          {schedule.map((item) => (
            <article className="timeline-step" key={`${item.time}-${item.title}`}>
              <time>{item.time}</time>
              <p>{item.title}</p>
            </article>
          ))}
        </div>
      </section>

      <RsvpFlow />
      <KahootForm />

      <footer className="site-footer">MILLANADA 2026 · 11 de octubre · Córdoba · dudas o cambios, habladlo con Teresa</footer>
    </main>
  );
}
