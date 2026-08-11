const express = require("express");
const multer = require("multer");
const router = express.Router();
const { uploadCatalog, downloadCatalog, getStats, getProductsPreview } = require("./admin.controller");
const { protect } = require("../../middleware/auth.middleware");

// El archivo se recibe en memoria (no se escribe a disco): desde aquí se
// sube directo a Supabase Storage. Esto es necesario porque el disco local
// de la mayoría de los hosts gratuitos (Render, Railway, etc.) es efímero
// y se pierde en cada reinicio o redeploy.
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Solo se aceptan archivos Excel (.xlsx, .xls)"), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
});

router.use(protect); // Todas las rutas de administración requieren autenticación

router.get("/stats", getStats);
router.get("/products-preview", getProductsPreview);
router.get("/download-catalog", downloadCatalog);
router.post("/upload-catalog", upload.single("catalog"), uploadCatalog);

module.exports = router;
