const { execSync } = require("child_process")

try {
  console.log("🔧 Instalando dependencias...")
  execSync("npm install", { stdio: "inherit" })
  console.log("✅ Dependencias instaladas exitosamente!")
} catch (error) {
  console.error("❌ Error al instalar dependencias:", error.message)
}
