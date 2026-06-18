import { Router } from "express";
import { readDb, writeDb } from "../lib/db.js";

const router = Router();

router.get("/", (req, res) => {
  const db = readDb();
  const { perfil } = db;
  const puntosEnBarra = perfil.puntos % perfil.metaPuntos;
  const recompensasDisponibles = Math.floor(perfil.puntos / perfil.metaPuntos);
  const recompensasCanjeadas = perfil.recompensasCanjeadas || 0;
  const progreso = Math.round((puntosEnBarra / perfil.metaPuntos) * 100);
  const restante = perfil.metaPuntos - puntosEnBarra;
  res.json({ ...perfil, puntosEnBarra, recompensasDisponibles, recompensasCanjeadas, progreso, restante });
});

router.post("/canjear", (req, res) => {
  const db = readDb();
  db.perfil.recompensasCanjeadas = (db.perfil.recompensasCanjeadas || 0) + 1;
  writeDb(db);
  res.json({ ok: true, recompensasCanjeadas: db.perfil.recompensasCanjeadas });
});

export default router;
