import React from 'react';

const LegalLayout = ({ title, children }) => (
  <section style={{ padding: '7rem 1.5rem 4rem', maxWidth: '900px', margin: '0 auto' }}>
    <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#0f172a', fontWeight: 700 }}>{title}</h1>
    <div
      className="legal-content"
      style={{ lineHeight: 1.7, color: '#334155' }}
    >
      <style>{`
        .legal-content h2 {
          font-size: 1.35rem;
          margin: 1.5rem 0 0.7rem;
          color: #0f172a;
          font-weight: 700;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 0.4rem;
        }
        .legal-content h3 {
          font-size: 1.05rem;
          margin: 1.2rem 0 0.45rem;
          color: #0f172a;
          font-weight: 700;
        }
        .legal-content p,
        .legal-content li {
          font-size: 1rem;
          margin-bottom: 0.7rem;
        }
        .legal-content ol,
        .legal-content ul {
          padding-left: 1.2rem;
        }
        .legal-content li {
          margin-bottom: 0.6rem;
        }
        .legal-content strong {
          color: #0f172a;
          font-weight: 700;
        }
      `}</style>
      {children}
    </div>
  </section>
);

export default LegalLayout;
