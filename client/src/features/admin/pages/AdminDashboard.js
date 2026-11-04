import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import api from '../../../shared/services/api';
import { toast } from 'react-toastify';
import './AdminDashboard.css';

/* ── ICONOS (SVG en línea, mismo estilo que el resto del sitio) ── */
const ICON_PROPS = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };

const IconChart = () => (
  <svg {...ICON_PROPS}><path d="M4 19V10M12 19V5M20 19v-7" /></svg>
);
const IconBox = () => (
  <svg {...ICON_PROPS}><path d="M21 8L12 3 3 8v8l9 5 9-5V8z" /><path d="M3 8l9 5 9-5M12 13v8" /></svg>
);
const IconClipboard = () => (
  <svg {...ICON_PROPS}><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3a1 1 0 011-1h4a1 1 0 011 1v1M8 10h8M8 14h8M8 18h5" /></svg>
);
const IconMail = () => (
  <svg {...ICON_PROPS}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
);
const IconKey = () => (
  <svg {...ICON_PROPS}><circle cx="8" cy="15" r="4" /><path d="M11 12l9-9M17 6l3 3M14 9l2 2" /></svg>
);
const IconUpload = () => (
  <svg {...ICON_PROPS} width="16" height="16"><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3" /></svg>
);
const IconDownload = () => (
  <svg {...ICON_PROPS} width="16" height="16"><path d="M12 4v12M7 11l5 5 5-5" /><path d="M4 20h16" /></svg>
);
const IconArrowLeft = () => (
  <svg {...ICON_PROPS} width="16" height="16"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>
);
const IconTrash = () => (
  <svg {...ICON_PROPS} width="15" height="15"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6"/><path d="M10 11v6M14 11v6"/></svg>
);
const IconSend = () => (
  <svg {...ICON_PROPS} width="15" height="15"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/></svg>
);

/**
 * Modal de confirmación genérico, usado antes de eliminar cotizaciones o
 * mensajes. Evita borrados accidentales con un solo clic.
 */
