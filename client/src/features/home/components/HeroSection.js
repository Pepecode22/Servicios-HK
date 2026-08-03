import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './HeroSection.css';

const SLIDES = [
  {
    id: 1,
    bgImage: '/Assets/Epp.jpg',
    label: 'Equipamiento de Protección Personal',
  },
  {
    id: 2,
    bgImage: '/Assets/Entrega.png',
    label: 'Entregando Confianza',
  },
  {
    id: 3,
    bgImage: '/Assets/bodega.jpg',
    label: 'Variedad de Productos',
  },
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % SLIDES.length);
  }, []);

  const prev = () => {
    setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length);
  };

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, paused]);

  return (
    <section
      className="hero"
      aria-label="Sección principal"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Mensaje con frosted glass — SOBRE el carrusel */}
      <div className="hero__welcome-wrapper">
        <div className="hero__glass">
          <p className="hero__glass-eyebrow">Bienvenidos a</p>
          <h1 className="hero__glass-title">Servicios HK</h1>
          <p className="hero__glass-subtitle">
            Proveemos EPP, artículos de aseo e industrial<br className="hide-mobile" />
            con calidad y respaldo para tu empresa.
          </p>
          <div className="hero__glass-actions">
            <Link to="/catalogo" className="btn-primary">
              Ver catálogo
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
            <Link to="/contacto" className="btn-outline hero__btn-outline">
              Contáctanos
            </Link>
          </div>
        </div>
      </div>

      {/* Carrusel */}
      <div className="hero__carousel" aria-hidden="true">
        {SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`hero__slide ${index === current ? 'hero__slide--active' : ''}`}
            style={{ backgroundImage: `url(${slide.bgImage})` }}
          >
            {/* Patrón decorativo */}
            <div className="hero__slide-pattern"></div>
            <div className="hero__slide-overlay"></div>
          </div>
        ))}
      </div>

      {/* Controles */}
      <div className="hero__controls">
        <button className="hero__arrow hero__arrow--prev" onClick={prev} aria-label="Diapositiva anterior">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div className="hero__dots" role="tablist" aria-label="Diapositivas">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={`hero__dot ${i === current ? 'hero__dot--active' : ''}`}
              onClick={() => setCurrent(i)}
              role="tab"
              aria-selected={i === current}
              aria-label={`Diapositiva ${i + 1}`}
            />
          ))}
        </div>
        <button className="hero__arrow hero__arrow--next" onClick={next} aria-label="Siguiente diapositiva">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      {/* Scroll indicator */}
      <div className="hero__scroll-hint" aria-hidden="true">
        <span>Explorar</span>
        <div className="hero__scroll-line"></div>
      </div>
    </section>
  );
};

export default HeroSection;
