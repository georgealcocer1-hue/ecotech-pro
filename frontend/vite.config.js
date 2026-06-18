import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // expone en la red local (0.0.0.0) para abrir desde el móvil
    allowedHosts: true, // permite abrir vía túnel (localtunnel/ngrok/cloudflare)
    // Redirige las llamadas /api al backend Express en desarrollo.
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
