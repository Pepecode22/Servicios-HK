const axios = require("axios");
const { readCatalog } = require("../../utils/catalogStorage");

// Quita tildes y pasa a minúsculas, para que buscar "codigo" también
// encuentre "código", "articulo" encuentre "artículo", etc.
const normalizeText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

// Paginación del catálogo: por defecto 20 productos por página, con un
// máximo de 100 para que nadie pueda pedir el catálogo completo de una vez
// (el objetivo es justamente no cargar todo de una tirada).
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const parsePositiveInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

// @desc  Listar productos del catálogo, con filtros opcionales y paginación
// @route GET /api/products?page=1&limit=20&categoria=&marca=&search=
const getProducts = async (req, res) => {
  try {
    const { categoria, marca, search } = req.query;
    const allProducts = await readCatalog();

    const products = allProducts.filter((p) => {
      const matchesCategory = !categoria || p.categoria.toLowerCase() === categoria.toLowerCase();
      const matchesBrand = !marca || p.marca.toLowerCase() === marca.toLowerCase();
      const query = search ? normalizeText(search) : "";
      const matchesSearch =
        !query ||
        [p.nombre, p.descripcion, p.marca, p.categoria, p.codigo].some((value) =>
          normalizeText(value).includes(query)
        );
      return matchesCategory && matchesBrand && matchesSearch;
    });

    const categorias = [...new Set(allProducts.map((p) => p.categoria))].filter(Boolean);
    const marcas = [...new Set(allProducts.map((p) => p.marca))].filter(Boolean);

    // Los filtros (categorías y marcas) se calculan sobre TODO el catálogo,
    // no sobre la página actual, para que las listas desplegables siempre
    // muestren todas las opciones disponibles.
    const total = products.length;
    const limit = Math.min(Math.max(parsePositiveInt(req.query.limit, DEFAULT_LIMIT), 1), MAX_LIMIT);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    // Si piden una página que no existe (ej. después de aplicar un filtro
    // que deja menos resultados), se entrega la última página válida.
    const page = Math.min(Math.max(parsePositiveInt(req.query.page, 1), 1), totalPages);
    const start = (page - 1) * limit;

    res.json({
      success: true,
      count: total,
      page,
      limit,
      totalPages,
      products: products.slice(start, start + limit),
      filters: { categorias, marcas },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Obtener un producto por ID
// @route GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const products = await readCatalog();
    const product = products.find((p) => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Producto no encontrado." });
    }
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Caché simple en memoria de imágenes externas ya descargadas, para no
// volver a pedirlas al origen real en cada visita (mejor rendimiento y
// menos carga hacia afuera).
const imageCache = new Map(); // url externa -> { buffer, contentType, cachedAt }
const IMAGE_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora

// @desc  Sirve la imagen de un producto a través del propio backend, para
// que la URL real de origen (si es externa) nunca quede expuesta al hacer
// clic derecho > "Abrir imagen en otra pestaña" — el navegador solo ve la
// URL de esta API, nunca la del sitio donde realmente vive la imagen.
// @route GET /api/products/:id/image
const getProductImage = async (req, res) => {
  try {
    const products = await readCatalog();
    const product = products.find((p) => p.id === req.params.id);

    if (!product || !product.imagen) {
      return res.status(404).end();
    }

    // Si la imagen ya es un archivo propio (subido a /uploads), no hay
    // nada que ocultar: se sirve directo, sin pasar por el proxy.
    if (!/^https?:\/\//i.test(product.imagen)) {
      return res.redirect(`/uploads/${product.imagen}`);
    }

    const externalUrl = product.imagen;
    const cached = imageCache.get(externalUrl);

    if (cached && Date.now() - cached.cachedAt < IMAGE_CACHE_TTL_MS) {
      res.set("Content-Type", cached.contentType);
      res.set("Cache-Control", "public, max-age=3600");
      return res.send(cached.buffer);
    }

    const response = await axios.get(externalUrl, {
      responseType: "arraybuffer",
      timeout: 10000,
    });

    const buffer = Buffer.from(response.data);
    const contentType = response.headers["content-type"] || "image/jpeg";
    imageCache.set(externalUrl, { buffer, contentType, cachedAt: Date.now() });

    res.set("Content-Type", contentType);
    res.set("Cache-Control", "public, max-age=3600");
    res.send(buffer);
  } catch (err) {
    // Si la imagen de origen no responde, no rompe la página: el frontend
    // ya maneja esto mostrando el placeholder "Imagen" (ver ProductCard.js).
    res.status(502).end();
  }
};

module.exports = { getProducts, getProductById, getProductImage };
