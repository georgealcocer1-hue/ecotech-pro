/**
 * EcoRed — Guardar respuestas del formulario de feria en Google Sheets
 * =====================================================================
 *
 * PASOS PARA CONECTARLO (una sola vez):
 *
 *  1. Entra a https://sheets.new  y crea una Hoja de Google en blanco.
 *     Ponle un nombre, por ejemplo "EcoRed - Feria".
 *
 *  2. En el menú:  Extensiones  →  Apps Script.
 *
 *  3. Borra todo lo que aparezca y PEGA este archivo completo.
 *     Guarda (icono de disquete o Ctrl+S).
 *
 *  4. Arriba a la derecha:  Implementar  →  Nueva implementación.
 *       - Junto a "Seleccionar tipo" (rueda dentada) elige: Aplicación web.
 *       - Descripción:            EcoRed feria
 *       - Ejecutar como:          Yo (tu correo)
 *       - Quién tiene acceso:     Cualquier persona
 *       - Clic en "Implementar" y autoriza los permisos (tu cuenta de Google).
 *
 *  5. Copia la "URL de la aplicación web" (termina en /exec).
 *
 *  6. Pega esa URL en:  frontend/src/config.js
 *       export const GOOGLE_SCRIPT_URL = "https://script.google.com/.../exec";
 *
 *  7. Vuelve a desplegar la app (git push) o córrela en local.
 *     ¡Listo! Cada respuesta se agrega como una fila en tu Hoja de Google.
 *
 *  Si más adelante cambias el código, usa Implementar → Administrar
 *  implementaciones → editar (lápiz) → Nueva versión, para conservar la
 *  misma URL.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000); // evita filas mezcladas si llegan dos a la vez

  try {
    var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Respuestas");
    if (!hoja) {
      hoja = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Respuestas");
    }
    // Encabezados la primera vez.
    if (hoja.getLastRow() === 0) {
      hoja.appendRow([
        "Fecha", "Nombre", "Ocupación", "Facultad", "Correo", "Celular",
        "Tipo", "Descripción", "Rating", "Referido - Nombre", "Referido - Celular",
      ]);
    }

    var d = JSON.parse(e.postData.contents);
    var ref = d.referido || {};

    hoja.appendRow([
      new Date(),
      d.nombre || "",
      d.ocupacion || "",
      d.facultad || "",
      d.correo || "",
      d.celular || "",
      d.tipo || "",
      d.descripcion || "",
      d.rating || "",
      ref.nombre || "",
      ref.celular || "",
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
