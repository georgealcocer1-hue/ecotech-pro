import { useEffect, useState } from "react";
import { api } from "../services/api.js";

const fmtFecha = (iso) => {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-EC", { day: "2-digit", month: "long", year: "numeric" });
};

export default function Recompensas() {
  const [perfil, setPerfil] = useState(null);
  const [ordenes, setOrdenes] = useState([]);

  useEffect(() => {
    api.getPerfil().then(setPerfil);
    api.getOrdenes().then(setOrdenes);
  }, []);

  if (!perfil) return <div className="loading">Cargando perfil…</div>;

  return (
    <>
      <div className="s4-profile-top">
        <div className="s1-circuit-bg" />
        <div className="s4-user-info">
          <div className="s4-avatar">{perfil.inicial}</div>
          <div>
            <div className="s4-name">{perfil.empresa}</div>
            <div className="s4-level">{perfil.nivel}</div>
          </div>
        </div>
      </div>

      <div className="s4-rewards-card">
        <div className="s4-points-header">
          <div className="s4-points-title">Puntos Ambientales</div>
          <div className="s4-points-value">
            {perfil.puntos.toLocaleString("es-EC")} <span>pts</span>
          </div>
        </div>
        <div className="s4-progress-bg">
          <div className="s4-progress-fill" style={{ width: `${perfil.progreso}%` }} />
        </div>
        <div className="s4-progress-text">
          {perfil.restante > 0 ? (
            <>
              Te faltan <strong>{perfil.restante} pts</strong> para una{" "}
              <strong>{perfil.recompensa}</strong>.
            </>
          ) : (
            <>
              ¡Has desbloqueado una <strong>{perfil.recompensa}</strong>! 🎉
            </>
          )}
        </div>
      </div>

      <div className="s4-history">
        <div className="s2-section-title">Historial de Recolección</div>
        {ordenes.map((o) => {
          const pend = o.estado !== "Completado";
          return (
            <div key={o.id} className={`hist-item${pend ? " pendiente" : ""}`}>
              <div className="hist-main">
                <div className="hist-left">
                  <div className="hist-title">{o.titulo}</div>
                  <div className="hist-date">
                    {fmtFecha(o.fecha)} • Gestor: {o.gestorNombre}
                  </div>
                </div>
                <div className="hist-right">
                  <div className="hist-pts">+ {o.puntos} pts</div>
                  <div className={`hist-status${pend ? " pendiente" : ""}`}>{o.estado}</div>
                </div>
              </div>
              <div className="hist-contact">
                <div className="hist-contact-btn chat">💬 Chat</div>
                <div className="hist-contact-btn llamar">📞 Llamar</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
