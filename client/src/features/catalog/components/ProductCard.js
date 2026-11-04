import React, { useState } from 'react';
import { useCart } from '../../../shared/context/CartContext';
import './ProductCard.css';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

const ProductCard = ({ product, onOpenModal }) => {
  const { addItem, items } = useCart();
  const inCart = items.some((item) => item.id === product.id);
  const [imageFailed, setImageFailed] = useState(false);

  const imageSrc = product.imagen && !imageFailed
    ? `${API_BASE}/products/${product.id}/image`
    : null;

  const handleImageClick = () => {
    onOpenModal({ ...product, _imgSrc: imageSrc });
  };

  return (
    <article className="product-card" aria-label={product.nombre}>
      <p className="product-card__category">{product.categoria}</p>

      {/* Imagen ─ clickeable para abrir modal */}
      <div
        className={`product-card__image-wrapper ${imageSrc ? 'product-card__image-wrapper--clickable' : ''}`}
        onClick={imageSrc ? handleImageClick : undefined}
        role={imageSrc ? 'button' : undefined}
        tabIndex={imageSrc ? 0 : undefined}
        onKeyDown={imageSrc ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleImageClick(); } : undefined}
        aria-label={imageSrc ? `Ver imagen de ${product.nombre}` : undefined}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={product.nombre}
            className="product-card__image"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="product-card__placeholder" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
            </svg>
            <span>Imagen</span>
          </div>
        )}
        {imageSrc && (
          <div className="product-card__zoom-hint" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </div>
        )}
      </div>

      <div className="product-card__body">
        <div className="product-card__meta-row">
          <span className="product-card__brand">{product.marca || '—'}</span>
          {product.codigo && <span className="product-card__code">{product.codigo}</span>}
        </div>
        <h3 className="product-card__name">{product.nombre}</h3>
        {product.descripcion && (
          <p className="product-card__desc">{product.descripcion}</p>
        )}
      </div>

      <div className="product-card__footer">
        <button
          className="product-card__info-btn"
          onClick={() => onOpenModal({ ...product, _imgSrc: imageSrc })}
          aria-label={`Ver descripción completa de ${product.nombre}`}
          title="Ver detalle completo"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        </button>
        <button
          className={`product-card__btn ${inCart ? 'product-card__btn--added' : ''}`}
          onClick={() => addItem(product)}
          disabled={inCart}
          aria-label={inCart ? 'Producto ya en cotización' : `Agregar ${product.nombre} a cotización`}
        >
          {inCart ? (
            <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>En cotización</>
          ) : (
            <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>Cotizar</>
          )}
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
