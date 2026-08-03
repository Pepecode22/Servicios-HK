const express = require("express");
const router = express.Router();
const {
  createQuote,
  getQuotes,
  getQuoteById,
  updateQuoteStatus,
  deleteQuote,
  emailQuote,
} = require("./quotes.controller");
const { protect } = require("../../middleware/auth.middleware");
const { publicFormLimiter } = require("../../middleware/rateLimit.middleware");

// Público — el cliente envía su cotización
router.post("/", publicFormLimiter, createQuote);

// Admin — gestión de cotizaciones
router.get("/", protect, getQuotes);
router.get("/:id", protect, getQuoteById);
router.put("/:id/estado", protect, updateQuoteStatus);
router.post("/:id/enviar-correo", protect, emailQuote);
router.delete("/:id", protect, deleteQuote);

module.exports = router;
