import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.js";

const RECOMPENSAS = [
  { id: "recoleccion", icon: "🚛", titulo: "Recolección gratis", desc: "Una recolección de hasta 50 kg sin costo adicional" },
  { id: "descuento", icon: "💰", titulo: "10% de descuento", desc: "En tu próxima solicitud de recolección" },
  { id: "certificado", icon: "📜", titulo: "Certificado ambiental", desc: "Certificado oficial del impacto ambiental de tu empresa" },
  { id: "prioridad", icon: "⚡", titulo: "Agenda prioritaria", desc: "Atención preferencial durante la siguiente semana" },
];

const fmtFecha = (iso) => {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-EC", { day: "2-digit", month: "long", year: "numeric" });
};

export default function Recompensas() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [ordenes, setOrdenes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [recompensaElegida, setRecompensaElegida] = useState(null);
  const [canjeando, setCanjeando] = useState(false);

  const cargarPerfil = () => api.getPerfil().then(setPerfil);

  useEffect(() => {
    cargarPerfil();
    api.getOrdenes().then(setOrdenes);
  }, []);

  useEffect(() => {
    if (perfil && perfil.recompensasDisponibles > perfil.recompensasCanjeadas) {
      setModalVisible(true);
    }
  }, [perfil]);

  async function canjear() {
    if (!recompensaElegida) return;
    setCanjeando(true);
    try {
      await api.canjearRecompensa();
      await cargarPerfil();
      setModalVisible(false);
      setRecompensaElegida(null);
    } finally {
      setCanjeando(false);
    }
  }

  if (!perfil) return <div className="loading">Cargando perfil…</div>;

  const recompensasPendientes = perfil.recompensasDisponibles - perfil.recompensasCanjeadas;

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
          <div>
            <div className="s4-points-title">Puntos del ciclo actual</div>
            <div className="s4-points-total">{perfil.puntos.toLocaleString("es-EC")} pts acumulados</div>
          </div>
          <div className="s4-points-value">
            {(perfil.puntosEnBarra ?? perfil.puntos).toLocaleString("es-EC")} <span>/ 1000</span>
          </div>
        </div>
        <div className="s4-progress-bg">
          <div className="s4-progress-fill" style={{ width: `${perfil.progreso}%` }} />
        </div>
        <div className="s4-progress-text">
          {perfil.restante > 0 ? (
            <>
              Te faltan <strong>{perfil.restante} pts</strong> para tu próxima recompensa.
              <span className="s4-pts-hint"> (1 pt = 1 gramo)</span>
            </>
          ) : (
            <>¡Ciclo completado! 🎉 Selecciona tu recompensa.</>
          )}
        </div>
        {recompensasPendientes > 0 && (
          <button className="s4-ver-recompensa-btn" onClick={() => setModalVisible(true)}>
            🎁 {recompensasPendientes} recompensa{recompensasPendientes > 1 ? "s" : ""} disponible{recompensasPendientes > 1 ? "s" : ""}
          </button>
        )}
      </div>

      <div className="s4-history">
        <div className="s2-section-title">Historial de Recolección</div>
        {ordenes.length === 0 ? (
          <div className="hist-empty">
            <div className="hist-empty-icon">📦</div>
            <div className="hist-empty-title">Aún no tienes solicitudes</div>
            <div className="hist-empty-sub">
              Registra tu primer equipo para empezar a acumular puntos ambientales.
            </div>
            <button className="hist-empty-btn" onClick={() => navigate("/")}>
              Buscar gestor →
            </button>
          </div>
        ) : (
          ordenes.map((o) => {
            const pend = o.estado !== "Completado";
            return (
              <div key={o.id} className={`hist-item${pend ? " pendiente" : ""}`}>
                <div className="hist-main">
                  <div className="hist-left">
                    <div className="hist-title">{o.titulo}</div>
                    <div className="hist-date">
                      {fmtFecha(o.fecha)} • Gestor: {o.gestorNombre}
                    </div>
                    {o.fechaRecoleccion && (
                      <div className="hist-pickup">📅 Recolección: {fmtFecha(o.fechaRecoleccion)}</div>
                    )}
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
          })
        )}
      </div>

      {modalVisible && (
        <div
          className="recompensa-overlay"
          onClick={(e) => e.target === e.currentTarget && setModalVisible(false)}
        >
          <div className="recompensa-sheet">
            <div className="recompensa-sheet-title">🎉 ¡Recompensa disponible!</div>
            <div className="recompensa-sheet-sub">
              {recompensasPendientes > 1
                ? `Tienes ${recompensasPendientes} recompensas por canjear · Elige una`
                : "Elige tu recompensa"}
            </div>
            <div className="recompensa-opciones">
              {RECOMPENSAS.map((r) => (
                <div
                  key={r.id}
                  className={`recompensa-opcion${recompensaElegida === r.id ? " selected" : ""}`}
                  onClick={() => setRecompensaElegida(r.id)}
                >
                  <div className="recompensa-opcion-icon">{r.icon}</div>
                  <div className="recompensa-opcion-titulo">{r.titulo}</div>
                  <div className="recompensa-opcion-desc">{r.desc}</div>
                </div>
              ))}
            </div>
            <button
              className="recompensa-canjear-btn"
              onClick={canjear}
              disabled={!recompensaElegida || canjeando}
            >
              {canjeando ? "Canjeando…" : "Canjear recompensa →"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
