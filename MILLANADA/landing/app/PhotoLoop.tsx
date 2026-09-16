/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { recapPhotos } from './data';

export default function PhotoLoop() {
  const [paused, setPaused] = useState(false);

  return (
    <div
      className={`photo-loop ${paused ? 'is-paused' : ''}`}
      aria-label="Recap fotográfico de La Millanada 2024"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onPointerDown={() => setPaused(true)}
      onPointerUp={() => setPaused(false)}
      onPointerCancel={() => setPaused(false)}
    >
      <div className="photo-loop-track">
        {[0, 1].map((copy) => (
          <div className="photo-loop-group" aria-hidden={copy === 1} key={copy}>
            {recapPhotos.map((photo, index) => (
              <figure className="loop-photo-card" key={`${copy}-${photo.id}`}>
                {/* img normal para poder servir las fotos directamente desde Google Drive */}
                <img src={photo.src} alt={copy === 0 ? photo.alt : ''} loading={index < 4 && copy === 0 ? 'eager' : 'lazy'} />
              </figure>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
