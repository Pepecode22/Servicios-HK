const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const { supabase } = require("./config/supabaseClient");

const authRoutes = require("./modules/auth/auth.routes");
const productRoutes = require("./modules/products/products.routes");
const quoteRoutes = require("./modules/quotes/quotes.routes");
const contactRoutes = require("./modules/contact/contact.routes");
const adminRoutes = require("./modules/admin/admin.routes");

const app = express();

// Render (y la mayoría de los hosts en la nube) ponen el servidor detrás de
// un único proxy inverso, que agrega el header X-Forwarded-For con la IP
// real del visitante. Sin esto, Express ignora ese header por defecto, y
// el limitador de intentos (express-rate-limit) no puede identificar
// visitantes individuales correctamente — además de generar advertencias
// en los logs. El valor "1" le dice a Express que confíe en exactamente
// un salto de proxy por delante (el de Render), ni más ni menos.
app.set("trust proxy", 1);

// Middleware de seguridad
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Archivos estáticos (imágenes de productos, catálogo subido, etc.)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Rutas de la API
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminRoutes);

// Salud del servidor. También sirve como "keep-alive": cada vez que se
// consulta, escribe en la tabla `heartbeat` de Supabase — una escritura
// real (no solo una lectura) para evitar que el proyecto se pause tras 7
// días sin actividad en el plan gratuito. Ver .github/workflows/keep-alive.yml,
// que llama a este endpoint automáticamente cada pocos días.
app.get("/api/health", async (req, res) => {
  const databaseConfigured = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  let heartbeat = "skipped";

  if (databaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from("heartbeat")
        .upsert({ id: 1, pinged_at: new Date().toISOString() });
      heartbeat = error ? `error: ${error.message}` : "ok";
    } catch (err) {
      heartbeat = `error: ${err.message}`;
    }
  }

  res.json({
    status: "OK",
    message: "Servicios HK API running",
    database: databaseConfigured ? "configured" : "not-configured",
    heartbeat,
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

module.exports = app;
