import { NavLink } from "react-router-dom";

const items = [
  { to: "/", icon: "🗺️", label: "Mapa", end: true },
  { to: "/gestores", icon: "🏭", label: "Gestores" },
  { to: "/recompensas", icon: "🏆", label: "Recompensas" },
  { to: "/suscripcion", icon: "💳", label: "Suscripción" },
];

export default function NavBar() {
  return (
    <nav className="s1-nav">
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.end}
          className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
        >
          {({ isActive }) => (
            <>
              <div className="nav-icon">{it.icon}</div>
              <div className="nav-label">{it.label}</div>
              {isActive && <div className="nav-dot" />}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
