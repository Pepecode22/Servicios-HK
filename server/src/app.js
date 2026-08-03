const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

const authRoutes = require("./modules/auth/auth.routes");
const productRoutes = require("./modules/products/products.routes");
const quoteRoutes = require("./modules/quotes/quotes.routes");
const contactRoutes = require("./modules/contact/contact.routes");
const adminRoutes = require("./modules/admin/admin.routes");

const app = express();

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

// Salud del servidor
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Servicios HK API running",
    database:
      process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY ? "configured" : "not-configured",
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
