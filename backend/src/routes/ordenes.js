import { Router } from "express";
import { randomUUID } from "node:crypto";
import { readDb, writeDb } from "../lib/db.js";

const router = Router();

// GET /api/ordenes — historial de recolecciones (más recientes primero)
router.get("/", (req, res) => {
  const { ordenes } = readDb();
  const orden = [...ordenes].sort((a, b) => b.fecha.localeCompare(a.fecha));
  res.json(orden);
});

// POST /api/ordenes — registra un equipo / solicita una recolección.
// Body esperado: { gestorId, equipo: { marcaModelo, estado, cantidad, peso, dimension, comentarios } }
router.post("/", (req, res) => {
  const { gestorId, equipo } = req.body || {};

  if (!equipo || !equipo.marcaModelo) {
    return res
      .status(400)
      .json({ error: "Falta la marca/modelo del equipo" });
  }

  const db = readDb();
  const gestor = db.gestores.find((g) => g.id === gestorId);

  // Puntos estimados: base + bonus por peso registrado.
  const peso = Number(equipo.peso) || 0;
  const cantidad = Number(equipo.cantidad) || 1;
  const puntos = Math.round(50 + peso * 10 + cantidad * 5);

  const nuevaOrden = {
    id: `ord-${randomUUID().slice(0, 8)}`,
    titulo: equipo.marcaModelo,
    gestorId: gestorId || null,
    gestorNombre: gestor ? gestor.nombre : "Sin asignar",
    fecha: new Date().toISOString().slice(0, 10),
    puntos,
    estado: "Pendiente",
    equipos: [equipo],
  };

  db.ordenes.push(nuevaOrden);
  db.perfil.puntos += puntos;
  writeDb(db);

  res.status(201).json(nuevaOrden);
});

export default router;