const ConfirmDialog = ({ open, title, message, confirmLabel = 'Eliminar', loading, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="admin-modal-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className="admin-modal">
        <h3 className="admin-modal__title">{title}</h3>
        <p className="admin-modal__message">{message}</p>
        <div className="admin-modal__actions">
          <button className="btn-outline" onClick={onCancel} disabled={loading}>Cancelar</button>
          <button className="admin-modal__danger-btn" onClick={onConfirm} disabled={loading}>
            {loading ? 'Eliminando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Modal para pedir el correo de destino antes de enviar una cotización o
 * mensaje por email.
 */
const EmailPromptDialog = ({ open, title, loading, onSend, onCancel }) => {
  const [email, setEmail] = useState('');

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) onSend(email.trim());
  };

  return (
    <div className="admin-modal-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <form className="admin-modal" onSubmit={handleSubmit}>
        <h3 className="admin-modal__title">{title}</h3>
        <p className="admin-modal__message">Ingresa el correo al que quieres enviar esta información.</p>
        <input
          type="email"
          className="form-input"
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
          required
        />
        <div className="admin-modal__actions">
          <button type="button" className="btn-outline" onClick={onCancel} disabled={loading}>Cancelar</button>
          <button type="submit" className="btn-primary" disabled={loading || !email.trim()}>
            {loading ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ── SIDEBAR ── */
const AdminSidebar = ({ onLogout }) => (
  <aside className="admin-sidebar">
    <div className="admin-sidebar__logo">
      <div className="admin-sidebar__logo-icon"><img src="/LogoHK.svg" alt="Servicios HK" /></div>
      <span className="admin-sidebar__logo-name">Admin Panel</span>
    </div>
    <nav className="admin-sidebar__nav" aria-label="Panel de administración">
      {[
        { to: '/admin', end: true, icon: <IconChart />, label: 'Resumen' },
        { to: '/admin/catalogo', icon: <IconBox />, label: 'Catálogo' },
        { to: '/admin/cotizaciones', icon: <IconClipboard />, label: 'Cotizaciones' },
        { to: '/admin/mensajes', icon: <IconMail />, label: 'Mensajes' },
        { to: '/admin/cuenta', icon: <IconKey />, label: 'Mi cuenta' },
      ].map(({ to, end, icon, label }) => (
        <NavLink key={to} to={to} end={end}
          className={({ isActive }) => `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`}>
          <span className="admin-sidebar__link-icon">{icon}</span>
          {label}
        </NavLink>
      ))}
    </nav>
    <div className="admin-sidebar__footer">
      <Link to="/" className="admin-sidebar__site-link"><IconArrowLeft /> Ver sitio</Link>
      <button onClick={onLogout} className="admin-sidebar__logout">Cerrar sesión</button>
    </div>
  </aside>
);

/* ── RESUMEN (Stats) ── */
const AdminStats = () => {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => { if (data.success) setStats(data.stats); }).catch((err) => {
      toast.error(err.response?.data?.message || 'Error al cargar las estadísticas.');
    });
  }, []);

  const cards = stats ? [
    { label: 'Productos en catálogo', value: stats.totalProductos, color: 'var(--hk-orange)' },
    { label: 'Cotizaciones totales', value: stats.totalCotizaciones, color: '#3b82f6' },
    { label: 'Cotizaciones pendientes', value: stats.cotizacionesPendientes, color: '#f59e0b' },
    { label: 'Mensajes sin leer', value: stats.mensajesNoLeidos, color: '#8b5cf6' },
  ] : [];

  return (
    <div className="admin-section">
      <h2 className="admin-section__title">Resumen</h2>
      {!stats ? <p className="admin-loading">Cargando estadísticas...</p> : (
        <div className="admin-stats">
          {cards.map((c, i) => (
            <div key={i} className="admin-stat-card" style={{ borderTopColor: c.color }}>
              <p className="admin-stat-card__value" style={{ color: c.color }}>{c.value}</p>
              <p className="admin-stat-card__label">{c.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── CATÁLOGO ── */
const AdminCatalog = () => {
  const [products, setProducts] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const loadProducts = () => {
    api.get('/admin/products-preview').then(({ data }) => {
      if (data.success) setProducts(data.products);
    }).catch((err) => {
      toast.error(err.response?.data?.message || 'Error al cargar el catálogo.');
    });
  };

  useEffect(() => { loadProducts(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('catalog', file);
    try {
      const { data } = await api.post('/admin/upload-catalog', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (data.success) { toast.success(data.message); loadProducts(); }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al subir el catálogo.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDownload = async () => {
    try {
      const response = await api.get('/admin/download-catalog', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'catalogo.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // Con responseType: 'blob', un error también llega como Blob (no
      // JSON directo) — hay que leerlo como texto para mostrar el mensaje real.
      let message = 'Error al descargar el catálogo.';
      if (err.response?.data instanceof Blob) {
        try {
          const parsed = JSON.parse(await err.response.data.text());
          message = parsed.message || message;
        } catch { /* usa el mensaje genérico */ }
      }
      toast.error(message);
    }
  };

  return (
    <div className="admin-section">
      <h2 className="admin-section__title">Catálogo de productos</h2>
      <div className="admin-catalog__upload-zone">
        <div className="admin-catalog__upload-info">
          <p className="admin-catalog__upload-title">Actualizar catálogo Excel</p>
          <p className="admin-catalog__upload-desc">Sube un archivo .xlsx con las columnas: Nombre, Marca, Descripción, Categoría, Código, Imagen. El orden de las columnas no es estricto (se identifican por el nombre del encabezado), pero deben estar presentes. Los productos se actualizan inmediatamente.</p>
        </div>
        <div className="admin-catalog__upload-actions">
          <button type="button" className="admin-catalog__download-btn" onClick={handleDownload}>
            <IconDownload /> Descargar Excel
          </button>
          <label className="admin-catalog__upload-btn">
            {uploading ? 'Procesando...' : <><IconUpload /> Subir Excel</>}
            <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleUpload} disabled={uploading} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      <p className="admin-catalog__count">{products.length} productos en el catálogo</p>

      <div className="admin-table-wrap">
        <table className="admin-table" aria-label="Lista de productos">
          <thead>
            <tr>
              <th>Código</th><th>Nombre</th><th>Categoría</th><th>Marca</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--hk-gray-mid)' }}>Sin productos cargados. Sube un Excel para comenzar.</td></tr>
            ) : products.map((p) => (
              <tr key={p.id}>
                <td className="admin-table__id">{p.codigo}</td>
                <td><strong>{p.nombre}</strong><br/><small>{p.descripcion}</small></td>
                <td><span className="admin-badge admin-badge--orange">{p.categoria}</span></td>
                <td>{p.marca || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ── COTIZACIONES ── */
const AdminQuotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [emailPromptOpen, setEmailPromptOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const loadQuotes = () => {
    setLoading(true);
    api.get('/quotes').then(({ data }) => { if (data.success) setQuotes(data.quotes); }).catch((err) => {
      toast.error(err.response?.data?.message || 'Error al cargar las cotizaciones.');
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadQuotes(); }, []);

  const updateStatus = async (id, estado) => {
    try {
      const { data } = await api.put(`/quotes/${id}/estado`, { estado });
      if (data.success) {
        toast.success('Estado actualizado');
        loadQuotes();
        if (selected?.id === id) setSelected(data.quote);
      }
    } catch { toast.error('Error al actualizar estado'); }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/quotes/${confirmDeleteId}`);
      toast.success('Cotización eliminada');
      setQuotes((prev) => prev.filter((q) => q.id !== confirmDeleteId));
      if (selected?.id === confirmDeleteId) setSelected(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar la cotización.');
    } finally {
      setDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const handleSendEmail = async (email) => {
    setSendingEmail(true);
    try {
      const { data } = await api.post(`/quotes/${selected.id}/enviar-correo`, { email });
      toast.success(data.message);
      setEmailPromptOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al enviar el correo.');
    } finally {
      setSendingEmail(false);
    }
  };

  const STATUS_COLORS = { pendiente: '#f59e0b', revisada: '#3b82f6', enviada: '#10b981', rechazada: '#ef4444' };

  return (
    <div className="admin-section">
      <h2 className="admin-section__title">Cotizaciones</h2>
      {loading ? <p className="admin-loading">Cargando...</p> : (
        <div className="admin-quotes-layout">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>N°</th><th>Empresa</th><th>Contacto</th><th>Estado</th><th>Fecha</th><th></th></tr>
              </thead>
              <tbody>
                {quotes.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--hk-gray-mid)' }}>No hay cotizaciones aún.</td></tr>
                ) : quotes.map((q) => (
                  <tr key={q.id} className={selected?.id === q.id ? 'admin-table__row--selected' : ''}>
                    <td className="admin-table__id">{q.numeroCotizacion}</td>
                    <td><strong>{q.razonSocial}</strong><br/><small>{q.rutEmpresa}</small></td>
                    <td>{q.nombreContacto}<br/><small>{q.email}</small></td>
                    <td><span className="admin-badge" style={{ background: STATUS_COLORS[q.estado] + '22', color: STATUS_COLORS[q.estado] }}>{q.estado}</span></td>
                    <td><small>{new Date(q.createdAt).toLocaleDateString('es-CL')}</small></td>
                    <td><button className="admin-btn-sm" onClick={() => setSelected(q)}>Ver</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selected && (
            <div className="admin-detail">
              <div className="admin-detail__header">
                <h3>{selected.numeroCotizacion}</h3>
                <div className="admin-detail__header-actions">
                  <button className="admin-icon-btn" onClick={() => setEmailPromptOpen(true)} aria-label="Enviar por correo" title="Enviar por correo"><IconSend /></button>
                  <button className="admin-icon-btn admin-icon-btn--danger" onClick={() => setConfirmDeleteId(selected.id)} aria-label="Eliminar" title="Eliminar"><IconTrash /></button>
                  <button className="admin-icon-btn" onClick={() => setSelected(null)} aria-label="Cerrar" title="Cerrar">✕</button>
                </div>
              </div>
              <div className="admin-detail__body">
                <p><strong>Empresa:</strong> {selected.razonSocial} ({selected.rutEmpresa})</p>
                <p><strong>Contacto:</strong> {selected.nombreContacto}</p>
                <p><strong>Teléfono:</strong> {selected.telefonoContacto}</p>
                <p><strong>Email:</strong> {selected.email}</p>
                <p><strong>Dirección:</strong> {selected.direccion}, {selected.comuna}, {selected.provincia}, {selected.region}</p>
                {selected.instrucciones && <p><strong>Instrucciones:</strong> {selected.instrucciones}</p>}
                <hr style={{ margin: '1rem 0', borderColor: 'var(--hk-border)' }} />
                <p><strong>Productos ({selected.productos.length}):</strong></p>
                <ul className="admin-detail__products">
                  {selected.productos.map((p, i) => (
                    <li key={i}>{p.codigo ? `${p.codigo} — ` : ''}{p.nombre} — <strong>x{p.cantidad}</strong> <span className="admin-badge admin-badge--orange" style={{ fontSize: '0.7rem' }}>{p.categoria}</span></li>
                  ))}
                </ul>
                <hr style={{ margin: '1rem 0', borderColor: 'var(--hk-border)' }} />
                <div className="admin-detail__status">
                  <label htmlFor={`status-${selected.id}`}><strong>Cambiar estado:</strong></label>
                  <select id={`status-${selected.id}`} value={selected.estado} onChange={(e) => updateStatus(selected.id, e.target.value)} className="admin-select">
                    {['pendiente','revisada','enviada','rechazada'].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Eliminar cotización"
        message="¿Estás seguro que quieres eliminar esta cotización? Esta acción no se puede deshacer."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
      <EmailPromptDialog
        open={emailPromptOpen}
        title={`Enviar cotización ${selected?.numeroCotizacion || ''}`}
        loading={sendingEmail}
        onSend={handleSendEmail}
        onCancel={() => setEmailPromptOpen(false)}
      />
    </div>
  );
};

/* ── MENSAJES ── */
const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [emailPromptOpen, setEmailPromptOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    api.get('/contact').then(({ data }) => { if (data.success) setMessages(data.contacts); }).catch((err) => {
      toast.error(err.response?.data?.message || 'Error al cargar los mensajes.');
    }).finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/contact/${id}/leido`);
      setMessages((prev) => prev.map((m) => m.id === id ? { ...m, leido: true } : m));
      if (selected?.id === id) setSelected((prev) => ({ ...prev, leido: true }));
    } catch { toast.error('Error al marcar como leído'); }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/contact/${confirmDeleteId}`);
      toast.success('Mensaje eliminado');
      setMessages((prev) => prev.filter((m) => m.id !== confirmDeleteId));
      if (selected?.id === confirmDeleteId) setSelected(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar el mensaje.');
    } finally {
      setDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const handleSendEmail = async (email) => {
    setSendingEmail(true);
    try {
      const { data } = await api.post(`/contact/${selected.id}/enviar-correo`, { email });
      toast.success(data.message);
      setEmailPromptOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al enviar el correo.');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="admin-section">
      <h2 className="admin-section__title">Mensajes de contacto</h2>
      {loading ? <p className="admin-loading">Cargando...</p> : (
        <div className="admin-quotes-layout">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Nombre</th><th>Asunto</th><th>Fecha</th><th>Estado</th><th></th></tr>
              </thead>
              <tbody>
                {messages.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--hk-gray-mid)' }}>No hay mensajes.</td></tr>
                ) : messages.map((m) => (
                  <tr key={m.id} className={`${!m.leido ? 'admin-table__row--unread' : ''} ${selected?.id === m.id ? 'admin-table__row--selected' : ''}`}>
                    <td><strong>{m.nombre}</strong><br/><small>{m.email}</small></td>
                    <td>{m.asunto}</td>
                    <td><small>{new Date(m.createdAt).toLocaleDateString('es-CL')}</small></td>
                    <td><span className="admin-badge" style={m.leido ? { background: '#f3f4f6', color: '#6b7280' } : { background: '#dbeafe', color: '#2563eb' }}>{m.leido ? 'Leído' : 'Nuevo'}</span></td>
                    <td><button className="admin-btn-sm" onClick={() => { setSelected(m); if (!m.leido) markRead(m.id); }}>Ver</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selected && (
            <div className="admin-detail">
              <div className="admin-detail__header">
                <h3>{selected.asunto}</h3>
                <div className="admin-detail__header-actions">
                  <button className="admin-icon-btn" onClick={() => setEmailPromptOpen(true)} aria-label="Enviar por correo" title="Enviar por correo"><IconSend /></button>
                  <button className="admin-icon-btn admin-icon-btn--danger" onClick={() => setConfirmDeleteId(selected.id)} aria-label="Eliminar" title="Eliminar"><IconTrash /></button>
                  <button className="admin-icon-btn" onClick={() => setSelected(null)} aria-label="Cerrar" title="Cerrar">✕</button>
                </div>
              </div>
              <div className="admin-detail__body">
                <p><strong>De:</strong> {selected.nombre} ({selected.email})</p>
                {selected.telefono && <p><strong>Teléfono:</strong> {selected.telefono}</p>}
                <p><strong>Fecha:</strong> {new Date(selected.createdAt).toLocaleString('es-CL')}</p>
                <hr style={{ margin: '1rem 0', borderColor: 'var(--hk-border)' }} />
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: 'var(--hk-gray)' }}>{selected.mensaje}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Eliminar mensaje"
        message="¿Estás seguro que quieres eliminar este mensaje? Esta acción no se puede deshacer."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
      <EmailPromptDialog
        open={emailPromptOpen}
        title="Enviar mensaje por correo"
        loading={sendingEmail}
        onSend={handleSendEmail}
        onCancel={() => setEmailPromptOpen(false)}
      />
    </div>
  );
};

/* ── CUENTA ── */
const AdminAccount = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) { toast.error('La nueva contraseña debe tener al menos 8 caracteres.'); return; }
    setSaving(true);
    try {
      const { data } = await api.put('/auth/change-password', { currentPassword, newPassword });
      if (data.success) { toast.success(data.message); setCurrentPassword(''); setNewPassword(''); }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al cambiar contraseña.');
    } finally { setSaving(false); }
  };

  return (
    <div className="admin-section">
      <h2 className="admin-section__title">Mi cuenta</h2>
      <div className="admin-account">
        <div className="admin-account__info">
          <p><strong>Nombre:</strong> {user?.nombre}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Rol:</strong> {user?.role}</p>
        </div>
        <form onSubmit={handleChange} className="admin-account__form">
          <h3>Cambiar contraseña</h3>
          <div className="form-group">
            <label>Contraseña actual</label>
            <input type="password" className="form-input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Nueva contraseña (mín. 8 caracteres)</label>
            <input type="password" className="form-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
          </div>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</button>
        </form>
      </div>
    </div>
  );
};

/* ── MAIN DASHBOARD ── */
const AdminDashboard = () => {
  useEffect(() => {
    const tag = document.createElement('meta');
    tag.name = 'robots'; tag.content = 'noindex, nofollow';
    document.head.appendChild(tag);
    return () => { document.head.removeChild(tag); };
  }, []);

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  return (
    <div className="admin-layout">
      <AdminSidebar onLogout={handleLogout} />
      <main className="admin-main">
        <Routes>
          <Route index element={<AdminStats />} />
          <Route path="catalogo" element={<AdminCatalog />} />
          <Route path="cotizaciones" element={<AdminQuotes />} />
          <Route path="mensajes" element={<AdminMessages />} />
          <Route path="cuenta" element={<AdminAccount />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
