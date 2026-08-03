/**
 * Crea la cuenta de administrador inicial en Supabase, usando las variables
 * ADMIN_EMAIL y ADMIN_PASSWORD definidas en server/.env
 * Ejecutar: npm run seed
 */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { supabase } = require("../config/supabaseClient");

const seed = async () => {
  if (!supabase) {
    console.error("Supabase no está configurado. Revisa SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env");
    process.exit(1);
  }

  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    console.error("Debes definir ADMIN_EMAIL y ADMIN_PASSWORD en server/.env antes de ejecutar el seed.");
    process.exit(1);
  }

  try {
    const { data: existing, error: findError } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", process.env.ADMIN_EMAIL.toLowerCase())
      .maybeSingle();

    if (findError) throw findError;

    if (existing) {
      console.log("El administrador ya existe, no se crea uno nuevo:", process.env.ADMIN_EMAIL);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);

    const { error: insertError } = await supabase.from("admin_users").insert({
      nombre: "Administrador HK",
      email: process.env.ADMIN_EMAIL.toLowerCase(),
      password_hash: passwordHash,
      role: "admin",
    });

    if (insertError) throw insertError;

    console.log("Administrador creado correctamente:", process.env.ADMIN_EMAIL);
    process.exit(0);
  } catch (err) {
    console.error("Error al ejecutar el seed:", err.message);
    process.exit(1);
  }
};

seed();
