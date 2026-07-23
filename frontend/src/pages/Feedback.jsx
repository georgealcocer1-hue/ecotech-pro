import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import { GOOGLE_SCRIPT_URL } from "../config.js";

const OCUPACIONES = [
  { id: "estudiante", label: "Estudiante" },
  { id: "profesor", label: "Profesor" },
  { id: "colaborador", label: "Colaborador" },
  { id: "visitante", label: "Visitante / Externo" },
];

const FACULTADES = [
  "FIEC – Electricidad y Computación",
  "FIMCP – Mecánica y Ciencias de la Producción",
  "FCNM – Ciencias Naturales y Matemáticas",
  "FCSH – Ciencias Sociales y Humanísticas",
  "FICT – Ingeniería en Ciencias de la Tierra",
  "FADCOM – Arte, Diseño y Comunicación",
  "FCV – Ciencias de la Vida",
  "FIMCM – Ingeniería Marítima y Ciencias del Mar",
  "ESPAE – Escuela de Posgrado",
];

const TIPOS = [
  { id: "apoyo", emoji: "👍", label: "Apoyo" },
  { id: "retro", emoji: "💬", label: "Retroalimentación" },
];

const SUFIJO_ESPOL = "@espol.edu.ec";

// Formulario de feria: opinión del visitante + contacto referido opcional.
export default function Feedback() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    ocupacion: "",
    facultad: "",
    correoUser: "", // parte antes de @espol.edu.ec (ocupaciones ESPOL)
    correoFull: "", // correo completo (visitante / externo)
    celular: "",
    tipo: "",
    descripcion: "",
    rating: 0,
  });
  const [refOn, setRefOn] = useState(false);
  const [ref, setRef] = useState({ nombre: "", celular: "" });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const esVisitante = form.ocupacion === "visitante";
  const esEspol = ["estudiante", "profesor", "colaborador"].includes(form.ocupacion);
  // El correo (y el resto de campos) aparece tras elegir facultad si es ESPOL,
  // o directamente si es visitante.
  const mostrarResto = esVisitante || (esEspol && !!form.facultad);

  const cambiarOcupacion = (e) =>
    setForm({ ...form, ocupacion: e.target.value, facultad: "" });

  const correoFinal = () =>
    esEspol ? `${form.correoUser.trim()}${SUFIJO_ESPOL}` : form.correoFull.trim();

  async function enviar(e) {
    e.preventDefault();
    setError("");
    if (!form.nombre.trim()) return setError("Por favor escribe tu nombre.");
    if (!form.ocupacion) return setError("Selecciona tu ocupación.");
    if (esEspol) {
      if (!form.correoUser.trim()) return setError("Escribe tu usuario de correo.");
      if (/[@\s]/.test(form.correoUser.trim()))
        return setError("Escribe solo la parte antes de " + SUFIJO_ESPOL + ".");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correoFull.trim())) {
      return setError("Escribe un correo válido.");
    }
    if (!form.tipo) return setError("Selecciona el tipo: Apoyo o Retroalimentación.");

    setEnviando(true);
    const payload = {
      nombre: form.nombre.trim(),
      ocupacion: form.ocupacion,
      facultad: esEspol ? form.facultad : "",
      correo: correoFinal(),
      celular: form.celular.trim(),
      tipo: form.tipo,
      descripcion: form.descripcion.trim(),
      rating: form.rating,
      referido: refOn && ref.nombre.trim() ? ref : null,
    };
    try {
      if (GOOGLE_SCRIPT_URL) {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload),
        });
      } else {
        await api.enviarFeedback(payload);
      }
      setOk(true);
    } catch (err) {
      setError("No se pudo enviar. Revisa tu conexión e inténtalo de nuevo.");
      setEnviando(false);
    }
  }

  if (ok) {
    return (
      <div className="s5-success">
        <div className="s5-success-icon">🌿</div>
        <div className="s5-success-title">¡Gracias!</div>
        <div className="s5-success-sub">
          Tu opinión nos ayuda a mejorar EcoRed.
          {refOn && ref.nombre.trim() && (
            <>
              <br />
              Contactaremos a tu recomendado pronto.
            </>
          )}
        </div>
        <div className="s5-success-actions">
          <button className="s5-success-btn-primary" onClick={() => navigate("/")}>
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="s5-header">
        <button className="s5-back" onClick={() => navigate("/")}>
          ←
        </button>
        <div className="s5-title">Cuéntanos tu opinión</div>
      </div>

      <div className="s5-form-content">
        <div className="s6-intro">
          <div className="s6-intro-icon">📣</div>
          <div className="s6-intro-text">
            <strong>¡Gracias por visitarnos en la feria!</strong>
            <br />
            Déjanos tu opinión sobre EcoRed y, si conoces a alguien a quien le sirva, recomiéndanos.
          </div>
        </div>

        <form onSubmit={enviar}>
          <div className="s6-section-label">Tu opinión</div>

          {/* 1 · Nombre */}
          <div className="form-group">
            <label className="form-label">Nombre *</label>
            <input
              className="form-input"
              placeholder="Tu nombre"
              value={form.nombre}
              onChange={set("nombre")}
            />
          </div>

          {/* 2 · Ocupación */}
          <div className="form-group">
            <label className="form-label">Ocupación *</label>
            <select className="form-input" value={form.ocupacion} onChange={cambiarOcupacion}>
              <option value="">Selecciona tu ocupación…</option>
              {OCUPACIONES.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* 3 · Facultad (solo ESPOL) */}
          {esEspol && (
            <div className="form-group">
              <label className="form-label">Facultad *</label>
              <select className="form-input" value={form.facultad} onChange={set("facultad")}>
                <option value="">Selecciona tu facultad…</option>
                {FACULTADES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          )}

          {mostrarResto && (
            <>
              {/* 4 · Correo */}
              <div className="form-group">
                <label className="form-label">Correo *</label>
                {esEspol ? (
                  <div className="s6-email-espol">
                    <input
                      className="form-input"
                      placeholder="tu.usuario"
                      value={form.correoUser}
                      onChange={set("correoUser")}
                    />
                    <span className="s6-email-suffix">{SUFIJO_ESPOL}</span>
                  </div>
                ) : (
                  <input
                    type="email"
                    className="form-input"
                    placeholder="tucorreo@gmail.com"
                    value={form.correoFull}
                    onChange={set("correoFull")}
                  />
                )}
              </div>

              {/* 5 · Celular */}
              <div className="form-group">
                <label className="form-label">Celular</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="09XXXXXXXX"
                  value={form.celular}
                  onChange={set("celular")}
                />
              </div>

              {/* 6 · Tipo */}
              <div className="form-group">
                <label className="form-label">Tipo *</label>
                <div className="estado-pills">
                  {TIPOS.map((t) => (
                    <div
                      key={t.id}
                      className={`estado-pill${form.tipo === t.id ? " active" : ""}`}
                      onClick={() => setForm({ ...form, tipo: t.id })}
                    >
                      <span>{t.emoji}</span> {t.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* 7 · Descripción */}
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-input"
                  placeholder="Cuéntanos tu apoyo o tu retroalimentación…"
                  value={form.descripcion}
                  onChange={set("descripcion")}
                />
              </div>

              {/* Rating */}
              <div className="form-group">
                <label className="form-label">¿Qué te pareció la app?</label>
                <div className="s6-stars">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className={`s6-star${form.rating >= n ? " on" : ""}`}
                      onClick={() => setForm({ ...form, rating: n })}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <label className="s6-toggle">
                <input type="checkbox" checked={refOn} onChange={(e) => setRefOn(e.target.checked)} />
                <span>Conozco a alguien / una empresa a quien le serviría EcoRed</span>
              </label>

              {refOn && (
                <div className="s6-referido">
                  <div className="s6-section-label">Datos del recomendado</div>
                  <div className="form-group">
                    <label className="form-label">Nombre del contacto</label>
                    <input
                      className="form-input"
                      placeholder="Nombre de la persona o empresa"
                      value={ref.nombre}
                      onChange={(e) => setRef({ ...ref, nombre: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Celular</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="09XXXXXXXX"
                      value={ref.celular}
                      onChange={(e) => setRef({ ...ref, celular: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {error && <div className="s6-error">{error}</div>}

          <button type="submit" className="s5-submit-btn" disabled={enviando}>
            {enviando ? "Enviando…" : "Enviar opinión"}
          </button>

          <div className="s6-privacy">
            Usaremos tus datos solo para este proyecto académico de ESPOL.
          </div>
        </form>
      </div>
    </>
  );
}
