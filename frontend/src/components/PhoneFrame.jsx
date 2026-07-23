import { Outlet, useLocation } from "react-router-dom";
import NavBar from "./NavBar.jsx";

// Rutas donde NO se muestra la barra de navegación inferior (pantallas de detalle).
const sinNav = [/^\/gestor\//, /^\/registrar/, /^\/feedback/, /^\/admin/];

export default function PhoneFrame() {
  const { pathname } = useLocation();
  const mostrarNav = !sinNav.some((re) => re.test(pathname));

  return (
    <div className="phone">
      <div className="phone-notch">
        <div className="notch-speaker" />
        <div className="notch-cam" />
      </div>
      <div className="phone-screen">
        <div className="screen-scroll">
          <Outlet />
        </div>
        {mostrarNav && <NavBar />}
      </div>
    </div>
  );
}
