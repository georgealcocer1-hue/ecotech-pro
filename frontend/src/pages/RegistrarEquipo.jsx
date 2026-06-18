import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api.js";

const ESTADOS = [
  { id: "funcional", emoji: "🟢", label: "Funcional" },
  { id: "parcial", emoji: "🟡", label: "Parcial" },
  { id: "roto", emoji: "🔴", label: "Roto / RAEE" },
];

export default function RegistrarEquipo() {
  const { gestorId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    marcaModelo: "",
    estado: "parcial",
    cantidad: "",
    peso: "",
    dimension: "Mediano (Laptops, Monitores)",
    comentarios: "",
  });
  const [enviando, setEnviando] = useState(false);
  const [toast, setToast] = useState("");

  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  async function enviar(e) {
    e.preventDefault();
    if (!form.marcaModelo.trim()) return;
    setEnviando(true);
    try {
      const orden = await api.crearOrden({ gestorId, equipo: form });
      setToast(`✓ Registrado · +${orden.puntos} pts`);
      setTimeout(() => navigate("/recompensas"), 1400);
    } catch (err) {
      setToast(err.message);
      setEnviando(false);
    }
  }

  return (
    <>
      <div className="s5-header">
        <button className="s5-back" onClick={() => navigate(-1)}>
          ←
        </button>
        <div className="s5-title">Registrar Equipo</div>
      </div>

      <div className="s5-form-content">
        <div className="s5-reg-card">
          <div className="s5-reg-icon">📜</div>
          <div className="s5-reg-text">
            <strong>Gestión Regulada</strong>
            <br />
            Proceso alineado a las normativas ambientales para la recolección formal de
            residuos en Guayaquil (Ordenanza GAD y estándares ISO 14001).
          </div>
        </div>

        <form onSubmit={enviar}>
          <div className="form-group">
            <label className="form-label">Marca y Modelo</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej. Dell Optiplex 7040 / Monitores HP"
              value={form.marcaModelo}
              onChange={set("marcaModelo")}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Estado del Equipo</label>
            <div className="estado-pills">
              {ESTADOS.map((es) => (
                <div
                  key={es.id}
                  className={`estado-pill${form.estado === es.id ? " active" : ""}`}
                  onClick={() => setForm({ ...form, estado: es.id })}
                >
                  <span>{es.emoji}</span> {es.label}
                </div>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Cantidad</label>
              <input
                type="number"
                className="form-input"
                placeholder="0"
                value={form.cantidad}
                onChange={set("cantidad")}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Peso aprox. (kg)</label>
              <input
                type="number"
                className="form-input"
                placeholder="0.0"
                value={form.peso}
                onChange={set("peso")}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Dimensiones (Tamaño)</label>
            <select className="form-input" value={form.dimension} onChange={set("dimension")}>
              <option>Pequeño (Cables, Celulares)</option>
              <option>Mediano (Laptops, Monitores)</option>
              <option>Grande (Servidores, Electrodomésticos)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Comentarios detallados</label>
            <textarea
              className="form-input"
              placeholder="Especifica si faltan piezas, si las baterías están infladas, daños visibles, etc."
              value={form.comentarios}
              onChange={set("comentarios")}
            />
          </div>

          <button type="submit" className="s5-submit-btn" disabled={enviando}>
            {enviando ? "Enviando…" : "Añadir a la Recolección"}
          </button>
        </form>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
