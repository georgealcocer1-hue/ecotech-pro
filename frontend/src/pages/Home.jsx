import { useEffect, useState } from "react";
import { api } from "../services/api.js";

// Pantalla de inicio: bienvenida + información educativa sobre RAEE en Ecuador.
export default function Home() {
  const [perfil, setPerfil] = useState(null);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    api.getPerfil().then(setPerfil).catch(() => {});
    api.getInfo().then(setInfo).catch(() => {});
  }, []);

  if (!info) return <div className="loading">Cargando…</div>;

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

      {/* ── Cifras RAEE Ecuador ── */}
      <div className="s0-section">
        <div className="s0-section-title">RAEE en Ecuador 🇪🇨</div>
        <div className="s0-cifras">
          {info.cifras.map((c) => (
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

      {/* ── Carrusel ¿Sabías que…? ── */}
      <div className="s0-section">
        <div className="s0-section-title">¿Sabías que…? 💡</div>
        <div className="s0-carrusel">
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
