import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatPrice } from "../data/products";
import type { Product } from "../interfaces/product";
import { getProducts } from "../services/products";

const NewCollectionCatalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="coleccion" className="mx-auto w-full max-w-7xl scroll-mt-20 px-4 py-8 md:px-12 md:py-12">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] md:text-xs">
          Nueva colección
        </h2>
        <button
          onClick={() => document.getElementById("coleccion")?.scrollIntoView({ behavior: "smooth" })}
          className="text-[10px] font-medium uppercase tracking-wider text-neutral-600 transition-colors hover:text-black md:text-xs"
        >
          Ver todo →
        </button>
      </div>

      {/* Grilla */}
      {loading && <p className="py-10 text-center text-sm text-neutral-500">Cargando colección...</p>}
      {!loading && products.length === 0 && <p className="py-10 text-center text-sm text-neutral-500">Todavía no hay productos disponibles.</p>}
      <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
        {products.map((p) => (
          <Link key={p.id} to={`/producto/${p.id}`} className="group">
            <article>
              <div className="aspect-[4/5] overflow-hidden bg-neutral-100">
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="mt-2.5 flex flex-col gap-0.5 text-center">
                <span className="text-[11px] font-bold uppercase tracking-wide md:text-xs">
                  {p.name}
                </span>
                <span className="text-[11px] font-semibold md:text-xs">
                  {formatPrice(p.price)}
                </span>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default NewCollectionCatalog;