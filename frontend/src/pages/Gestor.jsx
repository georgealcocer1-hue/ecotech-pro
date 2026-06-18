import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api.js";

const tagColors = ["green", "blue", "green", "orange", "blue"];

export default function Gestor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gestor, setGestor] = useState(null);
  const [error, setError] = useState(null);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);

  useEffect(() => {
    api.getGestor(id).then(setGestor).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="loading">{error}</div>;
  if (!gestor) return <div className="loading">Cargando perfil…</div>;

  const estrellas = "★★★★★".slice(0, Math.round(gestor.rating));

  return (
    <>
      <div className="s2-header">
        <div className="s1-circuit-bg" />
        <button className="s2-back" onClick={() => navigate(-1)}>
          ← Volver
        </button>
        <div className="s2-gestor-card">
          <div className="s2-gestor-logo">{gestor.icon}</div>
          <div>
            <div className="s2-gestor-name">{gestor.nombre}</div>
            <div className="s2-gestor-cert">✅ {gestor.certificacion}</div>
            <div>
              <span className="s2-stars">{estrellas}</span>
              <span className="s2-reviews">({gestor.reviews} evaluaciones)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="s2-tags">
        {gestor.tags.map((t, i) => (
          <div key={t} className={`tag ${tagColors[i % tagColors.length]}`}>
            {t}
          </div>
        ))}
      </div>

      <div className="s2-section">
        <div className="s2-section-title">Servicios Disponibles</div>
        <div className="s2-services">
          {gestor.servicios.map((s) => (
            <div
              key={s.label}
              className={`service-chip${servicioSeleccionado === s.label ? " active" : ""}`}
              onClick={() => setServicioSeleccionado(s.label)}
            >
              <div className="s-icon">{s.icon}</div>
              <div className="s-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="s2-contact-row">
        <div className="contact-btn green-btn">
          <div className="c-icon">💬</div>Chat
        </div>
        <div className="contact-btn outline-btn">
          <div className="c-icon">📞</div>Llamar
        </div>
        <div className="contact-btn amber-btn">
          <div className="c-icon">📅</div>Agendar
        </div>
      </div>

      <div className="s2-schedule">
        <div className="schedule-title">Horario de atención</div>
        {gestor.horario.map((h) => (
          <div key={h.dia} className="schedule-row">
            <span className="sched-day">{h.dia}</span>
            <span className="sched-time">{h.horas}</span>
            <div className={`sched-avail${h.disponible ? "" : " off"}`} />
          </div>
        ))}
      </div>

      <button className="s2-cta" onClick={() => navigate(`/registrar/${gestor.id}`)}>
        <div>
          <div className="s2-cta-title">Solicitar Recolección</div>
          <div className="s2-cta-sub">Agenda en menos de 2 min</div>
        </div>
        <div className="s2-cta-btn">Solicitar →</div>
      </button>
    </>
  );
}
