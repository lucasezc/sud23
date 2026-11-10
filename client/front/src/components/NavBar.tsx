import { useState } from "react";
import { ShoppingBag, User, Search, Menu, X } from "lucide-react";

const links = ["Inicio", "Colección", "Nosotros", "Contacto"];

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [active, setActive] = useState("Inicio");
  const cartCount = 0; // TODO: traerlo del estado/contexto del carrito

  return (
    <nav className="relative w-full border-b border-neutral-100 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-[72px] md:px-12">
        {/* Logo */}
        <a href="/" className="text-2xl font-black tracking-tight md:text-3xl">
          SÜD23
        </a>

        {/* Menú desktop */}
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <li key={link}>
              <button
                onClick={() => setActive(link)}
                className={`cursor-pointer border-b-2 py-1 text-xs font-medium uppercase tracking-wide transition-colors duration-200 hover:border-black ${
                  active === link ? "border-black" : "border-transparent"
                }`}
              >
                {link}
              </button>
            </li>
          ))}
        </ul>

        {/* Iconos + hamburguesa */}
        <div className="flex items-center gap-3 md:gap-5">
          <button
            className="cursor-pointer p-1 transition-opacity hover:opacity-70"
            aria-label="Buscar"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            className="cursor-pointer p-1 transition-opacity hover:opacity-70"
            aria-label="Cuenta de usuario"
          >
            <User className="h-5 w-5" />
          </button>
          <button
            className="relative cursor-pointer p-1 transition-opacity hover:opacity-70"
            aria-label="Carrito de compras"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white">
              {cartCount}
            </span>
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="cursor-pointer p-1 md:hidden"
            aria-label="Abrir menú"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Menú mobile */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 flex w-full flex-col border-b border-neutral-200 bg-white px-6 py-2 shadow-lg md:hidden">
          {links.map((link) => (
            <button
              key={link}
              onClick={() => {
                setActive(link);
                setIsOpen(false);
              }}
              className="border-b border-neutral-100 py-4 text-left text-sm font-medium uppercase tracking-wide last:border-b-0"
            >
              {link}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

export default NavBar;