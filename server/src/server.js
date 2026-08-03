require("dotenv").config();
const app = require("./app");
const { checkSupabaseConnection } = require("./config/supabaseClient");
const { ensureBucketExists } = require("./utils/catalogStorage");

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV || "development"}`);
  await checkSupabaseConnection();
  await ensureBucketExists();
});
