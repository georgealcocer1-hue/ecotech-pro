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

// GET /api/perfil/estadisticas — impacto de la empresa calculado desde sus órdenes
// + ranking frente a otras empresas.
router.get("/estadisticas", (req, res) => {
  const db = readDb();
  const { perfil, ordenes, rankingEmpresas } = db;

  // 1 punto = 1 gramo, así que kg = puntos / 1000. Se excluyen las canceladas.
  const kgOrdenes = ordenes
    .filter((o) => o.estado !== "Cancelado")
    .reduce((suma, o) => suma + (o.puntos || 0), 0) / 1000;
  const kgTotal = (perfil.kgHistorico || 0) + kgOrdenes;
  const toneladas = kgTotal / 1000;

  const completadas = ordenes.filter((o) => o.estado === "Completado").length;
  const pendientes = ordenes.filter((o) => o.estado === "Pendiente").length;

  // Referencias nacionales: Ecuador genera ~87.575 t/año y solo el 4% se
  // recicla formalmente (Global E-waste Monitor / MAATE).
  const NACIONAL_T = 87575;
  const RECICLADO_FORMAL_T = NACIONAL_T * 0.04;
  const porcentajeNacional = (toneladas / NACIONAL_T) * 100;
  const porcentajeRecicladoFormal = (toneladas / RECICLADO_FORMAL_T) * 100;

  // Estimación: reciclar 1 t de RAEE evita ~1,44 t de CO₂.
  const co2Evitado = toneladas * 1.44;

  const ranking = [
    ...(rankingEmpresas || []),
    { nombre: perfil.empresa, toneladas: Math.round(toneladas * 10) / 10, esUsuario: true },
  ]
    .sort((a, b) => b.toneladas - a.toneladas)
    .map((e, i) => ({ ...e, posicion: i + 1 }));

  res.json({
    toneladas: Math.round(toneladas * 10) / 10,
    completadas,
    pendientes,
    porcentajeNacional: Math.round(porcentajeNacional * 1000) / 1000,
    porcentajeRecicladoFormal: Math.round(porcentajeRecicladoFormal * 100) / 100,
    co2Evitado: Math.round(co2Evitado * 10) / 10,
    ranking,
  });
});

router.post("/canjear", (req, res) => {
  const db = readDb();
  db.perfil.recompensasCanjeadas = (db.perfil.recompensasCanjeadas || 0) + 1;
  writeDb(db);
  res.json({ ok: true, recompensasCanjeadas: db.perfil.recompensasCanjeadas });
});

export default router;
