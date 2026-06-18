# Cómo trabajar en este proyecto desde otra computadora

Pasos para abrir y correr **EcoTech Pro** en una laptop nueva usando **VS Code**.

## 1. Instalar lo necesario (una sola vez por máquina)

1. **Node.js** (versión LTS) → https://nodejs.org → instalar con "Next, Next, Finish".
2. **Git** → https://git-scm.com/download/win → instalar con las opciones por defecto.
3. **VS Code** → https://code.visualstudio.com (si no lo tienes).

> Después de instalar, **cierra y abre VS Code** para que reconozca Node y Git.

Para comprobar que quedaron instalados, abre en VS Code el menú
**Terminal → New Terminal** y escribe:
```bash
node --version
git --version
```
Si ambos muestran un número de versión, todo bien.

## 2. Descargar (clonar) el proyecto

En VS Code:

1. **Terminal → New Terminal**.
2. Ve a la carpeta donde quieras guardarlo (por ejemplo el Escritorio):
   ```bash
   cd Desktop
   ```
3. Clona el repositorio:
   ```bash
   git clone https://github.com/georgealcocer1-hue/ecotech-pro.git
   ```
4. Abre la carpeta en VS Code:
   ```bash
   code ecotech-pro
   ```
   (o: **Archivo → Abrir carpeta → ecotech-pro**)

## 3. Instalar dependencias y arrancar

Con la carpeta `ecotech-pro` abierta, en la terminal de VS Code:

```bash
npm run install:all
npm run dev
```

Abre en el navegador **http://localhost:5173** — ya puedes desarrollar.
Para detener el servidor: en la terminal pulsa **Ctrl + C**.

## 4. Guardar y subir tus cambios

Cada vez que termines de hacer mejoras:

```bash
git add .
git commit -m "describe lo que cambiaste"
git push
```

Al hacer `git push`, **Render redepliega solo** la versión nueva en tu URL pública.

## 5. Regla de oro para trabajar en 2 máquinas (PC y laptop)

**Antes de empezar a trabajar, siempre baja lo último:**
```bash
git pull
```
Y al terminar, sube con `git push`.
Así la PC y la laptop siempre tienen la misma versión y evitas conflictos.

> Si `git pull` trae cambios en dependencias, vuelve a correr `npm run install:all`.
> Nunca copies la carpeta `node_modules` entre máquinas: se instala en cada una.
