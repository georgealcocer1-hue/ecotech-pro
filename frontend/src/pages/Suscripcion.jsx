import { useEffect, useState } from "react";
import { api } from "../services/api.js";

const METODOS = [
  { id: "tarjeta", icon: "💳", label: "Tarjeta" },
  { id: "spei", icon: "🏦", label: "SPEI" },
  { id: "factura", icon: "🧾", label: "Factura" },
  { id: "po", icon: "💼", label: "PO" },
];

const fmt = (n) =>
  "$" + Number(n).toLocaleString("es-EC", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export default function Suscripcion() {
  const [planes, setPlanes] = useState([]);
  const [sus, setSus] = useState(null);
  const [toast, setToast] = useState("");
  const [pendientePlanId, setPendientePlanId] = useState(null);

  useEffect(() => {
    api.getPlanes().then(setPlanes);
    api.getSuscripcion().then(setSus);
  }, []);

  // Envía un cambio (plan, ciclo o método) y refresca el resumen + factura.
  async function actualizar(cambio) {
    const nuevo = await api.actualizarSuscripcion(cambio);
    setSus(nuevo);
    if (cambio.planId) {
      setToast("✓ Plan actualizado");
      setTimeout(() => setToast(""), 2000);
    }
  }

  if (!sus) return <div className="loading">Cargando planes…</div>;
  const anual = sus.ciclo === "anual";

  return (
    <>
      <div className="s3-header">
        <div className="s1-circuit-bg" />
        <div className="s3-title">Plan de Suscripción</div>
        <div className="s3-subtitle">Gestión mensual de residuos electrónicos</div>
        <div className="s3-plan-toggle">
          <div
            className={`toggle-opt${!anual ? " on" : ""}`}
            onClick={() => actualizar({ ciclo: "mensual" })}
          >
            Mensual
          </div>
          <div
            className={`toggle-opt${anual ? " on" : ""}`}
            onClick={() => actualizar({ ciclo: "anual" })}
          >
            Anual −20%
          </div>
        </div>
      </div>

      <div className="s3-plans">
        {planes.map((p) => {
          const elegido = sus.planId === p.id;
          const precio = anual ? p.precioAnual : p.precioMensual;
          return (
            <div
              key={p.id}
              className={`plan-card${p.featured ? " featured" : ""}${elegido ? " selected" : ""}`}
            >
              {p.featured && <div className="plan-badge">Más Popular</div>}
              <div className="plan-top">
                <div>
                  <div className="plan-name">{p.nombre}</div>
                  <div className="plan-target">{p.target}</div>
                </div>
                <div className="plan-price-block">
                  <div className="plan-price">
                    {fmt(precio)}
                    <span>/{anual ? "año" : "mes"}</span>
                  </div>
                </div>
              </div>
              <div className="plan-features">
                {p.features.map((f) => (
                  <div key={f} className="pf">
                    <div className="pf-dot">✓</div>
                    {f}
                  </div>
                ))}
              </div>
              <div
                className={`plan-btn${p.featured ? " solid" : " outline"}`}
                onClick={() => elegido ? null : setPendientePlanId(p.id)}
              >
                {elegido ? "✓ Plan actual" : `Elegir ${p.nombre}`}
              </div>
            </div>
          );
        })}
      </div>

      <div className="s3-payment-section">
        <div className="s3-section-label">Método de Pago</div>
        <div className="s3-methods">
          {METODOS.map((m) => (
            <div
              key={m.id}
              className={`pay-method${sus.metodoPago === m.id ? " selected" : ""}`}
              onClick={() => actualizar({ metodoPago: m.id })}
            >
              <div className="pay-icon">{m.icon}</div>
              <div className="pay-label">{m.label}</div>
            </div>
          ))}
        </div>

        <div className="s3-invoice">
          <div className="inv-row">
            <span>Plan {sus.plan.nombre}</span>
            <span>{fmt(sus.factura.subtotal)}</span>
          </div>
          <div className="inv-row">
            <span>IVA 15%</span>
            <span>{fmt(sus.factura.iva)}</span>
          </div>
          <div className="inv-row">
            <span>Descuento primer periodo</span>
            <span style={{ color: "#16A34A" }}>−{fmt(sus.factura.descuento)}</span>
          </div>
          <div className="inv-row total">
            <span>Total a pagar</span>
            <span>{fmt(sus.factura.total)}</span>
          </div>
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}

      {/* ── Confirmación de cambio de plan ── */}
      {pendientePlanId && (() => {
        const p = planes.find((pl) => pl.id === pendientePlanId);
        const precio = anual ? p?.precioAnual : p?.precioMensual;
        return (
          <div
            className="sus-confirm-overlay"
            onClick={(e) => e.target === e.currentTarget && setPendientePlanId(null)}
          >
            <div className="sus-confirm-sheet">
              <div className="sus-confirm-title">Cambiar plan</div>
              <div className="sus-confirm-body">
                Estás a punto de cambiar al plan <strong>{p?.nombre}</strong>.
                <br />Tu nueva factura será de{" "}
                <strong>{fmt(precio)}/{anual ? "año" : "mes"}</strong> + IVA 15%.
              </div>
              <button
                className="sus-confirm-btn-yes"
                onClick={() => { actualizar({ planId: pendientePlanId }); setPendientePlanId(null); }}
              >
                Confirmar cambio
              </button>
              <button className="sus-confirm-btn-no" onClick={() => setPendientePlanId(null)}>
                Cancelar
              </button>
            </div>
          </div>
        );
      })()}
    </>
  );
}
