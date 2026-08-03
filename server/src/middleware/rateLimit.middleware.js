const rateLimit = require("express-rate-limit");

/**
 * Limita los intentos de login para dificultar ataques de fuerza bruta
 * sobre la cuenta de administrador.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  message: { success: false, message: "Demasiados intentos. Intenta nuevamente en unos minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Limita el envío de formularios públicos (contacto y cotizaciones) para
 * mitigar spam automatizado.
 */
const publicFormLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20,
  message: { success: false, message: "Has enviado demasiadas solicitudes. Intenta nuevamente más tarde." },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, publicFormLimiter };
