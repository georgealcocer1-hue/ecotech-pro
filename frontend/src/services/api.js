// Cliente único para hablar con el backend. En desarrollo, Vite redirige /api
// al servidor Express (ver vite.config.js).

const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const msg = await res.json().catch(() => ({}));
    throw new Error(msg.error || `Error ${res.status}`);
  }
  return res.json();
}

export const api = {
  getGestores: (tipo) =>
    request(`/gestores${tipo && tipo !== "Todos" ? `?tipo=${encodeURIComponent(tipo)}` : ""}`),
  getGestor: (id) => request(`/gestores/${id}`),

  getPlanes: () => request("/planes"),

  getPerfil: () => request("/perfil"),

  getInfo: () => request("/info"),

  getOrdenes: () => request("/ordenes"),
  crearOrden: (data) =>
    request("/ordenes", { method: "POST", body: JSON.stringify(data) }),
  cancelarOrden: (id) =>
    request(`/ordenes/${id}`, { method: "PATCH", body: JSON.stringify({ estado: "Cancelado" }) }),

  canjearRecompensa: () =>
    request("/perfil/canjear", { method: "POST", body: JSON.stringify({}) }),

  getSuscripcion: () => request("/suscripcion"),
  actualizarSuscripcion: (data) =>
    request("/suscripcion", { method: "POST", body: JSON.stringify(data) }),
};
