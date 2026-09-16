'use client';

import { useEffect, useState } from 'react';
import { EVENT_DATE_ISO } from './data';

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

export default function Countdown() {
  const [countdown, setCountdown] = useState(() => getCountdown());

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(getCountdown()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="countdown" aria-label="Cuenta atrás para La Millanada">
      <span><b>{countdown.days}</b> días</span>
      <span><b>{countdown.hours}</b> horas</span>
      <span><b>{countdown.minutes}</b> min</span>
    </div>
  );
}
