# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**EcoTech Pro** — a functional prototype of a mobile app for managing electronic waste (RAEE) for businesses in Ecuador (Guayaquil context: Ordenanza GAD, ISO 14001, NOM-161). It is an ESPOL Emprendimiento coursework project.

The repo is a small **monorepo** with two independent npm packages:
- `frontend/` — React 18 + Vite SPA (the mobile UI, rendered inside a phone frame).
- `backend/` — Node + Express REST API with file-based JSON persistence (no external database).

`ecoredV2-app.html` at the root is the **original static mockup** that the app was built from. It is kept only as a visual reference — it is not part of the running app. The CSS in `frontend/src/styles/global.css` is a port of that mockup's styles.

## Commands

```bash
npm run install:all   # install root + backend + frontend deps
npm run dev           # run backend (3001) + frontend (5173) together via concurrently
npm run dev:backend   # backend only
npm run dev:frontend  # frontend only
npm run build         # production build of the frontend
```

Open http://localhost:5173. There is **no test suite or linter** configured. To verify changes, build the frontend (`npm run build`) and/or hit the API with curl (e.g. `curl http://localhost:3001/api/health`).

## Architecture

**Data flow:** React pages call `frontend/src/services/api.js` → `fetch('/api/...')` → Vite dev proxy forwards `/api` to `http://localhost:3001` (configured in `frontend/vite.config.js`) → Express routes read/write the JSON store. There is no shared types package; the frontend trusts the JSON shapes defined in the backend seed.

**Backend persistence:** `backend/src/lib/db.js` is the single source of read/write. On first run it copies `backend/src/data/seed.js` into `backend/src/data/db.json` (gitignored) and all mutations (`POST /ordenes`, `POST /suscripcion`) rewrite that file. To reset state, delete `db.json` — it regenerates from the seed. **`seed.js` is the canonical data definition**: changing the data model (gestores, planes, perfil, ordenes) starts there, and existing `db.json` must be deleted to pick up structural changes.

**Routing:** `frontend/src/App.jsx` defines all routes under a single `PhoneFrame` layout route. `PhoneFrame` renders the phone shell + an `<Outlet>` and conditionally shows the bottom `NavBar` — it is hidden on detail screens via the `sinNav` regex list (gestor profile, registrar form). Pages map 1:1 to the five original mockup screens: `Mapa`, `Gestor` (+ `Gestores` list), `Suscripcion`, `Recompensas`, `RegistrarEquipo`.

## Conventions

- **Code/UI text is in Spanish** (variables, comments, and user-facing strings). Match this.
- **Styling is plain global CSS**, not CSS modules or a framework. Classes use the original mockup's `sN-*` prefix convention (`s1-` map, `s2-` gestor, `s3-` suscripción, `s4-` recompensas, `s5-` formulario) plus shared design tokens defined as CSS custom properties in `:root`. Reuse tokens and existing classes rather than adding inline colors.
- **ES modules everywhere** (`"type": "module"` in both packages).
- When adding an endpoint: create a router in `backend/src/routes/`, mount it in `backend/server.js`, and add a matching method to the `api` object in `frontend/src/services/api.js`.
