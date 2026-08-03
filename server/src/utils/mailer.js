const nodemailer = require("nodemailer");

let transporter = null;

const isEmailConfigured = () =>
  Boolean(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);

const getTransporter = () => {
  if (transporter) return transporter;

  if (!isEmailConfigured()) return null;

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465, // true solo para el puerto 465 (SSL)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  return transporter;
};

/**
 * Envía un correo. Lanza un error si EMAIL_HOST / EMAIL_USER / EMAIL_PASSWORD
 * no están configurados en server/.env — quien llama debe capturar el error
 * y responder algo claro al usuario (ver quotes.controller / contact.controller).
 */
const sendMail = async ({ to, subject, html }) => {
  const client = getTransporter();

  if (!client) {
    throw new Error(
      "El envío de correos no está configurado. Define EMAIL_HOST, EMAIL_USER y EMAIL_PASSWORD en server/.env."
    );
  }

  await client.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
};

module.exports = { sendMail, isEmailConfigured };
