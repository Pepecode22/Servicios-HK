import React, { useState, useEffect } from 'react';
import { useCart } from '../../../shared/context/CartContext';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import api from '../../../shared/services/api';
import { toast } from 'react-toastify';
import './QuotePage.css';

const REGIONES = [
  'Arica y Parinacota','Tarapacá','Antofagasta','Atacama','Coquimbo',
  'Valparaíso','Región Metropolitana',"O'Higgins",'Maule','Ñuble',
  'Biobío','La Araucanía','Los Ríos','Los Lagos','Aysén','Magallanes',
];

/**
 * Input numérico de cantidad: permite escribir el número directamente,
 * además de los botones +/-. Mantiene un valor de texto local mientras se
 * edita, y solo confirma el cambio (vía onChange) cuando el valor es un
 * entero válido >= 1 — si no, vuelve al último valor válido.
 */
const QuantityInput = ({ value, onChange }) => {
  const [text, setText] = useState(String(value));

  useEffect(() => { setText(String(value)); }, [value]);

  const commit = () => {
    const parsed = parseInt(text, 10);
    if (!Number.isNaN(parsed) && parsed >= 1) {
      onChange(parsed);
    } else {
      setText(String(value));
    }
  };

  return (
    <input
      type="number"
      min="1"
      inputMode="numeric"
      className="quote-item__qty-input"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') { e.preventDefault(); commit(); e.target.blur(); }
      }}
      aria-label="Cantidad"
    />
  );
};

