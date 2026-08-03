const { createClient } = require("@supabase/supabase-js");

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

let supabase = null;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    "Supabase no está configurado. Define SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en server/.env " +
      "(los encuentras en tu proyecto de Supabase, en Project Settings > API)."
  );
} else {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Verifica que la conexión a Supabase funciona haciendo una lectura simple.
 * Se usa solo de forma informativa al iniciar el servidor; el servidor sigue
 * arriba aunque Supabase no esté disponible, igual que antes con MongoDB.
 */
const checkSupabaseConnection = async () => {
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("admin_users").select("id").limit(1);
    if (error) throw error;
    console.log("Conexión a Supabase verificada correctamente.");
    return true;
  } catch (error) {
    console.warn("No se pudo verificar la conexión a Supabase:", error.message);
    return false;
  }
};

module.exports = { supabase, checkSupabaseConnection };
