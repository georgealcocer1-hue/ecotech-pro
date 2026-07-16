import { Router } from "express";
import { readDb } from "../lib/db.js";

const router = Router();

// GET /api/info — información educativa sobre RAEE en Ecuador (pantalla de inicio)
router.get("/", (req, res) => {
  const { infoRaee } = readDb();
  res.json(infoRaee || {});
});

export default router;
