const XLSX = require("xlsx");
const { supabase } = require("../config/supabaseClient");

const BUCKET_NAME = "catalogo";
const FILE_PATH = "catalogo.xlsx";

/**
 * El catálogo se guarda en un bucket privado de Supabase Storage (no en
 * disco local) para que persista sin importar reinicios, redeploys o
 * cuántas instancias del servidor estén corriendo — algo indispensable en
 * hosts con disco efímero (Render, Railway, Vercel, etc.).
 *
 * Se mantiene una caché simple en memoria: el archivo solo se vuelve a
 * descargar y parsear cuando alguien sube uno nuevo (ver saveCatalog). Esto
 * evita golpear Supabase Storage en cada visita al catálogo.
 */
let cache = null;

// Quita tildes/diacríticos y normaliza a minúsculas para comparar encabezados
// sin importar cómo los haya escrito quien preparó el archivo.
const normalizeHeader = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const EXPECTED_HEADERS = ["nombre", "marca", "descripcion", "categoria", "codigo", "imagen"];

/**
 * Convierte el contenido binario de un archivo Excel a un arreglo de
 * productos. Columnas esperadas: Nombre | Marca | Descripción | Categoría |
 * Código | Imagen (no distingue mayúsculas/tildes ni depende del orden de
 * las columnas — se identifican por el nombre del encabezado).
 *
 * IMPORTANTE: la librería xlsx es muy permisiva — hasta un archivo de texto
 * plano se "parsea" sin lanzar ninguna excepción. Por eso no basta con
 * confiar en que XLSX.read() falle: se valida explícitamente que la
 * primera fila tenga al menos uno de los encabezados esperados, para
 * rechazar archivos que no son realmente un catálogo.
 */
const parseWorkbookBuffer = (buffer) => {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error("El archivo no contiene ninguna hoja de cálculo.");
  }

  const sheet = workbook.Sheets[sheetName];

  const headerRow = (XLSX.utils.sheet_to_json(sheet, { header: 1 })[0] || []).map(normalizeHeader);
  const hasExpectedHeader = EXPECTED_HEADERS.some((h) => headerRow.includes(h));

  if (!hasExpectedHeader) {
    throw new Error(
      "El archivo no tiene el formato esperado. La primera fila debe traer los encabezados: Nombre, Marca, Descripción, Categoría, Código, Imagen."
    );
  }

  const raw = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  return raw
    .map((row) => {
      const normalized = {};
      Object.keys(row).forEach((key) => {
        normalized[normalizeHeader(key)] = row[key];
      });

      return {
        codigo: String(normalized["codigo"] || "").trim(),
        nombre: String(normalized["nombre"] || "").trim(),
        marca: String(normalized["marca"] || "").trim(),
        descripcion: String(normalized["descripcion"] || "").trim(),
        categoria: String(normalized["categoria"] || "General").trim(),
        imagen: normalized["imagen"] ? String(normalized["imagen"]).trim() : null,
      };
    })
    .filter((product) => product.nombre) // ignora filas vacías
    .map((product, index) => ({
      ...product,
      // El "id" interno usado por el frontend/carrito es el Código del
      // producto. Si una fila no trae código, se usa un correlativo como
      // respaldo, pero lo ideal es que todo producto tenga uno único.
      id: product.codigo || `SIN-CODIGO-${index + 1}`,
    }));
};

/**
 * Crea el bucket "catalogo" en Supabase Storage si todavía no existe.
 * Se llama una vez al iniciar el servidor (ver server.js) para que el
 * administrador no tenga que crearlo a mano desde el dashboard.
 */
const ensureBucketExists = async () => {
  if (!supabase) return;

  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) throw error;

    const exists = buckets.some((b) => b.name === BUCKET_NAME);
    if (exists) return;

    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: false, // privado: solo el backend (con la service role key) puede leerlo
      fileSizeLimit: "5MB",
    });

    if (createError) throw createError;
    console.log(`Bucket "${BUCKET_NAME}" creado en Supabase Storage.`);
  } catch (err) {
    console.warn(`No se pudo verificar/crear el bucket "${BUCKET_NAME}":`, err.message);
  }
};

/**
 * Lee el catálogo. Usa la caché en memoria si ya se descargó antes; si no,
 * lo descarga desde Supabase Storage. Si todavía no se ha subido ningún
 * catálogo, retorna un arreglo vacío (no es un error).
 */
const readCatalog = async () => {
  if (cache) return cache;

  if (!supabase) {
    console.warn("Supabase no está configurado; no se puede leer el catálogo.");
    return [];
  }

  const { data, error } = await supabase.storage.from(BUCKET_NAME).download(FILE_PATH);

  if (error) {
    // Es normal que esto ocurra si todavía no se ha subido ningún catálogo.
    if (!/not.?found/i.test(error.message)) {
      console.error("Error descargando el catálogo desde Supabase Storage:", error.message);
    }
    return [];
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  const products = parseWorkbookBuffer(buffer);
  cache = products;
  return products;
};

/**
 * Sube un nuevo catálogo a Supabase Storage (reemplazando el anterior) y
 * actualiza la caché en memoria de inmediato. Lanza un error si el archivo
 * no se puede interpretar como Excel — así nunca se sube un archivo
 * corrupto o con el formato equivocado.
 */
const saveCatalog = async (buffer) => {
  let products;
  try {
    products = parseWorkbookBuffer(buffer);
  } catch (err) {
    throw new Error("El archivo no se pudo leer como Excel. Verifica que el formato sea .xlsx válido.");
  }

  if (!supabase) {
    throw new Error("Supabase no está configurado. Define SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en server/.env.");
  }

  const { error } = await supabase.storage.from(BUCKET_NAME).upload(FILE_PATH, buffer, {
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    upsert: true,
  });

  if (error) {
    throw new Error(`Error al subir el catálogo a Supabase Storage: ${error.message}`);
  }

  cache = products;
  return products;
};

/**
 * Descarga el archivo Excel original (los bytes tal cual, no el JSON
 * parseado) desde Supabase Storage. Se usa para el botón "Descargar Excel"
 * del panel admin. Retorna null si todavía no se ha subido ningún catálogo.
 */
const downloadCatalogFile = async () => {
  if (!supabase) {
    throw new Error("Supabase no está configurado. Define SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en server/.env.");
  }

  const { data, error } = await supabase.storage.from(BUCKET_NAME).download(FILE_PATH);

  if (error) {
    if (/not.?found/i.test(error.message)) return null;
    throw new Error(`Error al descargar el catálogo desde Supabase Storage: ${error.message}`);
  }

  return Buffer.from(await data.arrayBuffer());
};

module.exports = { readCatalog, saveCatalog, downloadCatalogFile, parseWorkbookBuffer, ensureBucketExists };
