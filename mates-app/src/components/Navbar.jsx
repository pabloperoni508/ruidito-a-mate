import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Inicio", to: "/" },
  { label: "Catálogo", to: "/catalogo" },
  { label: "Rifas", to: "/rifas" },
];

function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-brand-white border-b border-brand-gray">
      <nav className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
        <span className="text-lg font-semibold text-brand-brown">
          Ruidito a mate
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
        </ul>
      </nav>
    </header>
  );
}

export default Navbar;