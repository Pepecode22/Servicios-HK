const axios = require("axios");
const { supabase } = require("../../config/supabaseClient");
const { sendMail } = require("../../utils/mailer");

/**
 * Convierte una fila de `contact_messages` (snake_case) al formato camelCase
 * que espera el frontend.
 */
const mapContactRow = (row) => ({
  id: row.id,
  nombre: row.nombre,
  email: row.email,
  telefono: row.telefono,
  asunto: row.asunto,
  mensaje: row.mensaje,
  leido: row.leido,
  createdAt: row.created_at,
});

// Construye el HTML del correo a partir de un mensaje de contacto. Se usa
// tanto para el envío automático (al recibirse el mensaje) como para el
// botón manual "Enviar por correo" del panel admin.
const buildContactEmailHtml = (contact) => `
  <div style="font-family:Arial,sans-serif;color:#1C1C1E;max-width:600px;">
    <h2 style="color:#E8630A;">Mensaje de contacto</h2>
    <p><strong>Nombre:</strong> ${contact.nombre}</p>
    <p><strong>Email:</strong> ${contact.email}</p>
    ${contact.telefono ? `<p><strong>Teléfono:</strong> ${contact.telefono}</p>` : ""}
    <p><strong>Asunto:</strong> ${contact.asunto}</p>
    <p style="margin-top:12px;padding:12px;background:#F5F5F5;border-radius:6px;">${contact.mensaje}</p>
  </div>
`;

// @desc  Enviar mensaje de contacto (con verificación hCaptcha)
// @route POST /api/contact
const sendContact = async (req, res) => {
  try {
    const { nombre, email, telefono, asunto, mensaje, captchaToken } = req.body;

    if (!nombre || !email || !asunto || !mensaje) {
      return res.status(400).json({
        success: false,
        message: "Nombre, email, asunto y mensaje son obligatorios.",
      });
    }

    if (!captchaToken) {
      return res.status(400).json({
        success: false,
        message: "Verificación de captcha requerida.",
      });
    }

    const captchaResponse = await axios.post(
      "https://hcaptcha.com/siteverify",
      new URLSearchParams({
        secret: process.env.HCAPTCHA_SECRET,
        response: captchaToken,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    if (!captchaResponse.data.success) {
      return res.status(400).json({
        success: false,
        message: "Verificación de captcha fallida. Intente nuevamente.",
      });
    }

    const { data, error } = await supabase
      .from("contact_messages")
      .insert({ nombre, email, telefono, asunto, mensaje })
      .select()
      .single();

    if (error) throw error;

    // Envío automático al correo de notificaciones (ej. contacto@servicioshk.cl).
    // Se hace "best effort": si falla (por ejemplo, EMAIL_* no configurado
    // aún, o un corte temporal del proveedor de correo), el mensaje ya
    // quedó guardado y visible en el panel admin de todas formas — no se
    // bloquea ni se le muestra un error al cliente que llenó el formulario.
    if (process.env.NOTIFICATION_EMAIL) {
      try {
        await sendMail({
          to: process.env.NOTIFICATION_EMAIL,
          subject: `Nuevo mensaje de contacto — ${asunto}`,
          html: buildContactEmailHtml(mapContactRow(data)),
        });
      } catch (mailErr) {
        console.error("No se pudo enviar la notificación automática de contacto:", mailErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: "Mensaje enviado correctamente. Nos pondremos en contacto pronto.",
      id: data.id,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Obtener mensajes de contacto (admin)
// @route GET /api/contact
const getContacts = async (req, res) => {
  try {
    const { leido, page = 1, limit = 20 } = req.query;
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    let query = supabase
      .from("contact_messages")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (leido !== undefined) query = query.eq("leido", leido === "true");

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ success: true, total: count, contacts: data.map(mapContactRow) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Marcar mensaje como leído (admin)
// @route PUT /api/contact/:id/leido
const markAsRead = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("contact_messages")
      .update({ leido: true })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: "Mensaje no encontrado." });
    }

    res.json({ success: true, contact: mapContactRow(data) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Eliminar un mensaje de contacto (admin)
// @route DELETE /api/contact/:id
const deleteContact = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("contact_messages")
      .delete()
      .eq("id", req.params.id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: "Mensaje no encontrado." });
    }

    res.json({ success: true, message: "Mensaje eliminado correctamente." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Enviar un mensaje de contacto por correo (admin)
// @route POST /api/contact/:id/enviar-correo
const emailContact = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Debe indicar un correo de destino." });
    }

    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: "Mensaje no encontrado." });
    }

    const contact = mapContactRow(data);

    await sendMail({
      to: email,
      subject: `Mensaje de contacto — ${contact.asunto}`,
      html: buildContactEmailHtml(contact),
    });

    res.json({ success: true, message: `Mensaje enviado a ${email}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { sendContact, getContacts, markAsRead, deleteContact, emailContact };
