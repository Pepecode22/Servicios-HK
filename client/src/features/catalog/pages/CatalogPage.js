import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../shared/services/api';
import ProductCard from '../components/ProductCard';
import { useCart } from '../../../shared/context/CartContext';
import { Link } from 'react-router-dom';
import './CatalogPage.css';

const CatalogPage = () => {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({ categorias: [], marcas: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [activeMarca, setActiveMarca] = useState('');
  const { itemCount } = useCart();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search) params.search = search;
      if (activeCategory) params.categoria = activeCategory;
      if (activeMarca) params.marca = activeMarca;

      const { data } = await api.get('/products', { params });
      setProducts(data.products || []);
      if (data.filters) setFilters(data.filters);
    } catch (err) {
      setError('No se pudieron cargar los productos. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [search, activeCategory, activeMarca]);

  useEffect(() => {
    const debounce = setTimeout(fetchProducts, 300);
    return () => clearTimeout(debounce);
  }, [fetchProducts]);

  const clearFilters = () => {
    setSearch('');
    setActiveCategory('');
    setActiveMarca('');
  };

  const hasActiveFilters = search || activeCategory || activeMarca;

  return (
    <div className="catalog-page" style={{ paddingTop: 'var(--navbar-height)' }}>
      {/* Encabezado */}
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
        {/* Barra de búsqueda y filtros */}
        <div className="catalog-page__controls">
          <div className="catalog-page__search-wrap">
            <svg className="catalog-page__search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input
              type="search"
              className="catalog-page__search"
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar productos"
            />
          </div>

          <div className="catalog-page__filters">
            <select
              className="catalog-page__select"
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              aria-label="Filtrar por categoría"
            >
              <option value="">Todas las categorías</option>
              {filters.categorias.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              className="catalog-page__select"
              value={activeMarca}
              onChange={(e) => setActiveMarca(e.target.value)}
              aria-label="Filtrar por marca"
            >
              <option value="">Todas las marcas</option>
              {filters.marcas.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            {hasActiveFilters && (
              <button className="catalog-page__clear" onClick={clearFilters} aria-label="Limpiar filtros">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Resultados */}
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
            <p>Prueba con otros términos de búsqueda o elimina los filtros activos.</p>
            {hasActiveFilters && (
              <button className="btn-outline" onClick={clearFilters}>Limpiar filtros</button>
            )}
          </div>
        ) : (
          <>
            <p className="catalog-page__count" aria-live="polite">
              {products.length} producto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
            </p>
            <div className="catalog-page__grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CatalogPage;