const QuotePage = () => {
  const { items, removeItem, updateQuantity, clearCart } = useCart();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [quoteNumber, setQuoteNumber] = useState('');
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (formData) => {
    if (items.length === 0) { toast.error('Debes agregar al menos un producto.'); return; }
    setSending(true);
    try {
      const payload = { ...formData, productos: items.map((item) => ({ productoId: item.id, codigo: item.codigo, nombre: item.nombre, categoria: item.categoria, marca: item.marca, cantidad: item.cantidad })) };
      const { data } = await api.post('/quotes', payload);
      if (data.success) { setQuoteNumber(data.numeroCotizacion); setSent(true); clearCart(); reset(); }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al enviar cotización.');
    } finally { setSending(false); }
  };

  if (sent) {
    return (
      <div className="quote-success" style={{ paddingTop: 'var(--navbar-height)' }}>
        <div className="quote-success__box">
          <div className="quote-success__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg></div>
          <h1>¡Cotización enviada!</h1>
          <p>Tu solicitud fue recibida con el número:</p>
          <p className="quote-success__number">{quoteNumber}</p>
          <p>Nos pondremos en contacto contigo a la brevedad.</p>
          <div className="quote-success__actions">
            <Link to="/catalogo" className="btn-primary">Seguir explorando</Link>
            <Link to="/" className="btn-outline">Volver al inicio</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quote-page" style={{ paddingTop: 'var(--navbar-height)' }}>
      <div className="quote-page__header">
        <div className="container">
          <p className="quote-page__eyebrow">Sin compromiso</p>
          <h1 className="quote-page__title">Solicitar Cotización</h1>
          <p className="quote-page__subtitle">Revisa los productos seleccionados, completa tus datos y envía tu solicitud.</p>
        </div>
      </div>

      <div className="container">
        <div className="quote-page__layout">
          {/* Productos */}
          <section aria-labelledby="cart-heading">
            <h2 id="cart-heading" className="quote-page__section-title">
              Productos seleccionados {items.length > 0 && <span className="quote-page__count">{items.length}</span>}
            </h2>
            {items.length === 0 ? (
              <div className="quote-page__empty">
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                <h3>Sin productos</h3>
                <p>Agrega productos desde el catálogo para iniciar tu cotización.</p>
                <Link to="/catalogo" className="btn-primary">Ir al catálogo</Link>
              </div>
            ) : (
              <div className="quote-page__cart">
                {items.map((item) => (
                  <div key={item.id} className="quote-item">
                    <div className="quote-item__info">
                      <span className="quote-item__category">{item.categoria}</span>
                      <p className="quote-item__name">{item.nombre}</p>
                      {(item.marca || item.codigo) && (
                        <p className="quote-item__brand">
                          {item.marca}{item.marca && item.codigo && ' · '}{item.codigo}
                        </p>
                      )}
                    </div>
                    <div className="quote-item__controls">
                      <div className="quote-item__qty">
                        <button onClick={() => updateQuantity(item.id, item.cantidad - 1)} disabled={item.cantidad <= 1} aria-label="Disminuir">−</button>
                        <QuantityInput value={item.cantidad} onChange={(qty) => updateQuantity(item.id, qty)} />
                        <button onClick={() => updateQuantity(item.id, item.cantidad + 1)} aria-label="Aumentar">+</button>
                      </div>
                      <button className="quote-item__remove" onClick={() => removeItem(item.id)} aria-label={`Eliminar ${item.nombre}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Formulario */}
          <section aria-labelledby="form-heading">
            <h2 id="form-heading" className="quote-page__section-title">Información del cliente</h2>
            <form className="quote-form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="quote-form__grid">
                <div className="form-group">
                  <label htmlFor="rutEmpresa">RUT Empresa *</label>
                  <input id="rutEmpresa" className={`form-input ${errors.rutEmpresa ? 'error' : ''}`} placeholder="12.345.678-9" {...register('rutEmpresa', { required: 'RUT empresa requerido' })} />
                  {errors.rutEmpresa && <span className="form-error">{errors.rutEmpresa.message}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="razonSocial">Razón Social *</label>
                  <input id="razonSocial" className={`form-input ${errors.razonSocial ? 'error' : ''}`} placeholder="Empresa S.A." {...register('razonSocial', { required: 'Razón social requerida' })} />
                  {errors.razonSocial && <span className="form-error">{errors.razonSocial.message}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="nombreContacto">Nombre Contacto *</label>
                  <input id="nombreContacto" className={`form-input ${errors.nombreContacto ? 'error' : ''}`} placeholder="Juan Pérez" {...register('nombreContacto', { required: 'Nombre requerido' })} />
                  {errors.nombreContacto && <span className="form-error">{errors.nombreContacto.message}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="telefonoContacto">Teléfono *</label>
                  <input id="telefonoContacto" type="tel" className={`form-input ${errors.telefonoContacto ? 'error' : ''}`} placeholder="+56 9 1234 5678" {...register('telefonoContacto', { required: 'Teléfono requerido' })} />
                  {errors.telefonoContacto && <span className="form-error">{errors.telefonoContacto.message}</span>}
                </div>
                <div className="form-group quote-form__full">
                  <label htmlFor="email">Email *</label>
                  <input id="email" type="email" className={`form-input ${errors.email ? 'error' : ''}`} placeholder="contacto@empresa.cl" {...register('email', { required: 'Email requerido', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' } })} />
                  {errors.email && <span className="form-error">{errors.email.message}</span>}
                </div>
                <div className="form-group quote-form__full">
                  <label htmlFor="direccion">Dirección *</label>
                  <input id="direccion" className={`form-input ${errors.direccion ? 'error' : ''}`} placeholder="Calle Ejemplo 123" {...register('direccion', { required: 'Dirección requerida' })} />
                  {errors.direccion && <span className="form-error">{errors.direccion.message}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="region">Región *</label>
                  <select id="region" className={`form-input ${errors.region ? 'error' : ''}`} {...register('region', { required: 'Región requerida' })}>
                    <option value="">Seleccionar región</option>
                    {REGIONES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  {errors.region && <span className="form-error">{errors.region.message}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="provincia">Provincia *</label>
                  <input id="provincia" className={`form-input ${errors.provincia ? 'error' : ''}`} placeholder="Quillota" {...register('provincia', { required: 'Provincia requerida' })} />
                  {errors.provincia && <span className="form-error">{errors.provincia.message}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="comuna">Comuna *</label>
                  <input id="comuna" className={`form-input ${errors.comuna ? 'error' : ''}`} placeholder="La Calera" {...register('comuna', { required: 'Comuna requerida' })} />
                  {errors.comuna && <span className="form-error">{errors.comuna.message}</span>}
                </div>
                <div className="form-group quote-form__full">
                  <label htmlFor="instrucciones">Instrucciones adicionales</label>
                  <textarea id="instrucciones" className="form-input quote-form__textarea" placeholder="Referencias de entrega, observaciones u otros detalles..." rows={4} {...register('instrucciones')} />
                </div>
              </div>
              <button type="submit" className="btn-primary quote-form__submit" disabled={sending || items.length === 0} aria-busy={sending}>
                {sending ? (<><span className="quote-form__spinner"></span>Enviando...</>) : (<>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  Enviar cotización
                </>)}
              </button>
              {items.length === 0 && <p className="quote-form__warning">Agrega productos al carro antes de enviar.</p>}
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default QuotePage;
