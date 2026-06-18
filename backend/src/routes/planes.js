import { Router } from "express";
import { readDb } from "../lib/db.js";

const router = Router();

// GET /api/planes — lista de planes de suscripción
router.get("/", (req, res) => {
  res.json(readDb().planes);
});

export default router;
