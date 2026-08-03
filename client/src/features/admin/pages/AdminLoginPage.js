import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import './AdminLoginPage.css';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result?.success) {
      navigate('/admin');
    } else {
      setError(result?.message || 'Credenciales incorrectas');
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login__box">
        <div className="admin-login__logo">
          <div className="admin-login__logo-icon"><img src="/LogoHK.svg" alt="Servicios HK" /></div>
          <div>
            <p className="admin-login__logo-label">Panel de administración</p>
            <p className="admin-login__logo-brand">Servicios HK</p>
          </div>
        </div>

        <h1 className="admin-login__title">Iniciar sesión</h1>
        <p className="admin-login__sub">Acceso exclusivo para administradores.</p>

        {error && (
          <div className="admin-login__error" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              type="email"
              className="form-input"
              placeholder="admin@servicioshk.cl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group admin-login__pwd-group">
            <label htmlFor="admin-password">Contraseña</label>
            <div className="admin-login__pwd-wrap">
              <input
                id="admin-password"
                type={showPwd ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="admin-login__show-pwd"
                onClick={() => setShowPwd(!showPwd)}
                aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPwd
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary admin-login__submit" disabled={loading} aria-busy={loading}>
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>

        <div className="admin-login__back">
          <Link to="/">← Volver al sitio</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
