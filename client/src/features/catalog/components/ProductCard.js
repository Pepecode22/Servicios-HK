import React, { useState } from 'react';
import { useCart } from '../../../shared/context/CartContext';
import './ProductCard.css';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

const ProductCard = ({ product }) => {
  const { addItem, items } = useCart();
  const inCart = items.some((item) => item.id === product.id);
  const [imageFailed, setImageFailed] = useState(false);

  // La imagen siempre se pide a través del backend (nunca directo a la URL
  // externa que venga en el Excel), así el navegador nunca revela la URL
  // real de origen al hacer clic derecho > "Abrir imagen en otra pestaña".
  const imageSrc = product.imagen && !imageFailed ? `${API_BASE}/products/${product.id}/image` : null;

  return (
    <article className="product-card" aria-label={product.nombre}>
      {/* Categoría */}
      <p className="product-card__category">{product.categoria}</p>

      {/* Imagen */}
      <div className="product-card__image-wrapper">
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
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M3 9h18M9 21V9"/>
            </svg>
            <span>Imagen</span>
          </div>
        )}
      </div>

      {/* Contenido */}
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

      {/* Acción */}
      <div className="product-card__footer">
        <button
          className={`product-card__btn ${inCart ? 'product-card__btn--added' : ''}`}
          onClick={() => addItem(product)}
          disabled={inCart}
          aria-label={inCart ? 'Producto ya en cotización' : `Agregar ${product.nombre} a cotización`}
        >
          {inCart ? (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
              En cotización
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              Cotizar
            </>
          )}
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
