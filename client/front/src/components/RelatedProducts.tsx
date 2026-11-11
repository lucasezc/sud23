import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { products, formatPrice } from "../data/products";

type Props = { currentId: string };

const RelatedProducts = ({ currentId }: Props) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const related = products.filter((p) => p.id !== currentId);

  const scroll = (dir: 1 | -1) =>
    trackRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });

  if (related.length === 0) return null;

  return (
    <section className="mt-12 md:mt-16">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] md:text-xs">
          También te puede gustar
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll(-1)}
            aria-label="Anterior"
            className="cursor-pointer p-1 transition-opacity hover:opacity-60"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll(1)}
            aria-label="Siguiente"
            className="cursor-pointer p-1 transition-opacity hover:opacity-60"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-4"
      >
        {related.map((p) => (
          <Link
            key={p.id}
            to={`/producto/${p.id}`}
            className="group w-40 shrink-0 snap-start sm:w-44 md:w-52"
          >
            <div className="aspect-[4/5] overflow-hidden bg-neutral-100">
              <img
                src={p.image}
                alt={p.name}
                loading="lazy"
                className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="mt-2 flex flex-col gap-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wide">
                {p.name}
              </span>
              <span className="text-[11px] font-semibold">
                {formatPrice(p.price)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;