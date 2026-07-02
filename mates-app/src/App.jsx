import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Inicio from "./pages/Inicio";
import Catalogo from "./pages/Catalogo";
import ProductoDetalle from "./pages/ProductoDetalle";
import Rifas from "./pages/Rifas";
import Login from "./pages/admin/Login";
import Categorias from "./pages/admin/Categorias";
import Productos from "./pages/admin/Productos";
import EditarProducto from "./pages/admin/EditarProducto";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Rutas públicas */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/catalogo/:id" element={<ProductoDetalle />} />
          <Route path="/rifas" element={<Rifas />} />
          <Route path="productos" element={<Productos />} />
          <Route path="productos/:id/editar" element={<EditarProducto />} />
        </Route>

        {/* Login (sin layout de admin) */}
        <Route path="/admin/login" element={<Login />} />

        {/* Rutas protegidas del admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Categorias />} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="productos" element={<Productos />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;