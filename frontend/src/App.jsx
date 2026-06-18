import { Routes, Route } from "react-router-dom";
import PhoneFrame from "./components/PhoneFrame.jsx";
import Mapa from "./pages/Mapa.jsx";
import Gestores from "./pages/Gestores.jsx";
import Gestor from "./pages/Gestor.jsx";
import Suscripcion from "./pages/Suscripcion.jsx";
import Recompensas from "./pages/Recompensas.jsx";
import RegistrarEquipo from "./pages/RegistrarEquipo.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<PhoneFrame />}>
        <Route path="/" element={<Mapa />} />
        <Route path="/gestores" element={<Gestores />} />
        <Route path="/gestor/:id" element={<Gestor />} />
        <Route path="/suscripcion" element={<Suscripcion />} />
        <Route path="/recompensas" element={<Recompensas />} />
        <Route path="/registrar" element={<RegistrarEquipo />} />
        <Route path="/registrar/:gestorId" element={<RegistrarEquipo />} />
      </Route>
    </Routes>
  );
}
