import React from 'react';

const LegalLayout = ({ title, children }) => (
  <section style={{ padding: '7rem 1.5rem 4rem', maxWidth: '900px', margin: '0 auto' }}>
    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{title}</h1>
    <div style={{ lineHeight: 1.7, color: '#334155' }}>{children}</div>
  </section>
);

export default LegalLayout;
