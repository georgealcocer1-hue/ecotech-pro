import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../services/api.js";

const ESTADOS = [
  { id: "funcional", emoji: "🟢", label: "Funcional" },
  { id: "parcial", emoji: "🟡", label: "Parcial" },
  { id: "roto", emoji: "🔴", label: "Roto / RAEE" },
];

export default function RegistrarEquipo() {
  const { gestorId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const servicioParam = searchParams.get("servicio");
  const esDiagnostico = servicioParam === "Diagnóstico";

  const hoy = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    marcaModelo: "",
    estado: "parcial",
    cantidad: "",
    peso: "",
    dimension: "Mediano",
    fechaRecoleccion: "",
    comentarios: "",
  });
  const [enviando, setEnviando] = useState(false);
  const [toast, setToast] = useState("");
  const [ordenExitosa, setOrdenExitosa] = useState(null);

  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  async function enviar(e) {
    e.preventDefault();
    if (!form.marcaModelo.trim()) return;
    setEnviando(true);
    try {
      const equipo = servicioParam ? { ...form, servicio: servicioParam } : form;
      const orden = await api.crearOrden({ gestorId, equipo });
      setOrdenExitosa(orden);
    } catch (err) {
      setToast(err.message);
      setEnviando(false);
    }
  }

  if (ordenExitosa) {
    return (
      <div className="s5-success">
        <div className="s5-success-icon">✅</div>
        <div className="s5-success-title">¡Solicitud enviada!</div>
        <div className="s5-success-sub">
          <strong>{ordenExitosa.titulo}</strong>
          <br />Gestor: {ordenExitosa.gestorNombre}
          <br />Ref: #{ordenExitosa.id}
        </div>
        <div className="s5-success-pts">+{ordenExitosa.puntos} puntos ganados 🎯</div>
        <div className="s5-success-actions">
          <button className="s5-success-btn-primary" onClick={() => navigate("/recompensas")}>
            Ver mis solicitudes
          </button>
          <button className="s5-success-btn-secondary" onClick={() => navigate("/mapa")}>
            Nueva solicitud
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="s5-header">
        <button className="s5-back" onClick={() => navigate(-1)}>
          ←
        </button>
        <div className="s5-title">
          {esDiagnostico ? "Solicitar Diagnóstico" : "Registrar Equipo"}
        </div>
      </div>

      <div className="s5-form-content">
        {esDiagnostico ? (
          <div className="s5-reg-card diagnostico">
            <div className="s5-reg-icon">🔍</div>
            <div className="s5-reg-text">
              <strong>Diagnóstico Técnico</strong>
              <br />
              Un especialista evaluará tus equipos para determinar la mejor opción: reparación,
              reciclaje o disposición final. Recibirás un informe en 48 h hábiles.
            </div>
          </div>
        ) : (
          <div className="s5-reg-card">
            <div className="s5-reg-icon">📜</div>
            <div className="s5-reg-text">
              <strong>Gestión Regulada</strong>
              <br />
              Proceso alineado a las normativas ambientales para la recolección formal de
              residuos en Guayaquil (Ordenanza GAD y estándares ISO 14001).
            </div>
          </div>
        )}

        {servicioParam && (
          <div className={`s5-servicio-badge${esDiagnostico ? " diagnostico" : ""}`}>
            Servicio seleccionado: <strong>{servicioParam}</strong>
          </div>
        )}

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

          {!esDiagnostico && (
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
          )}

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
              <option value="Pequeño">Pequeño</option>
              <option value="Mediano">Mediano</option>
              <option value="Grande">Grande</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              {esDiagnostico ? "Fecha preferida de diagnóstico" : "Fecha preferida de recolección"}
            </label>
            <input
              type="date"
              className="form-input"
              min={hoy}
              value={form.fechaRecoleccion}
              onChange={set("fechaRecoleccion")}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Comentarios detallados</label>
            <textarea
              className="form-input"
              placeholder={
                esDiagnostico
                  ? "Describe los síntomas: no enciende, pantalla dañada, batería inflada, sin respuesta, etc. Cuanta más información, mejor el diagnóstico."
                  : "Especifica si faltan piezas, si las baterías están infladas, daños visibles, etc."
              }
              value={form.comentarios}
              onChange={set("comentarios")}
            />
          </div>

          <button type="submit" className="s5-submit-btn" disabled={enviando}>
            {enviando
              ? "Enviando…"
              : esDiagnostico
              ? "Solicitar Diagnóstico"
              : "Añadir a la Recolección"}
          </button>
        </form>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}

