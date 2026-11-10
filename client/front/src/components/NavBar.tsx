import { useState } from "react";
import { ShoppingBag, User, Search, Menu, X } from "lucide-react";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="relative w-full h-18 px-4 md:px-8 flex items-center justify-between border-b border-gray-100 bg-white">
      {/* Brand / Logo */}
      <div className="flex items-center">
        <h1 className="text-2xl md:text-3xl font-bold font-sans tracking-tight">SÜD23</h1>
      </div>

      {/* Menú Desktop (Oculto en mobile, visible desde md) */}
      <ul className="hidden md:flex items-center gap-8 justify-center">
        <li>
          <button className="cursor-pointer border-b-2 border-transparent hover:border-black transition-colors duration-200 py-1 font-medium text-sm uppercase tracking-wide">
            Inicio
          </button>
        </li>
        <li>
          <button className="cursor-pointer border-b-2 border-transparent hover:border-black transition-colors duration-200 py-1 font-medium text-sm uppercase tracking-wide">
            Colección
          </button>
        </li>
        <li>
          <button className="cursor-pointer border-b-2 border-transparent hover:border-black transition-colors duration-200 py-1 font-medium text-sm uppercase tracking-wide">
            Nosotros
          </button>
        </li>
        <li>
          <button className="cursor-pointer border-b-2 border-transparent hover:border-black transition-colors duration-200 py-1 font-medium text-sm uppercase tracking-wide">
            Contacto
          </button>
        </li>
      </ul>

      {/* Iconos de Acción + Botón Hamburguesa */}
      <div className="flex items-center gap-4 md:gap-6">
        <button className="cursor-pointer p-1 hover:opacity-75 transition-opacity" aria-label="Buscar">
          <Search className="w-5 h-5" />
        </button>
        <button className="cursor-pointer p-1 hover:opacity-75 transition-opacity" aria-label="Cuenta de usuario">
          <User className="w-5 h-5" />
        </button>
        <button className="cursor-pointer p-1 hover:opacity-75 transition-opacity relative" aria-label="Carrito de compras">
          <ShoppingBag className="w-5 h-5" />
        </button>

        {/* Botón Hamburguesa (Solo visible en mobile) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden cursor-pointer p-1 text-gray-800 focus:outline-none"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Menú Desplegable Mobile */}
      {isOpen && (
        <div className="absolute top-18 left-0 w-full bg-white border-b border-gray-200 shadow-lg flex flex-col p-6 gap-4 md:hidden z-50">
          <button 
            onClick={() => setIsOpen(false)}
            className="text-left font-medium uppercase text-sm py-2 border-b border-gray-100"
          >
            Inicio
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-left font-medium uppercase text-sm py-2 border-b border-gray-100"
          >
            Colección
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-left font-medium uppercase text-sm py-2 border-b border-gray-100"
          >
            Nosotros
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-left font-medium uppercase text-sm py-2"
          >
            Contacto
          </button>
        </div>
      )}
    </nav>
  );
};

export default NavBar;