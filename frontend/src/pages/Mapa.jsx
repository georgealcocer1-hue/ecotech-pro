import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.js";

const FILTROS = ["Todos", "Reciclaje", "Reparación", "Recolección"];

export default function Mapa() {
  const navigate = useNavigate();
  const [gestores, setGestores] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const [filtro, setFiltro] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.getPerfil().then(setPerfil).catch(() => {});
  }, []);

  useEffect(() => {
    setCargando(true);
    api.getGestores(filtro).then((data) => {
      setGestores(data);
      setCargando(false);
    });
  }, [filtro]);

  const visibles = gestores.filter((g) =>
    g.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

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
            placeholder="Buscar gestores, zonas, servicios…"
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
        {gestores.map((g) => (
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

      <div className="s1-pills">
        {FILTROS.map((f) => (
          <div
            key={f}
            className={`pill${filtro === f ? " active" : ""}`}
            onClick={() => setFiltro(f)}
          >
            {f}
          </div>
        ))}
      </div>

      <div className="s1-card-row">
        {cargando && <div className="loading">Cargando gestores…</div>}
        {!cargando && visibles.length === 0 && (
          <div className="loading">No se encontraron gestores.</div>
        )}
        {visibles.map((g, i) => (
          <div
            key={g.id}
            className="s1-manager-card"
            onClick={() => navigate(`/gestor/${g.id}`)}
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
    </>
  );
}
