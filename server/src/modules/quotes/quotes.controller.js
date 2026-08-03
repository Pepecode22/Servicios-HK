const { supabase } = require("../../config/supabaseClient");
const { sendMail } = require("../../utils/mailer");

const ESTADOS_VALIDOS = ["pendiente", "revisada", "enviada", "rechazada"];

/**
 * Convierte una fila de la tabla `quotes` (snake_case, formato Postgres) al
 * formato camelCase que espera el frontend (igual que devolvía Mongoose).
 */
const mapQuoteRow = (row) => ({
  id: row.id,
  numeroCotizacion: row.numero_cotizacion,
  rutEmpresa: row.rut_empresa,
  razonSocial: row.razon_social,
  nombreContacto: row.nombre_contacto,
  telefonoContacto: row.telefono_contacto,
  direccion: row.direccion,
  email: row.email,
  region: row.region,
  provincia: row.provincia,
  comuna: row.comuna,
  instrucciones: row.instrucciones,
  productos: row.productos,
  estado: row.estado,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// @desc  Crear nueva cotización
// @route POST /api/quotes
const createQuote = async (req, res) => {
  try {
    const {
      rutEmpresa, razonSocial, nombreContacto, telefonoContacto,
      direccion, email, region, provincia, comuna,
      instrucciones, productos,
    } = req.body;

    if (!rutEmpresa || !razonSocial || !nombreContacto || !email) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos obligatorios del cliente.",
      });
    }

    if (!productos || productos.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Debe incluir al menos un producto en la cotización.",
      });
    }

    const { data, error } = await supabase
      .from("quotes")
      .insert({
        rut_empresa: rutEmpresa,
        razon_social: razonSocial,
        nombre_contacto: nombreContacto,
        telefono_contacto: telefonoContacto,
        direccion,
        email,
        region,
        provincia,
        comuna,
        instrucciones: instrucciones || "",
        productos,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: "Cotización enviada correctamente.",
      numeroCotizacion: data.numero_cotizacion,
      quote: mapQuoteRow(data),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Obtener todas las cotizaciones (admin), con filtro y paginación
// @route GET /api/quotes
const getQuotes = async (req, res) => {
  try {
    const { estado, page = 1, limit = 20 } = req.query;
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    let query = supabase
      .from("quotes")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (estado) query = query.eq("estado", estado);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({
      success: true,
      total: count,
      page: Number(page),
      quotes: data.map(mapQuoteRow),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Obtener una cotización por ID (admin)
// @route GET /api/quotes/:id
const getQuoteById = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: "Cotización no encontrada." });
    }

    res.json({ success: true, quote: mapQuoteRow(data) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Actualizar estado de cotización (admin)
// @route PUT /api/quotes/:id/estado
const updateQuoteStatus = async (req, res) => {
  try {
    const { estado } = req.body;
    if (!ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({ success: false, message: "Estado inválido." });
    }

    const { data, error } = await supabase
      .from("quotes")
      .update({ estado })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: "Cotización no encontrada." });
    }

    res.json({ success: true, quote: mapQuoteRow(data) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Eliminar una cotización (admin)
// @route DELETE /api/quotes/:id
const deleteQuote = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("quotes")
      .delete()
      .eq("id", req.params.id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: "Cotización no encontrada." });
    }

    res.json({ success: true, message: "Cotización eliminada correctamente." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Enviar una cotización por correo (admin)
// @route POST /api/quotes/:id/enviar-correo
const emailQuote = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Debe indicar un correo de destino." });
    }

    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: "Cotización no encontrada." });
    }

    const quote = mapQuoteRow(data);

    const filasProductos = quote.productos
      .map(
        (p) =>
          `<tr>
            <td style="padding:6px 10px;border-bottom:1px solid #e5e5ea;">${p.codigo || "-"}</td>
            <td style="padding:6px 10px;border-bottom:1px solid #e5e5ea;">${p.nombre}</td>
            <td style="padding:6px 10px;border-bottom:1px solid #e5e5ea;">${p.categoria || "-"}</td>
            <td style="padding:6px 10px;border-bottom:1px solid #e5e5ea;text-align:center;">${p.cantidad}</td>
          </tr>`
      )
      .join("");

    const html = `
      <div style="font-family:Arial,sans-serif;color:#1C1C1E;max-width:600px;">
        <h2 style="color:#E8630A;">Cotización ${quote.numeroCotizacion}</h2>
        <p><strong>Empresa:</strong> ${quote.razonSocial} (${quote.rutEmpresa})</p>
        <p><strong>Contacto:</strong> ${quote.nombreContacto} — ${quote.telefonoContacto} — ${quote.email}</p>
        <p><strong>Dirección:</strong> ${quote.direccion}, ${quote.comuna}, ${quote.provincia}, ${quote.region}</p>
        ${quote.instrucciones ? `<p><strong>Instrucciones:</strong> ${quote.instrucciones}</p>` : ""}
        <table style="border-collapse:collapse;width:100%;margin-top:12px;">
          <thead>
            <tr style="background:#F5F5F5;">
              <th style="padding:6px 10px;text-align:left;">Código</th>
              <th style="padding:6px 10px;text-align:left;">Producto</th>
              <th style="padding:6px 10px;text-align:left;">Categoría</th>
              <th style="padding:6px 10px;text-align:center;">Cantidad</th>
            </tr>
          </thead>
          <tbody>${filasProductos}</tbody>
        </table>
        <p style="margin-top:16px;color:#636366;font-size:13px;">Estado actual: ${quote.estado}</p>
      </div>
    `;

    await sendMail({
      to: email,
      subject: `Cotización ${quote.numeroCotizacion} — ${quote.razonSocial}`,
      html,
    });

    res.json({ success: true, message: `Cotización enviada a ${email}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createQuote, getQuotes, getQuoteById, updateQuoteStatus, deleteQuote, emailQuote };
