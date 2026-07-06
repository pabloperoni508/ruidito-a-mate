import { NavLink } from "react-router-dom";
import { useActiveRaffle } from "../hooks/useActiveRaffle";

const navItems = [
  { label: "Inicio", to: "/" },
  { label: "Catálogo", to: "/catalogo" },
  { label: "Rifas", to: "/rifas" },
];

function Navbar() {
  const { activeRaffle } = useActiveRaffle();

  return (
    <header className="sticky top-0 z-50 bg-brand-white border-b border-brand-gray">
      <nav className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
        <span className="text-lg font-semibold text-brand-brown">
          Mates Comercio
        </span>
        <ul className="flex items-center gap-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
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
            </li>
          ))}
          {activeRaffle && (
            <li>
              <NavLink
                to="/rifas"
                className="ml-1 px-3 py-2 rounded-full text-sm font-medium bg-brand-yellow text-brand-brown-dark"
              >
                ¡Rifa activa!
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Navbar;