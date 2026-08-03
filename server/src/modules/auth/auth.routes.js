const express = require("express");
const router = express.Router();
const { login, changePassword, getMe } = require("./auth.controller");
const { protect } = require("../../middleware/auth.middleware");
const { authLimiter } = require("../../middleware/rateLimit.middleware");

router.post("/login", authLimiter, login);
router.get("/me", protect, getMe);
router.put("/change-password", protect, changePassword);

module.exports = router;
