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

  // 1 punto por gramo (peso en kg → × 1000), mínimo 10 puntos por solicitud.
  const puntos = Math.max(10, Math.round(Number(equipo.peso || 0) * 1000));

  const nuevaOrden = {
    id: `ord-${randomUUID().slice(0, 8)}`,
    titulo: equipo.marcaModelo,
    gestorId: gestorId || null,
    gestorNombre: gestor ? gestor.nombre : "Sin asignar",
    fecha: new Date().toISOString().slice(0, 10),
    fechaRecoleccion: equipo.fechaRecoleccion || null,
    puntos,
    estado: "Pendiente",
    equipos: [equipo],
  };

  db.ordenes.push(nuevaOrden);
  db.perfil.puntos += puntos;
  writeDb(db);

  res.status(201).json(nuevaOrden);
});

// PATCH /api/ordenes/:id — cambia el estado de una orden (ej. "Cancelado")
router.patch("/:id", (req, res) => {
  const { estado } = req.body || {};
  if (!estado) return res.status(400).json({ error: "Falta el estado" });

  const db = readDb();
  const idx = db.ordenes.findIndex((o) => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Orden no encontrada" });

  if (estado === "Cancelado") {
    db.perfil.puntos = Math.max(0, db.perfil.puntos - (db.ordenes[idx].puntos || 0));
  }
  db.ordenes[idx].estado = estado;
  writeDb(db);
  res.json(db.ordenes[idx]);
});

export default router;
