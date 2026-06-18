import { Router } from "express";
import { readDb } from "../lib/db.js";

const router = Router();

// GET /api/perfil — datos de la empresa, puntos y progreso hacia la recompensa
router.get("/", (req, res) => {
  const db = readDb();
  const { perfil } = db;
  const restante = Math.max(perfil.metaPuntos - perfil.puntos, 0);
  const progreso = Math.min(
    Math.round((perfil.puntos / perfil.metaPuntos) * 100),
    100
  );
  res.json({ ...perfil, restante, progreso });
});

export default router;
