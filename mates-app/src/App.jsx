import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Inicio from "./pages/Inicio";
import Catalogo from "./pages/Catalogo";
import Rifas from "./pages/Rifas";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Inicio />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/rifas" element={<Rifas />} />
      </Route>
    </Routes>
  );
}

export default App;