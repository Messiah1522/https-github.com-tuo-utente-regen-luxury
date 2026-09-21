import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In sviluppo le chiamate a /api vengono inoltrate al backend (porta 5000):
// frontend e API risultano sullo stesso indirizzo, come in produzione.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // raggiungibile anche dal telefono sulla stessa rete Wi-Fi
    proxy: { "/api": "http://localhost:5000" },
  },
  build: { outDir: "dist", sourcemap: false },
});
