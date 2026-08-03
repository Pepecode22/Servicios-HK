const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { supabase } = require("../../config/supabaseClient");

// @desc  Login admin
// @route POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email y contraseña requeridos." });
    }

    const { data: user, error } = await supabase
      .from("admin_users")
      .select("id, nombre, email, role, password_hash")
      .eq("email", email.toLowerCase())
      .single();

    if (error || !user) {
      return res.status(401).json({ success: false, message: "Credenciales incorrectas." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Credenciales incorrectas." });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    res.json({
      success: true,
      token,
      user: { id: user.id, nombre: user.nombre, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Cambiar contraseña
// @route PUT /api/auth/change-password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const { data: user, error } = await supabase
      .from("admin_users")
      .select("id, password_hash")
      .eq("id", req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Contraseña actual incorrecta." });
    }

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "La nueva contraseña debe tener al menos 8 caracteres.",
      });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    const { error: updateError } = await supabase
      .from("admin_users")
      .update({ password_hash: newHash })
      .eq("id", user.id);

    if (updateError) throw updateError;

    res.json({ success: true, message: "Contraseña actualizada correctamente." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Verificar token / obtener usuario actual
// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { login, changePassword, getMe };
