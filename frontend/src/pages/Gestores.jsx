import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.js";

// Listado completo de gestores (pestaña "Gestores" de la barra inferior).
export default function Gestores() {
  const navigate = useNavigate();
  const [gestores, setGestores] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.getGestores().then((data) => {
      setGestores(data);
      setCargando(false);
    });
  }, []);

  return (
    <>
      <div className="s1-header">
        <div className="s1-circuit-bg" />
        <div className="s1-top-row">
          <div>
            <div className="s1-greeting">Directorio</div>
            <div className="s1-company">Gestores Certificados</div>
          </div>
          <div className="s1-avatar">🏭</div>
        </div>
      </div>

      <div className="s1-card-row" style={{ paddingTop: 16 }}>
        {cargando && <div className="loading">Cargando…</div>}
        {gestores.map((g, i) => (
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
