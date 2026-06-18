// Capa de persistencia simple basada en un archivo JSON.
// Evita depender de una base de datos externa: ideal para un prototipo.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { seed } from "../data/seed.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "..", "data", "db.json");

function ensureDb() {
  if (!existsSync(DB_PATH)) {
    mkdirSync(dirname(DB_PATH), { recursive: true });
    writeFileSync(DB_PATH, JSON.stringify(seed, null, 2), "utf-8");
  }
}

export function readDb() {
  ensureDb();
  return JSON.parse(readFileSync(DB_PATH, "utf-8"));
}

export function writeDb(data) {
  writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  return data;
}

// Reinicia la base de datos a los valores de la semilla (útil en desarrollo).
export function resetDb() {
  return writeDb(seed);
}
