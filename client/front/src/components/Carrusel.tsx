import { useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

// Sliders con fotos de producto (sólo ropa) en blanco y negro
const slides = [
  {
    id: 1,
    brand: "SÜD23",
    title: "LESS,\nBUT BETTER.",
    subtitle: "ESSENTIAL T-SHIRT",
    buttonText: "DESCUBRIR PRENDA",
    image: "https://images.unsplash.com/photo-1576566152370-b0aeec91c73a?q=80&w=1600&auto=format&fit=crop"
  },
  {
    id: 2,
    brand: "SÜD23",
    title: "URBAN\nOVERSIZE.",
    subtitle: "CARGO PANTS / DROP 01",
    buttonText: "VER DETALLES",
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1600&auto=format&fit=crop"
  },
  {
    id: 3,
    brand: "SÜD23",
    title: "STREET\nMINIMALISM.",
    subtitle: "CORE HOODIE",
    buttonText: "COMPRAR AHORA",
    image: "https://images.unsplash.com/photo-1620799139284-6552978d9196?q=80&w=1600&auto=format&fit=crop"
  }
];

const Carrusel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  console.log(`Current index: ${currentIndex}`)

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const currentSlide = slides[currentIndex];

  return (
    <div className="relative w-full h-[55vh] overflow-hidden flex items-center bg-gray-50">
      {/* Imagen de Fondo (Producto solo con filtro B&W) */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out filter grayscale"
        style={{ backgroundImage: `url(${currentSlide.image})` }}
      >
        {/* Degradado lateral para que el texto resalte a la izquierda */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/50 to-transparent"></div>
      </div>

      {/* Contenido Texto / Banner (Izquierda) */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full flex flex-col justify-between h-full py-16">
        
        {/* Bloque del Título y Botón */}
        <div className="max-w-xl my-auto space-y-4">
          <span className="text-xs md:text-sm font-bold tracking-[0.3em] text-black uppercase">
            {currentSlide.brand}
          </span>
          
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-black whitespace-pre-line leading-none">
            {currentSlide.title}
          </h2>

          <p className="text-xs md:text-sm tracking-[0.2em] text-gray-800 uppercase font-medium pt-2">
            {currentSlide.subtitle}
          </p>

          <div className="pt-4">
            <button className="bg-black text-white px-6 py-3.5 text-xs font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-gray-800 transition-colors cursor-pointer group">
              {currentSlide.buttonText}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Controles de Navegación "1/3 < >" */}
        <div className="flex items-center gap-6 pt-8">
          <span className="text-xs font-bold tracking-widest text-black">
            {currentIndex + 1} / {slides.length}
          </span>

          <div className="flex items-center gap-2">
            <button 
              onClick={prevSlide}
              className="p-1 hover:opacity-60 transition-opacity cursor-pointer"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5 text-black" />
            </button>
            <button 
              onClick={nextSlide}
              className="p-1 hover:opacity-60 transition-opacity cursor-pointer"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-5 h-5 text-black" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Carrusel;