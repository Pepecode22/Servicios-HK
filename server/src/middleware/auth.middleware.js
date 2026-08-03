const jwt = require("jsonwebtoken");
const { supabase } = require("../config/supabaseClient");

/**
 * Protege rutas que requieren una sesión de administrador válida.
 * Verifica el JWT y adjunta el usuario (sin password_hash) en req.user.
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No autorizado. Token requerido.",
    });
  }

  // 1) Verificar el JWT. Si esto falla, el token realmente es inválido o
  // expiró — es correcto responder 401 y forzar un nuevo login.
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Token inválido o expirado.",
    });
  }

  // 2) Buscar el usuario en Supabase. Esto es un paso aparte a propósito:
  // un error de red o de conexión con Supabase NO significa que el token
  // sea inválido, así que no debe responder 401 (el frontend interpretaría
  // eso como "sesión expirada" y cerraría la sesión innecesariamente).
  try {
    const { data: user, error } = await supabase
      .from("admin_users")
      .select("id, nombre, email, role")
      .eq("id", decoded.id)
      .single();

    if (error) {
      console.error("Error consultando admin_users en /protect:", error.message);
      return res.status(503).json({
        success: false,
        message: "No se pudo verificar la sesión (error de conexión con la base de datos). Intenta nuevamente.",
      });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: "Usuario no encontrado." });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Error inesperado en /protect:", err.message);
    return res.status(503).json({
      success: false,
      message: "No se pudo verificar la sesión. Intenta nuevamente.",
    });
  }
};

module.exports = { protect };
