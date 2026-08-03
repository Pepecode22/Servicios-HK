/**
 * Genera un catálogo de ejemplo y lo sube directo a Supabase Storage
 * (bucket "catalogo"), igual que si se subiera desde el panel admin.
 * Requiere SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY configurados en .env.
 *
 * Ejecutar: npm run seed:catalog  (o node src/utils/generateExampleCatalog.js)
 */
require("dotenv").config();
const XLSX = require("xlsx");
const { saveCatalog, ensureBucketExists } = require("./catalogStorage");

const products = [
  { Nombre: "Casco de Seguridad Industrial", Marca: "3M", "Descripción": "Casco de alta resistencia HDPE, ajuste de trinquete", "Categoría": "EPP", "Código": "EPP-001", Imagen: "" },
  { Nombre: "Guantes de Nitrilo Talla L", Marca: "Kimberly-Clark", "Descripción": "Guantes desechables resistentes a químicos, caja x100", "Categoría": "EPP", "Código": "EPP-002", Imagen: "" },
  { Nombre: "Lentes de Seguridad Transparentes", Marca: "3M", "Descripción": "Protección UV, antirayadura, antipintura", "Categoría": "EPP", "Código": "EPP-003", Imagen: "" },
  { Nombre: "Mascarilla KN95", Marca: "Deltaplus", "Descripción": "Mascarilla filtrante partículas finas, caja x25", "Categoría": "EPP", "Código": "EPP-004", Imagen: "" },
  { Nombre: "Chaleco Reflectante Alta Visibilidad", Marca: "Ansell", "Descripción": "Chaleco clase 2, tallas S a XL", "Categoría": "EPP", "Código": "EPP-005", Imagen: "" },
  { Nombre: "Zapatos de Seguridad Punta de Acero", Marca: "Caterpillar", "Descripción": "Calzado de seguridad dieléctrico, tallas 38-46", "Categoría": "EPP", "Código": "EPP-006", Imagen: "" },
  { Nombre: "Detergente Industrial Desengrasante 5L", Marca: "Proclin", "Descripción": "Desengrasante concentrado para maquinaria y pisos", "Categoría": "Aseo", "Código": "ASE-001", Imagen: "" },
  { Nombre: "Desinfectante Ambiental 1L", Marca: "Johnson", "Descripción": "Desinfectante de amplio espectro, sin olor residual", "Categoría": "Aseo", "Código": "ASE-002", Imagen: "" },
  { Nombre: "Dispensador de Jabón Industrial", Marca: "Tork", "Descripción": "Dispensador de palanca 1000ml, apto para jabón espuma y líquido", "Categoría": "Aseo", "Código": "ASE-003", Imagen: "" },
  { Nombre: "Escoba Industrial de Cerdas Duras", Marca: "Vileda", "Descripción": "Mango de aluminio 1.4m, cabezal recambiable", "Categoría": "Aseo", "Código": "ASE-004", Imagen: "" },
  { Nombre: "Candado de Seguridad LOTO", Marca: "Brady", "Descripción": "Candado rojo para bloqueo y etiquetado, cuerpo aluminio", "Categoría": "Industrial", "Código": "IND-001", Imagen: "" },
  { Nombre: "Cinta de Señalización Amarilla x100m", Marca: "3M", "Descripción": "Cinta de peligro, no adhesiva, alta visibilidad", "Categoría": "Industrial", "Código": "IND-002", Imagen: "" },
  { Nombre: "Extintor PQS 6 kg", Marca: "Amerex", "Descripción": "Extintor polvo químico seco ABC, presurizado", "Categoría": "Industrial", "Código": "IND-003", Imagen: "" },
  { Nombre: "Señalética Ruta Evacuación PVC", Marca: "Master Safety", "Descripción": "Set 10 señaléticas fotoluminiscentes, 20x30cm", "Categoría": "Industrial", "Código": "IND-004", Imagen: "" },
];

const run = async () => {
  try {
    const headerOrder = ["Nombre", "Marca", "Descripción", "Categoría", "Código", "Imagen"];
    const ws = XLSX.utils.json_to_sheet(products, { header: headerOrder });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Catalogo");

    // Genera el archivo directo en memoria (buffer), sin tocar el disco.
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    await ensureBucketExists();
    const saved = await saveCatalog(buffer);

    console.log(`Catálogo de ejemplo subido a Supabase Storage (bucket "catalogo").`);
    console.log(`${saved.length} productos de ejemplo cargados.`);
    process.exit(0);
  } catch (err) {
    console.error("Error generando el catálogo de ejemplo:", err.message);
    process.exit(1);
  }
};

run();
