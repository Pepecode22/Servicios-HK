import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import api from '../../../shared/services/api';
import { toast } from 'react-toastify';
import './ContactPage.css';

const HCAPTCHA_SITE_KEY = process.env.REACT_APP_HCAPTCHA_SITE_KEY || '10000000-ffff-ffff-ffff-000000000001';

const ContactPage = () => {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const captchaRef = useRef(null);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (formData) => {
    if (!captchaToken) {
      toast.error('Por favor completa la verificación de seguridad.');
      return;
    }
    setSending(true);
    try {
      const { data } = await api.post('/contact', { ...formData, captchaToken });
      if (data.success) {
        setSent(true);
        reset();
        setCaptchaToken(null);
        captchaRef.current?.resetCaptcha();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al enviar el mensaje. Intente nuevamente.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="contact-page" style={{ paddingTop: 'var(--navbar-height)' }}>
      {/* Header */}
      <div className="contact-page__header">
        <div className="container">
          <p className="contact-page__eyebrow">Estamos para ayudarte</p>
          <h1 className="contact-page__title">Contacto</h1>
          <p className="contact-page__subtitle">
            Escríbenos con tu consulta y te responderemos a la brevedad.
          </p>
        </div>
      </div>

      <div className="container">
        <div className="contact-page__layout">
          {/* Info lateral */}
          <aside className="contact-page__info">
            <h2 className="contact-page__info-title">Información de contacto</h2>

            <ul className="contact-page__info-list">
              <li>
                <div className="contact-page__info-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div>
                  <p className="contact-page__info-label">Dirección</p>
                  <p className="contact-page__info-val">Lord Cochrane # 329 C<br />La Calera, V Región</p>
                </div>
              </li>
              <li>
                <div className="contact-page__info-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .18h3a2 2 0 012 1.72c.13 1.02.36 2.03.71 3a2 2 0 01-.45 2.11L6.09 8.19a16 16 0 006.72 6.72l1.16-1.17a2 2 0 012.11-.45c.97.35 1.98.58 3 .71a2 2 0 011.72 2.02z"/></svg>
                </div>
                <div>
                  <p className="contact-page__info-label">Teléfono</p>
                  <div className="contact-page__info-val">
                    <p>Celular: <a href="tel:+56992560031">+569 92560031</a></p>
                    <p>Fijo: <a href="tel:552844931">552844931</a></p>
                  </div>
                </div>
              </li>
              <li>
                <div className="contact-page__info-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div>
                  <p className="contact-page__info-label">Horario de atención</p>
                  <div className="contact-page__info-val">
                    <p><strong>Lunes a Viernes</strong></p>
                    <p>Mañana: 08:30 a 13:00 hrs</p>
                    <p>Tarde: 15:00 a 18:00 hrs</p>
                    <p style={{ marginTop: '0.5rem' }}><strong>Sábado</strong></p>
                    <p>Mañana: 09:30 a 13:00 hrs</p>
                  </div>
                </div>
              </li>
            </ul>

            <div className="contact-page__cta-box">
              <p className="contact-page__cta-text">¿Necesitas cotizar?</p>
              <p>Visita nuestro catálogo y agrega los productos que necesitas.</p>
              <a href="/catalogo" className="btn-primary">Ver catálogo</a>
            </div>
          </aside>

          {/* Formulario */}
          <div className="contact-page__form-wrap">
            {sent ? (
              <div className="contact-page__sent">
                <div className="contact-page__sent-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h2>¡Mensaje enviado!</h2>
                <p>Gracias por contactarnos. Responderemos a tu consulta dentro de las próximas 24 horas hábiles.</p>
                <button className="btn-primary" onClick={() => setSent(false)}>Enviar otro mensaje</button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <h2 className="contact-form__title">Envíanos un mensaje</h2>

                <div className="contact-form__grid">
                  <div className="form-group">
                    <label htmlFor="nombre">Nombre *</label>
                    <input id="nombre" className={`form-input ${errors.nombre ? 'error' : ''}`}
                      placeholder="Tu nombre"
                      {...register('nombre', { required: 'Nombre requerido' })} />
                    {errors.nombre && <span className="form-error" role="alert">{errors.nombre.message}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input id="email" type="email" className={`form-input ${errors.email ? 'error' : ''}`}
                      placeholder="tu@email.cl"
                      {...register('email', {
                        required: 'Email requerido',
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' }
                      })} />
                    {errors.email && <span className="form-error" role="alert">{errors.email.message}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="telefono">Teléfono</label>
                    <input id="telefono" type="tel" className="form-input"
                      placeholder="+56 9 1234 5678"
                      {...register('telefono')} />
                  </div>

                  <div className="form-group">
                    <label htmlFor="asunto">Asunto *</label>
                    <input id="asunto" className={`form-input ${errors.asunto ? 'error' : ''}`}
                      placeholder="Motivo de consulta"
                      {...register('asunto', { required: 'Asunto requerido' })} />
                    {errors.asunto && <span className="form-error" role="alert">{errors.asunto.message}</span>}
                  </div>

                  <div className="form-group contact-form__full">
                    <label htmlFor="mensaje">Mensaje *</label>
                    <textarea id="mensaje" className={`form-input contact-form__textarea ${errors.mensaje ? 'error' : ''}`}
                      placeholder="Describe tu consulta con el mayor detalle posible..."
                      rows={5}
                      {...register('mensaje', { required: 'Mensaje requerido', minLength: { value: 10, message: 'El mensaje debe tener al menos 10 caracteres' } })} />
                    {errors.mensaje && <span className="form-error" role="alert">{errors.mensaje.message}</span>}
                  </div>
                </div>

                {/* hCaptcha */}
                <div className="contact-form__captcha">
                  <HCaptcha
                    ref={captchaRef}
                    sitekey={HCAPTCHA_SITE_KEY}
                    onVerify={(token) => setCaptchaToken(token)}
                    onExpire={() => setCaptchaToken(null)}
                    theme="light"
                  />
                </div>

                <button type="submit" className="btn-primary contact-form__submit" disabled={sending} aria-busy={sending}>
                  {sending ? (
                    <><span className="contact-form__spinner"></span>Enviando...</>
                  ) : (
                    <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>Enviar mensaje</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
