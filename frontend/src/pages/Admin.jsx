import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.js";

// Escapa un valor para CSV (comillas, comas, saltos de línea).
const csvCell = (v) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// Pantalla oculta (no aparece en el nav): revisar y exportar las respuestas
// del formulario de feria. Acceder manualmente en /admin.
export default function Admin() {
  const navigate = useNavigate();
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getFeedback().then(setDatos).catch((e) => setError(e.message));
  }, []);

  function descargarCSV() {
    const cols = [
      "fecha",
      "nombre",
      "correo",
      "facultad",
      "rating",
      "comentario",
      "referido_nombre",
      "referido_celular",
    ];
    const filas = datos.map((d) =>
      [
        d.fecha,
        d.nombre,
        d.correo,
        d.facultad,
        d.rating,
        d.comentario,
        d.referido?.nombre || "",
        d.referido?.celular || "",
      ]
        .map(csvCell)
        .join(",")
    );
    const csv = "﻿" + [cols.join(","), ...filas].join("\n"); // BOM para tildes en Excel
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ecored-feria-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (error) return <div className="loading">{error}</div>;
  if (!datos) return <div className="loading">Cargando respuestas…</div>;

  const conReferido = datos.filter((d) => d.referido).length;

  return (
    <>
      <div className="s5-header">
        <button className="s5-back" onClick={() => navigate("/")}>
          ←
        </button>
        <div className="s5-title">Respuestas de la feria</div>
      </div>

      <div className="s5-form-content">
        <div className="s7-stats">
          <div className="s7-stat">
            <div className="s7-stat-num">{datos.length}</div>
            <div className="s7-stat-lbl">opiniones</div>
          </div>
          <div className="s7-stat">
            <div className="s7-stat-num">{conReferido}</div>
            <div className="s7-stat-lbl">referidos</div>
          </div>
        </div>

        <button
          className="s5-submit-btn"
          onClick={descargarCSV}
          disabled={datos.length === 0}
          style={{ marginTop: 4 }}
        >
          ⬇ Descargar CSV
        </button>

        {datos.length === 0 ? (
          <div className="hist-empty" style={{ marginTop: 24 }}>
            <div className="hist-empty-icon">📭</div>
            <div className="hist-empty-title">Aún no hay respuestas</div>
            <div className="hist-empty-sub">Las opiniones enviadas aparecerán aquí.</div>
          </div>
        ) : (
          <div className="s7-lista">
            {datos.map((d) => (
              <div key={d.id} className="s7-item">
                <div className="s7-item-top">
                  <span className="s7-item-nombre">{d.nombre}</span>
                  {d.rating > 0 && <span className="s7-item-rating">{"★".repeat(d.rating)}</span>}
                </div>
                <div className="s7-item-sub">
                  {d.correo}
                  {d.facultad ? ` · ${d.facultad}` : ""}
                </div>
                {d.comentario && <div className="s7-item-com">"{d.comentario}"</div>}
                {d.referido && (
                  <div className="s7-item-ref">
                    📣 Referido: {d.referido.nombre}
                    {d.referido.celular ? ` · ${d.referido.celular}` : ""}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
