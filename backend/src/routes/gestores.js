import { Router } from "express";
import { readDb } from "../lib/db.js";

const router = Router();

// GET /api/gestores  — lista de gestores, con filtro opcional ?tipo=Reciclaje
router.get("/", (req, res) => {
  const { tipo } = req.query;
  const { gestores } = readDb();
  const lista = tipo && tipo !== "Todos"
    ? gestores.filter((g) => g.tipo === tipo)
    : gestores;
  res.json(lista);
});

// GET /api/gestores/:id  — detalle de un gestor
router.get("/:id", (req, res) => {
  const { gestores } = readDb();
  const gestor = gestores.find((g) => g.id === req.params.id);
  if (!gestor) {
    return res.status(404).json({ error: "Gestor no encontrado" });
  }
  res.json(gestor);
});

export default router;
