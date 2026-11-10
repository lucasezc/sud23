import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

const slides = [
  {
    id: 1,
    brand: "SÜD23",
    title: "LESS,\nBUT BETTER.",
    subtitle: "ESSENTIAL COLLECTION",
    buttonText: "DESCUBRIR COLECCIÓN",
    image:
      "https://images.unsplash.com/photo-1576566152370-b0aeec91c73a?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: 2,
    brand: "SÜD23",
    title: "URBAN\nOVERSIZE.",
    subtitle: "CARGO PANTS / DROP 01",
    buttonText: "VER DETALLES",
    image:
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: 3,
    brand: "SÜD23",
    title: "STREET\nMINIMALISM.",
    subtitle: "CORE HOODIE",
    buttonText: "COMPRAR AHORA",
    image:
      "https://images.unsplash.com/photo-1620799139284-6552978d9196?q=80&w=1600&auto=format&fit=crop",
  },
];

const AUTOPLAY_MS = 6000;

const Carrusel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () =>
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  const nextSlide = () =>
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));

  // Autoplay: se reinicia cada vez que cambia el slide (incluso con los botones)
  useEffect(() => {
    const id = setInterval(nextSlide, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [currentIndex]);

  const current = slides[currentIndex];

  return (
    <section className="relative h-[520px] w-full overflow-hidden bg-neutral-200 md:h-[60vh] md:min-h-[520px]">
      {/* Fotos apiladas con crossfade */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          aria-hidden={i !== currentIndex}
          className={`absolute inset-0 bg-cover bg-center grayscale transition-opacity duration-700 ease-in-out ${
            i === currentIndex ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url(${s.image})` }}
        />
      ))}

      {/* Degradado: abajo en mobile, a la izquierda en desktop */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-transparent md:bg-gradient-to-r md:from-white/95 md:via-white/50 md:to-transparent" />

      {/* Contenido */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col justify-end px-4 py-8 md:justify-between md:px-12 md:py-14">
        <div className="max-w-xl space-y-3 md:my-auto md:space-y-4">
          <span className="block text-xs font-bold uppercase tracking-[0.3em] text-black md:text-sm">
            {current.brand}
          </span>

          <h2 className="whitespace-pre-line text-4xl font-black leading-[0.95] tracking-tight text-black sm:text-5xl md:text-6xl lg:text-7xl">
            {current.title}
          </h2>

          <p className="pt-1 text-[11px] font-medium uppercase tracking-[0.25em] text-neutral-800 md:text-sm">
            {current.subtitle}
          </p>

          <div className="pt-3">
            <button className="group flex cursor-pointer items-center gap-3 bg-black px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-neutral-800 md:px-6 md:py-3.5 md:text-xs">
              {current.buttonText}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Controles 1 / 3 < > */}
        <div className="flex items-center gap-5 pt-6 md:pt-8">
          <span className="text-xs font-bold tracking-widest text-black">
            {currentIndex + 1} / {slides.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={prevSlide}
              className="cursor-pointer p-1 transition-opacity hover:opacity-60"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-5 w-5 text-black" />
            </button>
            <button
              onClick={nextSlide}
              className="cursor-pointer p-1 transition-opacity hover:opacity-60"
              aria-label="Siguiente"
            >
              <ChevronRight className="h-5 w-5 text-black" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Carrusel;