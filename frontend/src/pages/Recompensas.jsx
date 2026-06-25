import { useEffect, useRef, useState } from "react";
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

const horaActual = () =>
  new Date().toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" });

export default function Recompensas() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [ordenes, setOrdenes] = useState([]);

  // Modal recompensas
  const [modalVisible, setModalVisible] = useState(false);
  const [recompensaElegida, setRecompensaElegida] = useState(null);
  const [canjeando, setCanjeando] = useState(false);

  // Chat (persiste en localStorage)
  const [chatOrden, setChatOrden] = useState(null);
  const [chatMensajes, setChatMensajes] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ecored_chat") || "{}"); } catch { return {}; }
  });
  const [chatInput, setChatInput] = useState("");
  const chatBottomRef = useRef(null);

  // Llamar
  const [llamarGestor, setLlamarGestor] = useState(null);

  // Cancelar solicitud
  const [cancelandoId, setCancelandoId] = useState(null);
  const [cancelando, setCancelando] = useState(false);

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

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMensajes, chatOrden]);

  useEffect(() => {
    localStorage.setItem("ecored_chat", JSON.stringify(chatMensajes));
  }, [chatMensajes]);

  const abrirChat = (orden) => {
    setChatOrden(orden);
    if (!chatMensajes[orden.gestorId]) {
      setChatMensajes((prev) => ({
        ...prev,
        [orden.gestorId]: [
          {
            de: "empresa",
            texto: `Hola, somos el equipo de ${orden.gestorNombre}. ¿En qué podemos ayudarte con tu solicitud "${orden.titulo}"?`,
            hora: horaActual(),
          },
        ],
      }));
    }
  };

  const enviarMensaje = () => {
    const texto = chatInput.trim();
    if (!texto || !chatOrden) return;
    setChatMensajes((prev) => ({
      ...prev,
      [chatOrden.gestorId]: [
        ...(prev[chatOrden.gestorId] || []),
        { de: "usuario", texto, hora: horaActual() },
      ],
    }));
    setChatInput("");
  };

  const abrirLlamar = async (orden) => {
    try {
      const gestor = await api.getGestor(orden.gestorId);
      setLlamarGestor({ ...gestor, ordenTitulo: orden.titulo });
    } catch {
      setLlamarGestor({
        nombre: orden.gestorNombre,
        icon: "📞",
        telefonos: [],
        ordenTitulo: orden.titulo,
      });
    }
  };

  async function cancelar(id) {
    setCancelando(true);
    try {
      await api.cancelarOrden(id);
      const [nuevasOrdenes, nuevoPerfil] = await Promise.all([api.getOrdenes(), api.getPerfil()]);
      setOrdenes(nuevasOrdenes);
      setPerfil(nuevoPerfil);
      setCancelandoId(null);
    } finally {
      setCancelando(false);
    }
  }

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
  const mensajesActuales = chatOrden ? (chatMensajes[chatOrden.gestorId] || []) : [];

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
            <div className="s4-points-total">
              {perfil.puntos.toLocaleString("es-EC")} pts acumulados
            </div>
          </div>
          <div className="s4-points-value">
            {(perfil.puntosEnBarra ?? perfil.puntos).toLocaleString("es-EC")}{" "}
            <span>/ {perfil.metaPuntos.toLocaleString("es-EC")}</span>
          </div>
        </div>
        <div className="s4-progress-bg">
          <div className="s4-progress-fill" style={{ width: `${perfil.progreso}%` }} />
        </div>
        <div className="s4-progress-text">
          {perfil.restante > 0 ? (
            <>
              Te faltan <strong>{perfil.restante.toLocaleString("es-EC")} pts</strong> para tu próxima
              recompensa.
              <span className="s4-pts-hint"> (1 pt = 1 gramo)</span>
            </>
          ) : (
            <>¡Ciclo completado! 🎉 Selecciona tu recompensa.</>
          )}
        </div>
        <button className="s4-ver-recompensa-btn" onClick={() => setModalVisible(true)}>
          {recompensasPendientes > 0
            ? `🎁 ${recompensasPendientes} recompensa${recompensasPendientes > 1 ? "s" : ""} disponible${recompensasPendientes > 1 ? "s" : ""}`
            : "🎁 Ver recompensas disponibles"}
        </button>
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
                      <div className="hist-pickup">
                        📅 Recolección: {fmtFecha(o.fechaRecoleccion)}
                      </div>
                    )}
                  </div>
                  <div className="hist-right">
                    <div className="hist-pts">+ {o.puntos} pts</div>
                    <div className={`hist-status${pend ? " pendiente" : ""}`}>{o.estado}</div>
                  </div>
                </div>
                {o.estado !== "Cancelado" && (
                  <div className="hist-contact">
                    <div className="hist-contact-btn chat" onClick={() => abrirChat(o)}>
                      💬 Chat
                    </div>
                    <div className="hist-contact-btn llamar" onClick={() => abrirLlamar(o)}>
                      📞 Llamar
                    </div>
                  </div>
                )}
                {o.estado === "Pendiente" && (
                  cancelandoId === o.id ? (
                    <div className="hist-cancel-confirm">
                      <span>¿Cancelar esta solicitud?</span>
                      <button
                        className="hist-cancel-yes"
                        onClick={() => cancelar(o.id)}
                        disabled={cancelando}
                      >
                        {cancelando ? "…" : "Sí, cancelar"}
                      </button>
                      <button className="hist-cancel-no" onClick={() => setCancelandoId(null)}>
                        No
                      </button>
                    </div>
                  ) : (
                    <button className="hist-cancel-btn" onClick={() => setCancelandoId(o.id)}>
                      Cancelar solicitud
                    </button>
                  )
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── Modal recompensas ── */}
      {modalVisible && (
        <div
          className="recompensa-overlay"
          onClick={(e) => e.target === e.currentTarget && setModalVisible(false)}
        >
          <div className="recompensa-sheet">
            <div className="recompensa-sheet-title">
              {recompensasPendientes > 0 ? "🎉 ¡Recompensa disponible!" : "🎁 Recompensas"}
            </div>
            <div className="recompensa-sheet-sub">
              {recompensasPendientes > 1
                ? `Tienes ${recompensasPendientes} recompensas por canjear · Elige una`
                : recompensasPendientes === 1
                ? "Elige tu recompensa"
                : `Acumula ${perfil.restante.toLocaleString("es-EC")} pts más para desbloquear`}
            </div>
            <div className="recompensa-opciones">
              {RECOMPENSAS.map((r) => (
                <div
                  key={r.id}
                  className={`recompensa-opcion${recompensaElegida === r.id ? " selected" : ""}`}
                  onClick={() => recompensasPendientes > 0 && setRecompensaElegida(r.id)}
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
              disabled={!recompensaElegida || canjeando || recompensasPendientes === 0}
            >
              {recompensasPendientes === 0
                ? `Faltan ${perfil.restante.toLocaleString("es-EC")} pts`
                : canjeando
                ? "Canjeando…"
                : "Canjear recompensa →"}
            </button>
          </div>
        </div>
      )}

      {/* ── Chat overlay ── */}
      {chatOrden && (
        <div className="chat-overlay">
          <div className="chat-sheet">
            <div className="chat-header">
              <button className="chat-header-back" onClick={() => setChatOrden(null)}>
                ←
              </button>
              <div className="chat-header-info">
                <div className="chat-header-name">{chatOrden.gestorNombre}</div>
                <div className="chat-header-sub">🟢 En línea · {chatOrden.titulo}</div>
              </div>
            </div>
            <div className="chat-messages">
              {mensajesActuales.map((m, i) => (
                <div key={i} className={`chat-msg ${m.de}`}>
                  <div className="chat-bubble">{m.texto}</div>
                  <div className="chat-hora">{m.hora}</div>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>
            <div className="chat-input-row">
              <input
                className="chat-input"
                placeholder="Escribe un mensaje…"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && enviarMensaje()}
              />
              <button className="chat-send-btn" onClick={enviarMensaje}>
                ↑
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Panel llamadas ── */}
      {llamarGestor && (
        <div
          className="llamar-overlay"
          onClick={(e) => e.target === e.currentTarget && setLlamarGestor(null)}
        >
          <div className="llamar-sheet">
            <div className="llamar-empresa">
              <div className="llamar-icon">{llamarGestor.icon}</div>
              <div>
                <div className="llamar-nombre">{llamarGestor.nombre}</div>
                <div className="llamar-sub">{llamarGestor.ordenTitulo}</div>
              </div>
            </div>
            <div className="llamar-lista">
              {(llamarGestor.telefonos || []).map((t) => (
                <a key={t.numero} href={`tel:${t.numero.replace(/\s|-/g, "")}`} className="llamar-item">
                  <div className="llamar-item-icon">{t.icon}</div>
                  <div className="llamar-item-info">
                    <div className="llamar-item-tipo">{t.tipo}</div>
                    <div className="llamar-item-numero">{t.numero}</div>
                  </div>
                  <button className="llamar-item-call">Llamar</button>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
