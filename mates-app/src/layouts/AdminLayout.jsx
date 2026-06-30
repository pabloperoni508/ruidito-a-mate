import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const navItems = [
  { label: "Categorías", to: "/admin/categorias" },
  { label: "Productos", to: "/admin/productos" },
];

function AdminLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/admin/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-white">
      <header className="sticky top-0 z-50 bg-brand-white border-b border-brand-gray">
        <nav className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-base font-semibold text-brand-brown">
            Administrador
          </span>
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-brand-brown text-brand-white"
                      : "text-brand-brown-dark hover:bg-brand-gray"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={handleSignOut}
              className="ml-2 px-3 py-2 rounded-full text-sm font-medium text-brand-brown-light hover:bg-brand-gray transition-colors"
            >
              Salir
            </button>
          </div>
        </nav>
      </header>
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;