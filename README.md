# EcoRed ♻️

App de **gestión de residuos electrónicos (RAEE)** para empresas en Ecuador (Guayaquil).
Conecta empresas con gestores certificados para reciclar, reparar y recolectar equipos
electrónicos de forma regulada, con suscripciones y un programa de puntos ambientales.

Prototipo funcional dividido en **frontend** (React + Vite) y **backend** (Node + Express).

## Estructura

```
app/
├── package.json          ← scripts para arrancar todo (monorepo)
├── backend/              API REST (Express)
│   ├── server.js
│   └── src/
│       ├── routes/       gestores, planes, perfil, ordenes, suscripcion
│       ├── lib/db.js     persistencia en archivo JSON
│       └── data/         seed.js (datos iniciales) → db.json (generado)
└── frontend/            App React (Vite)
    ├── index.html
    └── src/
        ├── main.jsx, App.jsx
        ├── components/   PhoneFrame, NavBar
        ├── pages/        Mapa, Gestores, Gestor, Suscripcion, Recompensas, RegistrarEquipo
        ├── services/     api.js (cliente HTTP)
        └── styles/       global.css
```

## Cómo ejecutar

Requisitos: Node.js 18+.

```bash
# 1. Instalar dependencias (raíz + backend + frontend)
npm run install:all

# 2. Arrancar backend y frontend a la vez
npm run dev
```

- Frontend: http://localhost:5173
- Backend (API): http://localhost:3001

> Vite redirige automáticamente las llamadas `/api` al backend (ver `frontend/vite.config.js`),
> así que solo necesitas abrir la URL del frontend.

Para arrancarlos por separado: `npm run dev:backend` y `npm run dev:frontend`.

## Abrir en el móvil (como app) 📱

El frontend se expone en la red local (`vite` con `host: true`). Con el PC y el móvil
en la **misma red WiFi**:

1. Arranca con `npm run dev`. Vite mostrará una URL **Network**, p. ej.
   `http://192.168.100.60:5173/` (tu IP puede variar).
2. Abre esa URL en el navegador del móvil. La app ocupa **toda la pantalla** (sin marco web).
3. Para que quede como app instalada:
   - **iPhone (Safari):** Compartir → *Agregar a inicio*. Abre a pantalla completa, sin barra del navegador.
   - **Android (Chrome):** menú ⋮ → *Agregar a pantalla de inicio* / *Instalar app*.

> **Firewall:** la primera vez Windows puede pedir permitir Node.js en redes privadas — acéptalo.
> Si el móvil no carga, permite el puerto 5173 en el Firewall de Windows (redes privadas).

> **Nota PWA:** la instalación completa (modo standalone real en Android) requiere HTTPS o
> `localhost`. Sobre `http://IP-local` iOS sí abre a pantalla completa con *Agregar a inicio*;
> en Android crea un acceso directo. Para standalone real en cualquier dispositivo, publica una
> build (`npm run build`) en un hosting con HTTPS (Netlify, Vercel, etc.).

## Producción (Render)

En producción **Express sirve también la app React compilada**, así todo es un único
servicio Node (la web y la API comparten origen, sin CORS ni proxy).

- `npm run build` → instala dependencias y compila el frontend a `frontend/dist`.
- `npm start` → arranca el servidor, que sirve `/api/*` y la app en `frontend/dist`.

### Pasos para desplegar

1. **Sube el código a GitHub** (desde la carpeta `app/`):
   ```bash
   git init
   git add .
   git commit -m "EcoTech Pro"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/ecotech-pro.git
   git push -u origin main
   ```
2. Entra a **https://render.com** → *New +* → **Blueprint** y selecciona el repo
   (Render detecta `render.yaml` automáticamente). O usa *New + → Web Service* con:
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
3. Render te da una URL HTTPS permanente, p. ej. `https://ecotech-pro.onrender.com`.
   Como es HTTPS, la PWA se instala como app real en el móvil.

> **Nota:** en el plan gratis de Render el servicio se "duerme" tras inactividad
> (la primera visita tarda ~30 s) y `db.json` se reinicia en cada redeploy. Para
> persistencia real, añade un disco persistente o una base de datos.

## Pantallas

1. **Mapa** — gestores cercanos con búsqueda y filtros por tipo de servicio.
2. **Perfil del Gestor** — certificaciones, servicios, horario y solicitud de recolección.
3. **Suscripción** — planes (mensual/anual), método de pago y factura calculada (IVA + descuento).
4. **Recompensas** — puntos ambientales, progreso e historial de recolecciones.
5. **Registrar Equipo** — formulario que crea una orden y suma puntos.

## API (resumen)

| Método | Ruta                  | Descripción                          |
|--------|-----------------------|--------------------------------------|
| GET    | `/api/gestores`       | Lista (filtro `?tipo=`)              |
| GET    | `/api/gestores/:id`   | Detalle de un gestor                 |
| GET    | `/api/planes`         | Planes de suscripción                |
| GET    | `/api/perfil`         | Empresa, puntos y progreso           |
| GET    | `/api/ordenes`        | Historial de recolecciones          |
| POST   | `/api/ordenes`        | Registrar equipo / solicitar         |
| GET    | `/api/suscripcion`    | Suscripción actual + factura         |
| POST   | `/api/suscripcion`    | Cambiar plan, ciclo o método de pago |

Los datos se guardan en `backend/src/data/db.json`. Para reiniciarlos, borra ese archivo:
se regenera desde `seed.js` al volver a arrancar.

## Diseño original

`ecoredV2-app.html` es el mockup estático inicial que sirvió de base visual.
