import React from 'react';
import './WhyUsSection.css';

const REASONS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      </svg>
    ),
    title: 'Calidad Certificada',
    desc: 'Todos nuestros productos cumplen con normas NCh e internacionales de seguridad industrial.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    ),
    title: 'Entrega Rápida',
    desc: 'Despacho a todo Chile con opciones express y seguimiento en tiempo real de tu pedido.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    ),
    title: 'Asesoría Especializada',
    desc: 'Nuestro equipo te orienta en la selección correcta según la normativa vigente y tu industria.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"/>
      </svg>
    ),
    title: 'Cotización Sin Compromiso',
    desc: 'Solicita tu cotización online de forma rápida y gratuita. Respondemos en menos de 24 horas.',
  },
];

const WhyUsSection = () => {
  return (
    <section className="why-us section" aria-labelledby="why-us-title">
      <div className="container">
        <div className="why-us__header">
          <p className="why-us__eyebrow">¿Por qué elegirnos?</p>
          <h2 id="why-us-title" className="section-title">Somos más que un proveedor</h2>
          <p className="section-subtitle why-us__subtitle">
            Más de 10 años de experiencia en el mercado industrial chileno respaldan nuestro compromiso.
          </p>
        </div>

        <div className="why-us__grid">
          {REASONS.map((reason, index) => (
            <article
              key={index}
              className="why-us__card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="why-us__card-icon" aria-hidden="true">
                {reason.icon}
              </div>
              <h3 className="why-us__card-title">{reason.title}</h3>
              <p className="why-us__card-desc">{reason.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
