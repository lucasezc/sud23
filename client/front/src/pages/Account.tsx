import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Heart, Trash2 } from "lucide-react";
import AnnouncementBar from "../components/AnnouncementBar";
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../data/products";
import type { Product } from "../interfaces/product";
import { getFavorites, removeFavorite } from "../services/favorites";

const Account = () => {
  const { token, user, sessionLoading, sessionError, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [favoritesError, setFavoritesError] = useState("");

  useEffect(() => {
    if (!token || !user || sessionLoading) return;
    let active = true;
    setLoadingFavorites(true);
    getFavorites(token)
      .then((items) => {
        if (active) setFavorites(items);
      })
      .catch((error: unknown) => {
        if (active) setFavoritesError(error instanceof Error ? error.message : "No se pudieron cargar tus favoritos");
      })
      .finally(() => {
        if (active) setLoadingFavorites(false);
      });
    return () => { active = false; };
  }, [token, user, sessionLoading]);

  const handleRemoveFavorite = async (productId: string) => {
    if (!token) return;
    setFavoritesError("");
    try {
      await removeFavorite(token, productId);
      setFavorites((current) => current.filter((product) => product.id !== productId));
    } catch (error) {
      setFavoritesError(error instanceof Error ? error.message : "No se pudo quitar el favorito");
    }
  };

  if (sessionLoading) {
    return <main className="grid min-h-screen place-items-center text-sm">Verificando tu sesión...</main>;
  }
  if (!user || !token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-black">
      <AnnouncementBar />
      <header className="sticky top-0 z-50"><NavBar /></header>
      <main className="mx-auto min-h-[60vh] max-w-7xl px-4 py-8 md:px-12">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black uppercase">Mi cuenta</h1>
            <p className="mt-2 text-sm text-neutral-600">{user.name} · {user.email}</p>
            {sessionError && <p role="alert" className="mt-2 text-sm text-red-700">{sessionError}</p>}
            {user.role === "admin" && (
              <Link to="/admin" className="mt-4 inline-block bg-black px-4 py-2 text-xs font-bold uppercase text-white">
                Abrir panel administrador
              </Link>
            )}
          </div>
          <button
            onClick={() => { logout(); navigate("/"); }}
            className="border border-neutral-300 bg-white px-4 py-2 text-xs font-bold uppercase"
          >
            Cerrar sesión
          </button>
        </div>

        <section>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
            <Heart className="h-4 w-4" /> Mis favoritos
          </h2>
          {favoritesError && <p role="alert" className="mb-4 border border-red-300 bg-red-50 p-3 text-sm text-red-700">{favoritesError}</p>}
          {loadingFavorites ? (
            <p className="py-8 text-sm text-neutral-500">Cargando favoritos...</p>
          ) : favorites.length === 0 ? (
            <p className="py-8 text-sm text-neutral-500">Todavía no guardaste prendas en favoritos.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {favorites.map((product) => (
                <article key={product.id} className="border border-neutral-200 bg-white">
                  <Link to={`/producto/${product.id}`} className="block">
                    <div className="aspect-[4/5] overflow-hidden bg-neutral-100">
                      <img src={product.image} alt={product.name} className="h-full w-full object-contain mix-blend-multiply" />
                    </div>
                    <div className="p-3">
                      <h3 className="text-xs font-bold uppercase">{product.name}</h3>
                      <p className="mt-1 text-xs">{formatPrice(product.price)}</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => void handleRemoveFavorite(product.id)}
                    className="flex w-full items-center justify-center gap-2 border-t border-neutral-200 py-2 text-[10px] font-bold uppercase"
                    aria-label={`Quitar ${product.name} de favoritos`}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Quitar
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Account;
