import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../../shared/services/api';
import ProductCard from '../components/ProductCard';
import { useCart } from '../../../shared/context/CartContext';
import { Link } from 'react-router-dom';
import './CatalogPage.css';

const LIMIT_OPTIONS = [20, 40, 60, 100];

const CatalogPage = () => {
  const [products, setProducts]     = useState([]);
  const [filters, setFilters]       = useState({ categorias: [], marcas: [] });
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [activeMarca, setActiveMarca]       = useState('');
  const [page, setPage]             = useState(1);
  const [limit, setLimit]           = useState(LIMIT_OPTIONS[0]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);
  const [modalProduct, setModalProduct] = useState(null);
  const { itemCount, addItem, items } = useCart();
  const modalBoxRef = useRef(null);
  const closeBtnRef = useRef(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit };
      if (search)         params.search    = search;
      if (activeCategory) params.categoria = activeCategory;
      if (activeMarca)    params.marca     = activeMarca;

      const { data } = await api.get('/products', { params });
      setProducts(data.products || []);
      setTotal(data.count ?? 0);
      setTotalPages(data.totalPages ?? 1);
      if (data.filters) setFilters(data.filters);
    } catch {
      setError('No se pudieron cargar los productos. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [search, activeCategory, activeMarca, page, limit]);

  // Al cambiar filtros o búsqueda, volvemos a la página 1
  const handleFilterChange = (setter) => (e) => { setter(e.target.value); setPage(1); };
  const handleLimitChange  = (e) => { setLimit(Number(e.target.value)); setPage(1); };

  useEffect(() => {
    const debounce = setTimeout(fetchProducts, 300);
    return () => clearTimeout(debounce);
  }, [fetchProducts]);

  // Modal: bloquea el scroll del fondo, cierra con Escape, mantiene el foco
  // dentro del cuadro y lo devuelve al elemento que lo abrió al cerrarse.
  useEffect(() => {
    if (!modalProduct) return undefined;

    const previouslyFocused = document.activeElement;
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus();

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setModalProduct(null);
        return;
      }
      if (e.key === 'Tab' && modalBoxRef.current) {
        const focusables = modalBoxRef.current.querySelectorAll('button:not(:disabled), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeyDown);
      if (previouslyFocused && document.contains(previouslyFocused)) previouslyFocused.focus();
    };
  }, [modalProduct]);

  const clearFilters = () => { setSearch(''); setActiveCategory(''); setActiveMarca(''); setPage(1); };
  const hasActiveFilters = search || activeCategory || activeMarca;

  return (
    <div className="catalog-page" style={{ paddingTop: 'var(--navbar-height)' }}>

      {/* ── Encabezado ── */}
      <div className="catalog-page__header">
        <div className="container">
          <p className="catalog-page__eyebrow">Nuestros productos</p>
          <h1 className="catalog-page__title">Catálogo</h1>
          <p className="catalog-page__subtitle">
            Explora nuestro catálogo de EPP, artículos de aseo e industrial. Agrega productos a tu cotización y envíala sin compromiso.
          </p>
          {itemCount > 0 && (
            <Link to="/cotizacion" className="catalog-page__cart-banner">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              Tienes {itemCount} producto{itemCount > 1 ? 's' : ''} en tu cotización — Ver cotización
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          )}
        </div>
      </div>

      <div className="container">

        {/* ── Controles ── */}
        <div className="catalog-page__controls">
          <div className="catalog-page__search-wrap">
            <svg className="catalog-page__search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input
              type="search"
              className="catalog-page__search"
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              aria-label="Buscar productos"
            />
          </div>

          <div className="catalog-page__filters">
            <select className="catalog-page__select" value={activeCategory} onChange={handleFilterChange(setActiveCategory)} aria-label="Filtrar por categoría">
              <option value="">Todas las categorías</option>
              {filters.categorias.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>

            <select className="catalog-page__select" value={activeMarca} onChange={handleFilterChange(setActiveMarca)} aria-label="Filtrar por marca">
              <option value="">Todas las marcas</option>
              {filters.marcas.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>

            {hasActiveFilters && (
              <button className="catalog-page__clear" onClick={clearFilters} aria-label="Limpiar filtros">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* ── Resultados ── */}
        {loading ? (
          <div className="catalog-page__loading" role="status" aria-live="polite">
            <div className="catalog-page__spinner"></div>
            <p>Cargando productos...</p>
          </div>
        ) : error ? (
          <div className="catalog-page__error" role="alert">
            <p>{error}</p>
            <button className="btn-primary" onClick={fetchProducts}>Reintentar</button>
          </div>
        ) : products.length === 0 ? (
          <div className="catalog-page__empty" role="status">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <h3>No se encontraron productos</h3>
            <p>Prueba con otros términos o elimina los filtros activos.</p>
            {hasActiveFilters && <button className="btn-outline" onClick={clearFilters}>Limpiar filtros</button>}
          </div>
        ) : (
          <>
            {/* barra de info + selector de items/página */}
            <div className="catalog-page__meta">
              <p className="catalog-page__count" aria-live="polite">
                {total} producto{total !== 1 ? 's' : ''} —
                página {page} de {totalPages}
              </p>
              <div className="catalog-page__per-page">
                <label htmlFor="catalog-limit">Por página:</label>
                <select id="catalog-limit" className="catalog-page__select catalog-page__select--sm" value={limit} onChange={handleLimitChange}>
                  {LIMIT_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            {/* grilla */}
            <div className="catalog-page__grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} onOpenModal={setModalProduct} />
              ))}
            </div>

            {/* paginación */}
            {totalPages > 1 && (
              <nav className="catalog-page__pagination" aria-label="Paginación del catálogo">
                <button
                  className="catalog-page__page-btn"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  aria-label="Primera página"
                >«</button>
                <button
                  className="catalog-page__page-btn"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  aria-label="Página anterior"
                >‹</button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 2)
                  .reduce((acc, n, idx, arr) => {
                    if (idx > 0 && n - arr[idx - 1] > 1) acc.push('...');
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((n, i) =>
                    n === '...' ? (
                      <span key={`dots-${i}`} className="catalog-page__page-dots">…</span>
                    ) : (
                      <button
                        key={n}
                        className={`catalog-page__page-btn ${n === page ? 'catalog-page__page-btn--active' : ''}`}
                        onClick={() => setPage(n)}
                        aria-label={`Página ${n}`}
                        aria-current={n === page ? 'page' : undefined}
                      >{n}</button>
                    )
                  )}

                <button
                  className="catalog-page__page-btn"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === totalPages}
                  aria-label="Página siguiente"
                >›</button>
                <button
                  className="catalog-page__page-btn"
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  aria-label="Última página"
                >»</button>
              </nav>
            )}
          </>
        )}
      </div>

      {/* ── Modal de producto ── */}
      {modalProduct && (
        <div
          className="product-modal__overlay"
          role="dialog"
          aria-modal="true"
          aria-label={modalProduct.nombre}
          onClick={(e) => { if (e.target === e.currentTarget) setModalProduct(null); }}
        >
          <div className="product-modal__box" ref={modalBoxRef}>
            <button
              ref={closeBtnRef}
              className="product-modal__close"
              onClick={() => setModalProduct(null)}
              aria-label="Cerrar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            {/* Imagen grande */}
            {modalProduct._imgSrc ? (
              <div className="product-modal__img-wrap">
                <img src={modalProduct._imgSrc} alt={modalProduct.nombre} className="product-modal__img" onError={() => setModalProduct((p) => (p ? { ...p, _imgSrc: null } : p))} />
              </div>
            ) : (
              <div className="product-modal__img-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" width="60" height="60"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
              </div>
            )}

            {/* Datos */}
            <div className="product-modal__body">
              <p className="product-modal__cat">{modalProduct.categoria}</p>
              <div className="product-modal__meta-row">
                <span className="product-modal__brand">{modalProduct.marca || '—'}</span>
                {modalProduct.codigo && <span className="product-modal__code">{modalProduct.codigo}</span>}
              </div>
              <h2 className="product-modal__name">{modalProduct.nombre}</h2>
              {modalProduct.descripcion ? (
                <p className="product-modal__desc">{modalProduct.descripcion}</p>
              ) : (
                <p className="product-modal__desc product-modal__desc--empty">Este producto no tiene descripción adicional.</p>
              )}
              {(() => {
                const inCart = items.some((item) => item.id === modalProduct.id);
                return (
                  <button
                    className={`product-card__btn product-modal__cta ${inCart ? 'product-card__btn--added' : ''}`}
                    onClick={() => addItem(modalProduct)}
                    disabled={inCart}
                  >
                    {inCart ? 'En cotización' : 'Cotizar este producto'}
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogPage;
