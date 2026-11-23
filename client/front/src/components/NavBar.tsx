import { useEffect, useState } from "react";
import { ShoppingBag, User, Search, Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Cart from "./Cart";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { getProducts } from "../services/products";
import { formatPrice } from "../data/products";
import type { Product } from "../interfaces/product";

const links = [
  { label: "Inicio", section: "inicio" },
  { label: "Colección", section: "coleccion" },
  { label: "Nosotros", section: "nosotros" },
  { label: "Contacto", section: "contacto" },
];

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [active, setActive] = useState("Inicio");
  const [cartIsOpen, setCartIsOpen] = useState(false);
  const [searchIsOpen, setSearchIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const { count } = useCart();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const state = location.state;
    if (location.pathname !== "/" || !state || typeof state !== "object" ||
      !("scrollTo" in state) || typeof state.scrollTo !== "string") return;

    requestAnimationFrame(() => {
      document.getElementById(state.scrollTo)?.scrollIntoView({ behavior: "smooth" });
      navigate("/", { replace: true, state: null });
    });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!searchIsOpen || !search.trim()) {
      setSearchResults([]);
      setSearchError("");
      setSearchLoading(false);
      return;
    }

    let activeRequest = true;
    setSearchLoading(true);
    setSearchResults([]);
    const timeout = window.setTimeout(() => {
      getProducts(search)
        .then((products) => {
          if (activeRequest) setSearchResults(products);
        })
        .catch((error: unknown) => {
          if (activeRequest) setSearchError(error instanceof Error ? error.message : "No se pudo buscar");
        })
        .finally(() => {
          if (activeRequest) setSearchLoading(false);
        });
    }, 250);

    return () => {
      activeRequest = false;
      window.clearTimeout(timeout);
    };
  }, [search, searchIsOpen]);

  const goToSection = (section: string, label: string) => {
    setActive(label);
    setIsOpen(false);
    if (location.pathname === "/") {
      document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    navigate("/", { state: { scrollTo: section } });
  };

  return (
    <nav className="relative w-full border-b border-neutral-100 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-[72px] md:px-12">
        <Link to="/" aria-label="SÜD23 - Inicio">
          <h1 className="text-2xl font-black tracking-tight md:text-3xl">SÜD23</h1>
        </Link>
        <ul className="hidden items-center gap-8 md:flex">
          {links.map(({ label, section }) => (
            <li key={label}>
              <button
                onClick={() => goToSection(section, label)}
                className={`cursor-pointer border-b-2 py-1 text-xs font-medium uppercase tracking-wide transition-colors duration-200 hover:border-black ${active === label ? "border-black" : "border-transparent"}`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3 md:gap-5">
          <button
            className="cursor-pointer p-1 transition-opacity hover:opacity-70"
            aria-label={searchIsOpen ? "Cerrar búsqueda" : "Buscar"}
            aria-expanded={searchIsOpen}
            onClick={() => {
              setSearchIsOpen((open) => !open);
              setSearch("");
            }}
          >
            {searchIsOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>
          <Link
            to={user ? user.role === "admin" ? "/admin" : "/cuenta" : "/login"}
            state={user ? undefined : { from: { pathname: "/cuenta" } }}
            className="cursor-pointer p-1 transition-opacity hover:opacity-70"
            aria-label={user?.role === "admin" ? "Panel administrador" : user ? "Mi cuenta" : "Iniciar sesión"}
            title={user?.role === "admin" ? "Panel administrador" : user ? "Mi cuenta" : "Iniciar sesión"}
          >
            <User className="h-5 w-5" />
          </Link>
          <button
            className="relative cursor-pointer p-1 transition-opacity hover:opacity-70"
            aria-label="Carrito de compras"
            aria-expanded={cartIsOpen}
            onClick={() => setCartIsOpen((open) => !open)}
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white">
              {count}
            </span>
          </button>
          <button
            onClick={() => setIsOpen((open) => !open)}
            className="cursor-pointer p-1 md:hidden"
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 flex w-full flex-col border-b border-neutral-200 bg-white px-6 py-2 shadow-lg md:hidden">
          {links.map(({ label, section }) => (
            <button
              key={label}
              onClick={() => goToSection(section, label)}
              className="border-b border-neutral-100 py-4 text-left text-sm font-medium uppercase tracking-wide last:border-b-0"
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {cartIsOpen && <Cart />}
      {searchIsOpen && (
        <section className="absolute right-0 top-full z-[60] w-full border border-neutral-200 bg-white p-4 shadow-xl md:right-12 md:w-[min(92vw,420px)]" aria-label="Buscar productos">
          <label htmlFor="nav-product-search" className="mb-2 block text-xs font-bold uppercase">Buscar productos</label>
          <input
            id="nav-product-search"
            autoFocus
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nombre de la prenda"
            className="w-full border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-black"
          />
          {searchLoading && <p className="py-4 text-xs text-neutral-500">Buscando...</p>}
          {searchError && <p role="alert" className="py-4 text-xs text-red-700">{searchError}</p>}
          {!searchLoading && !searchError && search.trim() && searchResults.length === 0 && (
            <p className="py-4 text-xs text-neutral-500">No encontramos productos.</p>
          )}
          {searchResults.length > 0 && (
            <ul className="mt-2 max-h-72 overflow-y-auto">
              {searchResults.map((product) => (
                <li key={product.id}>
                  <Link
                    to={`/producto/${product.id}`}
                    onClick={() => setSearchIsOpen(false)}
                    className="flex items-center gap-3 border-b border-neutral-100 py-2 last:border-0"
                  >
                    <img src={product.image} alt="" className="h-12 w-10 bg-neutral-100 object-contain" />
                    <span className="min-w-0 flex-1 truncate text-xs font-bold uppercase">{product.name}</span>
                    <span className="text-xs">{formatPrice(product.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </nav>
  );
};

export default NavBar;
