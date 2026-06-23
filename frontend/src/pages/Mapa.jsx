import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.js";

const SERVICIOS = [
  { id: "Reciclaje",   icon: "♻️",  color: "green", desc: "Gestión de residuos RAEE" },
  { id: "Reparación",  icon: "🔧",  color: "amber", desc: "Reparación de equipos"    },
  { id: "Diagnóstico", icon: "🔍",  color: "blue",  desc: "Evaluación técnica"        },
];

export default function Mapa() {
  const navigate = useNavigate();
  const [todosGestores, setTodosGestores] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const [servicioActivo, setServicioActivo] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [pendientes, setPendientes] = useState([]);

  useEffect(() => {
    api.getPerfil().then(setPerfil).catch(() => {});
    api.getOrdenes()
      .then((ords) => setPendientes(ords.filter((o) => o.estado !== "Completado")))
      .catch(() => {});
    api.getGestores("Todos").then((data) => {
      setTodosGestores(data);
      setCargando(false);
    });
  }, []);

  const seleccionarServicio = (id) => {
    setServicioActivo((prev) => (prev === id ? null : id));
    setBusqueda("");
  };

  const gestoresFiltrados = todosGestores.filter((g) => {
    const porServicio = servicioActivo
      ? g.servicios?.some((s) => s.label === servicioActivo)
      : false;
    const porBusqueda = g.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return porServicio && porBusqueda;
  });

  const servicioInfo = SERVICIOS.find((s) => s.id === servicioActivo);

  return (
    <>
      <div className="s1-header">
        <div className="s1-circuit-bg" />
        <div className="s1-top-row">
          <div>
            <div className="s1-greeting">{perfil?.saludo || "Hola,"}</div>
            <div className="s1-company">{perfil?.empresa || "Mi Empresa"}</div>
          </div>
          <div className="s1-avatar">{perfil?.inicial || "·"}</div>
        </div>
        <div className="s1-search">
          <span className="s1-search-icon">🔍</span>
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar empresa…"
            disabled={!servicioActivo}
          />
        </div>
      </div>

      <div className="s1-map">
        <div className="map-roads" />
        <div className="map-road-h" style={{ top: "28%", left: 0, width: "100%" }} />
        <div className="map-road-h" style={{ top: "55%", left: 0, width: "100%" }} />
        <div className="map-road-h" style={{ top: "78%", left: 0, width: "100%" }} />
        <div className="map-road-v" style={{ left: "22%", top: 0, height: "100%" }} />
        <div className="map-road-v" style={{ left: "55%", top: 0, height: "100%" }} />
        <div className="map-road-v" style={{ left: "80%", top: 0, height: "100%" }} />
        {todosGestores.map((g) => (
          <div
            key={g.id}
            className="map-marker"
            style={{ top: g.mapa.top, left: g.mapa.left }}
            onClick={() => navigate(`/gestor/${g.id}`)}
          >
            <div className={`marker-pin ${g.mapa.color}`}>
              <span>{g.icon}</span>
            </div>
            <div className="marker-label">{g.nombre.split(" ")[0]}</div>
          </div>
        ))}
        <div className="map-my-loc" />
      </div>

      {/* ── Botones de servicio ── */}
      <div className="s1-servicios">
        {SERVICIOS.map((s) => (
          <div
            key={s.id}
            className={`servicio-btn ${s.color}${servicioActivo === s.id ? " active" : ""}`}
            onClick={() => seleccionarServicio(s.id)}
          >
            <div className="servicio-btn-icon">{s.icon}</div>
            <div className="servicio-btn-label">{s.id}</div>
            <div className="servicio-btn-desc">{s.desc}</div>
          </div>
        ))}
      </div>

      {/* ── Solicitudes pendientes ── */}
      {pendientes.length > 0 && (
        <div className="s1-pendientes">
          <div className="s1-pendientes-title">Solicitudes pendientes</div>
          {pendientes.map((o) => (
            <div key={o.id} className="pendiente-item" onClick={() => navigate("/recompensas")}>
              <div className="pendiente-dot" />
              <div className="pendiente-info">
                <div className="pendiente-titulo">{o.titulo}</div>
                <div className="pendiente-sub">{o.gestorNombre} · {o.estado}</div>
              </div>
              <span className="pendiente-arrow">›</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Lista de empresas (solo cuando hay servicio activo) ── */}
      {servicioActivo && (
        <div className="s1-lista-section">
          <div className="s1-lista-header">
            <div className="s1-lista-title">
              {servicioInfo?.icon} {servicioActivo}
            </div>
            <div className="s1-lista-count">
              {gestoresFiltrados.length} empresa{gestoresFiltrados.length !== 1 ? "s" : ""}
            </div>
          </div>

          {cargando && <div className="loading">Cargando…</div>}
          {!cargando && gestoresFiltrados.length === 0 && (
            <div className="loading">Sin empresas disponibles para este servicio.</div>
          )}

          <div className="s1-card-col">
            {gestoresFiltrados.map((g, i) => (
              <div
                key={g.id}
                className="s1-manager-card"
                onClick={() =>
                  navigate(
                    `/gestor/${g.id}?servicio=${encodeURIComponent(servicioActivo)}`
                  )
                }
              >
                <div className={`manager-icon-box${i % 2 ? " amber-bg" : ""}`}>{g.icon}</div>
                <div className="manager-info">
                  <div className="manager-name">{g.nombre}</div>
                  <div className="manager-type">{g.etiquetaTipo}</div>
                  <div className="manager-dist">
                    📍 {g.distanciaKm} km · {g.abierto ? "Abierto ahora" : "Cerrado"}
                  </div>
                </div>
                <div className={`manager-badge${i % 2 ? " cert" : ""}`}>{g.rating} ⭐</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
