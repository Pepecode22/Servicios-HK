const express = require("express");
const router = express.Router();
const { sendContact, getContacts, markAsRead, deleteContact, emailContact } = require("./contact.controller");
const { protect } = require("../../middleware/auth.middleware");
const { publicFormLimiter } = require("../../middleware/rateLimit.middleware");

// Público
router.post("/", publicFormLimiter, sendContact);

// Admin
router.get("/", protect, getContacts);
router.put("/:id/leido", protect, markAsRead);
router.post("/:id/enviar-correo", protect, emailContact);
router.delete("/:id", protect, deleteContact);

module.exports = router;
