const { readCatalog, saveCatalog, downloadCatalogFile } = require("../../utils/catalogStorage");
const { supabase } = require("../../config/supabaseClient");

// @desc  Subir nuevo catálogo Excel (se guarda en Supabase Storage)
// @route POST /api/admin/upload-catalog
const uploadCatalog = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No se recibió ningún archivo." });
    }

    // saveCatalog valida el formato, lo sube a Supabase Storage y
    // actualiza la caché en memoria — si el archivo está mal formado,
    // lanza un error antes de subir nada.
    const products = await saveCatalog(req.file.buffer);

    res.json({
      success: true,
      message: `Catálogo actualizado correctamente. ${products.length} productos cargados.`,
      count: products.length,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc  Descargar el archivo Excel del catálogo tal como se subió
// @route GET /api/admin/download-catalog
const downloadCatalog = async (req, res) => {
  try {
    const buffer = await downloadCatalogFile();

    if (!buffer) {
      return res.status(404).json({ success: false, message: "Todavía no se ha subido ningún catálogo." });
    }

    res.set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.set("Content-Disposition", 'attachment; filename="catalogo.xlsx"');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Obtener estadísticas del panel
// @route GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [
      { count: totalCotizaciones },
      { count: cotizacionesPendientes },
      { count: totalMensajes },
      { count: mensajesNoLeidos },
      products,
    ] = await Promise.all([
      supabase.from("quotes").select("id", { count: "exact", head: true }),
      supabase.from("quotes").select("id", { count: "exact", head: true }).eq("estado", "pendiente"),
      supabase.from("contact_messages").select("id", { count: "exact", head: true }),
      supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("leido", false),
      readCatalog(),
    ]);

    res.json({
      success: true,
      stats: {
        totalProductos: products.length,
        totalCotizaciones: totalCotizaciones || 0,
        cotizacionesPendientes: cotizacionesPendientes || 0,
        totalMensajes: totalMensajes || 0,
        mensajesNoLeidos: mensajesNoLeidos || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Obtener lista de productos del catálogo cargado (admin)
// @route GET /api/admin/products-preview
const getProductsPreview = async (req, res) => {
  try {
    const products = await readCatalog();
    res.json({ success: true, count: products.length, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { uploadCatalog, downloadCatalog, getStats, getProductsPreview };
