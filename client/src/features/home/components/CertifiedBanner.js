import React from 'react';
import './CertifiedBanner.css';

const CertifiedBanner = () => {
  return (
    <div className="certified-banner" role="note" aria-live="polite">
      <div className="container certified-banner__inner">
        <p className="certified-banner__text">Todos nuestros productos están certificados, pídelo en tu compra <span className="certified-banner__check">✓</span></p>
      </div>
    </div>
  );
};

export default CertifiedBanner;
