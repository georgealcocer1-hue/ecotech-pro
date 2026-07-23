import { Router } from "express";
import { randomUUID } from "node:crypto";
import { readDb, writeDb } from "../lib/db.js";

const router = Router();

// GET /api/feedback — respuestas recolectadas (para ver / exportar tras la feria)
router.get("/", (req, res) => {
  const db = readDb();
  res.json(db.feedback || []);
});

// POST /api/feedback — registra una respuesta del formulario de feria.
// Body: { nombre, correo, facultad, comentario, rating, referido: { nombre, celular } }
router.post("/", (req, res) => {
  const { nombre, correo, facultad, comentario, rating, referido } = req.body || {};

  if (!nombre || !nombre.trim()) {
    return res.status(400).json({ error: "Falta el nombre" });
  }
  if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return res.status(400).json({ error: "Correo inválido" });
  }

  const db = readDb();
  if (!Array.isArray(db.feedback)) db.feedback = [];

  const entrada = {
    id: `fb-${randomUUID().slice(0, 8)}`,
    fecha: new Date().toISOString(),
    nombre: nombre.trim(),
    correo: correo.trim(),
    facultad: facultad || "",
    comentario: (comentario || "").trim(),
    rating: Number(rating) || 0,
    referido:
      referido && referido.nombre && referido.nombre.trim()
        ? {
            nombre: String(referido.nombre).trim(),
            celular: String(referido.celular || "").trim(),
          }
        : null,
  };

  db.feedback.push(entrada);
  writeDb(db);
  res.status(201).json({ ok: true, id: entrada.id });
});

export default router;
