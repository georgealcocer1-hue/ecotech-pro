import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.js";

const fmtNum = (n) => Number(n).toLocaleString("es-EC");

// Pantalla de inicio: bienvenida + impacto de la empresa + info educativa RAEE.
export default function Home() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [info, setInfo] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.getPerfil().then(setPerfil).catch(() => {});
    api.getInfo().then(setInfo).catch(() => {});
    api.getEstadisticas().then(setStats).catch(() => {});
  }, []);

  if (!info || !stats) return <div className="loading">Cargando…</div>;

  const impacto = [
    { icon: "🚛", valor: fmtNum(stats.toneladas), unidad: "t", texto: "de RAEE enviadas a gestión certificada" },
    { icon: "✅", valor: String(stats.completadas), unidad: "", texto: "solicitudes completadas con éxito" },
    { icon: "🌍", valor: `${stats.porcentajeRecicladoFormal}%`.replace(".", ","), unidad: "", texto: "del RAEE reciclado formalmente en Ecuador es tuyo" },
    { icon: "💨", valor: fmtNum(stats.co2Evitado), unidad: "t CO₂", texto: "evitadas gracias a tu gestión responsable" },
  ];

  return (
    <>
      {/* ── Hero de bienvenida ── */}
      <div className="s0-hero">
        <div className="s1-circuit-bg" />
        <div className="s0-hero-logo">♻️ EcoRed</div>
        <div className="s0-hero-saludo">
          {perfil ? `${perfil.saludo} ${perfil.empresa}` : "Bienvenido"}
        </div>
        <div className="s0-hero-tagline">
          Convierte tus residuos electrónicos en impacto positivo
        </div>
      </div>

      {/* ── CTA formulario de feria ── */}
      <button className="s0-feria-cta" onClick={() => navigate("/feedback")}>
        <div className="s0-feria-cta-text">
          <strong>¿Te gustó EcoRed?</strong>
          <span>Déjanos tu opinión en la feria →</span>
        </div>
        <div className="s0-feria-cta-icon">📣</div>
      </button>

      {/* ── Impacto de la empresa ── */}
      <div className="s0-section">
        <div className="s0-section-title">Tu impacto 📊</div>
        <div className="s0-section-sub">
          Datos recopilados de tus solicitudes en EcoRed
        </div>
        <div className="s0-cifras">
          {impacto.map((c) => (
            <div key={c.texto} className="s0-cifra-card">
              <div className="s0-cifra-icon">{c.icon}</div>
              <div className="s0-cifra-valor">
                {c.valor}
                {c.unidad && <span> {c.unidad}</span>}
              </div>
              <div className="s0-cifra-texto">{c.texto}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Ranking de empresas ── */}
      <div className="s0-section">
        <div className="s0-section-title">Ranking de empresas 🏆</div>
        <div className="s0-section-sub">
          Toneladas de RAEE enviadas por empresas en la red EcoRed
        </div>
        <div className="s0-ranking">
          {stats.ranking.map((e) => (
            <div key={e.nombre} className={`s0-ranking-row${e.esUsuario ? " usuario" : ""}`}>
              <div className={`s0-ranking-pos${e.posicion <= 3 ? " top" : ""}`}>
                {e.posicion === 1 ? "🥇" : e.posicion === 2 ? "🥈" : e.posicion === 3 ? "🥉" : e.posicion}
              </div>
              <div className="s0-ranking-nombre">
                {e.nombre}
                {e.esUsuario && <span className="s0-ranking-tu">Tú</span>}
              </div>
              <div className="s0-ranking-ton">{fmtNum(e.toneladas)} t</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Carrusel ¿Sabías que…? (cifras nacionales primero) ── */}
      <div className="s0-section">
        <div className="s0-section-title">¿Sabías que…? 💡</div>
        <div className="s0-carrusel">
          {info.cifras.map((c) => (
            <div key={c.texto} className="s0-sabias-card cifra">
              <div className="s0-sabias-icon">{c.icon}</div>
              <div className="s0-sabias-valor">
                {c.valor}
                {c.unidad && <span> {c.unidad}</span>}
              </div>
              <div className="s0-sabias-texto">{c.texto}</div>
            </div>
          ))}
          {info.sabiasQue.map((s, i) => (
            <div key={i} className="s0-sabias-card">
              <div className="s0-sabias-icon">{s.icon}</div>
              <div className="s0-sabias-texto">{s.texto}</div>
            </div>
          ))}
        </div>
        <div className="s0-carrusel-hint">Desliza para ver más →</div>
      </div>

      {/* ── Categorías de RAEE ── */}
      <div className="s0-section">
        <div className="s0-section-title">¿Qué puedes entregar? 📦</div>
        <div className="s0-section-sub">
          Las 6 categorías oficiales de RAEE según la normativa ecuatoriana
        </div>
        <div className="s0-categorias">
          {info.categorias.map((cat) => (
            <div key={cat.nombre} className="s0-categoria-card">
              <div className="s0-categoria-icon">{cat.icon}</div>
              <div>
                <div className="s0-categoria-nombre">{cat.nombre}</div>
                <div className="s0-categoria-ejemplos">{cat.ejemplos}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Marco normativo ── */}
      <div className="s0-section">
        <div className="s0-section-title">Operamos bajo normativa ⚖️</div>
        <div className="s0-normas">
          {info.normativa.map((n) => (
            <div key={n.nombre} className="s0-norma-card">
              <div className="s0-norma-icon">{n.icon}</div>
              <div>
                <div className="s0-norma-nombre">{n.nombre}</div>
                <div className="s0-norma-desc">{n.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
