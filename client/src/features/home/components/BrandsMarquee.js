import React from 'react';
import './BrandsMarquee.css';

// Logos reales desde public/Brands/
const BRANDS = [
  { name: '3M', logo: '/Brands/3m.png' },
  { name: 'AIR', logo: '/Brands/AIR.png' },
  { name: 'Libus', logo: '/Brands/libus.png' },
  { name: 'MasProt', logo: '/Brands/masprot.png' },
  { name: 'SteelPro', logo: '/Brands/steelpro.png' },
];

const BrandCard = ({ name, logo }) => (
  <div className="brand-card" aria-label={`Marca: ${name}`}>
    <div className="brand-card__logo">
      <img src={logo} alt={name} />
    </div>
  </div>
);

const BrandsMarquee = () => {
  // Duplicamos el array para el efecto infinito
  const doubled = [...BRANDS, ...BRANDS];

  return (
    <section className="brands section" aria-labelledby="brands-title">
      <div className="container">
        <div className="brands__header">
          <p className="brands__eyebrow">Trabajamos con</p>
          <h2 id="brands-title" className="section-title">Marcas de confianza</h2>
        </div>
      </div>

      <div className="brands__marquee-wrapper" aria-hidden="true">
        <div className="brands__marquee">
          <div className="brands__track">
            {doubled.map((brand, i) => (
              <BrandCard key={i} name={brand.name} logo={brand.logo} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandsMarquee;
