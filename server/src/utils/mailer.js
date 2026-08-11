const axios = require("axios");

/**
 * Envía correos a través de la API HTTP de Resend (https://resend.com), no
 * por SMTP tradicional. Esto es intencional: hosts gratuitos como Render
 * bloquean el tráfico saliente en los puertos SMTP (25, 465, 587), pero una
 * llamada HTTPS normal (puerto 443) nunca se bloquea — así que enviar por
 * API en vez de SMTP evita ese problema por completo.
 *
 * Requiere dos variables en server/.env:
 *   RESEND_API_KEY — la API key de tu cuenta de Resend
 *   EMAIL_FROM     — remitente verificado, ej. "Servicios HK <contacto@servicioshk.cl>"
 */

const isEmailConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

/**
 * Envía un correo. Lanza un error si RESEND_API_KEY / EMAIL_FROM no están
 * configurados, o si Resend rechaza el envío — quien llama debe capturar el
 * error y responder algo claro (ver quotes.controller / contact.controller).
 */
const sendMail = async ({ to, subject, html }) => {
  if (!isEmailConfigured()) {
    throw new Error(
      "El envío de correos no está configurado. Define RESEND_API_KEY y EMAIL_FROM en server/.env."
    );
  }

  try {
    await axios.post(
      "https://api.resend.com/emails",
      {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );
  } catch (err) {
    const detail = err.response?.data?.message || err.message;
    throw new Error(`Error al enviar el correo vía Resend: ${detail}`);
  }
};

module.exports = { sendMail, isEmailConfigured };
