import express from "express";
import cors from "cors";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import gestoresRouter from "./src/routes/gestores.js";
import planesRouter from "./src/routes/planes.js";
import perfilRouter from "./src/routes/perfil.js";
import ordenesRouter from "./src/routes/ordenes.js";
import suscripcionRouter from "./src/routes/suscripcion.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Salud del servicio
app.get("/api/health", (req, res) => res.json({ ok: true, service: "ecored-api" }));

// Rutas de la API
app.use("/api/gestores", gestoresRouter);
app.use("/api/planes", planesRouter);
app.use("/api/perfil", perfilRouter);
app.use("/api/ordenes", ordenesRouter);
app.use("/api/suscripcion", suscripcionRouter);

// En producción servimos la app React compilada (frontend/dist) desde el mismo
// servidor, de modo que /api y la web comparten origen (sin CORS ni proxy).
const distPath = join(__dirname, "..", "frontend", "dist");
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  // Fallback SPA: cualquier ruta que no sea /api devuelve index.html
  // para que el enrutado del lado del cliente (React Router) funcione.
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`🌿 EcoRed corriendo en http://localhost:${PORT}`);
});
