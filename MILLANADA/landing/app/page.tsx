'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import RsvpFlow from './RsvpFlow';
import { EVENT_DATE_ISO, galleryItems, schedule } from './data';

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
      <div className="tile-rule" />

      <nav className="site-nav" aria-label="Navegación principal">
        <a className="nav-brand" href="#inicio">M26</a>
        <div className="nav-links">
          <a href="#fotos">Fotos</a>
          <a href="#plan">El día</a>
          <a className="nav-cta" href="#confirmar">Confirmar</a>
        </div>
      </nav>

      <header id="inicio" className="landing-hero">
        <div className="hero-photo-wrap" aria-hidden="true">
          <Image src="/hero-millanada.webp" alt="" fill priority sizes="100vw" className="hero-photo" />
          <div className="hero-photo-wash" />
        </div>
        <div className="hero-inner">
          <div className="eyebrow hero-eyebrow">Reunión familiar · Córdoba</div>
          <h1>MILLANADA <em>2026</em></h1>
          <p className="hero-lede">Un domingo entero en el jardín de los abuelos: toda la familia junta, buena mesa y tiempo de sobra.</p>
          <div className="hero-chips">
            <span className="info-chip">📅 Domingo 11 de octubre</span>
            <span className="info-chip">🕜 Desde las 13:30</span>
            <span className="info-chip">🏡 Córdoba</span>
          </div>
          <a className="hero-button" href="#confirmar">Confirmar quién venís →</a>
        </div>
        <div className="countdown-card" aria-label="Cuenta atrás para La Millanada">
          <span><strong>{countdown.days}</strong>días</span>
          <span><strong>{countdown.hours}</strong>horas</span>
          <span><strong>{countdown.minutes}</strong>min</span>
        </div>
      </header>

      <section className="intro-strip">
        <p><strong>Buena mesa.</strong> Cada rama trae algo.</p>
        <p><strong>Cuatro generaciones.</strong> Foto oficial incluida.</p>
        <p><strong>Gymkana, bingo y Kahoot.</strong> No hay escapatoria.</p>
      </section>

      <section id="fotos" className="photo-section">
        <div className="section-copy">
          <div className="eyebrow">Así fue la última</div>
          <h2>La Millanada ya tiene historia.</h2>
          <p>Un vistazo a la edición anterior: jardín, sobremesa, primos y la foto de familia que nunca puede faltar.</p>
        </div>
        <div className="photo-grid">
          {galleryItems.map((item, index) => (
            <figure className={`photo-card photo-card-${index + 1}`} key={item.src}>
              <Image src={item.src} alt={item.title} fill sizes="(max-width: 760px) 100vw, 40vw" />
              <figcaption><strong>{item.title}</strong><span>{item.caption}</span></figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section id="plan" className="plan-section">
        <div className="section-copy centered">
          <div className="eyebrow">El plan</div>
          <h2>Desde la comida hasta que aguantemos.</h2>
          <p>El horario sigue el plan maestro de la familia. Lo importante: llegar con hambre y no desaparecer antes del Kahoot.</p>
        </div>
        <div className="timeline">
          {schedule.map((item) => (
            <article className="timeline-row" key={`${item.time}-${item.title}`}>
              <time>{item.time}</time>
              <div><h3>{item.title}</h3><p>{item.detail}</p></div>
            </article>
          ))}
        </div>
      </section>

      <RsvpFlow />

      <footer className="site-footer">
        <strong>MILLANADA 2026</strong>
        <span>11 de octubre · Córdoba · dudas o cambios, habladlo con Teresa.</span>
      </footer>
    </main>
  );
}
