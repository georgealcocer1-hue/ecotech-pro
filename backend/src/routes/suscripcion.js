import { Router } from "express";
import { readDb, writeDb } from "../lib/db.js";

const router = Router();

// GET /api/suscripcion — suscripción actual con el detalle de la factura calculado
router.get("/", (req, res) => {
  const db = readDb();
  res.json(construirResumen(db));
});

// POST /api/suscripcion — actualiza plan, ciclo (mensual/anual) o método de pago.
// Body: { planId, ciclo, metodoPago }
router.post("/", (req, res) => {
  const { planId, ciclo, metodoPago } = req.body || {};
  const db = readDb();

  if (planId) {
    const existe = db.planes.some((p) => p.id === planId);
    if (!existe) return res.status(400).json({ error: "Plan inválido" });
    db.suscripcion.planId = planId;
  }
  if (ciclo) db.suscripcion.ciclo = ciclo;
  if (metodoPago) db.suscripcion.metodoPago = metodoPago;

  writeDb(db);
  res.json(construirResumen(db));
});

// Calcula el desglose de la factura (subtotal, IVA 15% Ecuador, descuento, total).
function construirResumen(db) {
  const { suscripcion, planes } = db;
  const plan = planes.find((p) => p.id === suscripcion.planId) || planes[0];
  const anual = suscripcion.ciclo === "anual";
  const subtotal = anual ? plan.precioAnual : plan.precioMensual;
  const iva = Math.round(subtotal * 0.15 * 100) / 100;
  const descuento = Math.round(subtotal * 0.1 * 100) / 100; // 10% primer periodo
  const total = Math.round((subtotal + iva - descuento) * 100) / 100;

  return {
    ...suscripcion,
    plan,
    factura: { subtotal, iva, descuento, total },
  };
}

export default router;
