import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Cloud,
  Feather,
  Shirt,
  Star,
  Heart,
  ShoppingBag,
  ZoomIn,
  Truck,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import AnnouncementBar from "../components/AnnouncementBar";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import RelatedProducts from "../components/RelatedProducts";
import { products, formatPrice } from "../data/products";

type TabKey = "descripcion" | "envios" | "cambios";

const tabs: { key: TabKey; label: string }[] = [
  { key: "descripcion", label: "Descripción" },
  { key: "envios", label: "Envíos" },
  { key: "cambios", label: "Cambios" },
];

const features = [
  { icon: Cloud, label: "100% Algodón" },
  { icon: Feather, label: "Tela suave y resistente" },
  { icon: Shirt, label: "Calce regular" },
];

const perks = [
  { icon: Truck, label: "Envíos a todo el país" },
  { icon: ShieldCheck, label: "Compra segura" },
  { icon: CreditCard, label: "Medios de pago" },
];

const ProductDetail = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);

  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState("M");
  const [tab, setTab] = useState<TabKey>("descripcion");
  const [zoom, setZoom] = useState(false);
  const [fav, setFav] = useState(false);
  const [added, setAdded] = useState(false);

  // Al cambiar de producto (ej. desde "También te puede gustar") se reinicia todo
  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImg(0);
    setZoom(false);
    setTab("descripcion");
    setAdded(false);
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen bg-white text-black">
        <header className="sticky top-0 z-50">
          <NavBar />
        </header>
        <main className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-24 text-center">
          <h1 className="text-2xl font-black uppercase">Producto no encontrado</h1>
          <Link
            to="/"
            className="bg-black px-6 py-3 text-xs font-bold uppercase tracking-widest text-white"
          >
            Volver al inicio
          </Link>
        </main>
      </div>
    );
  }

  const handleAddToCart = () => {
    // TODO: conectar con el estado/contexto del carrito
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const tabContent: Record<TabKey, React.ReactNode> = {
    descripcion: (
      <>
        <p className="text-sm leading-relaxed text-neutral-700">
          {product.longDescription}
        </p>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-neutral-700">
          {product.details.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </>
    ),
    // TODO: reemplazar por tus políticas reales
    envios: (
      <p className="text-sm leading-relaxed text-neutral-700">
        Enviamos a todo el país. El costo y el tiempo de entrega se calculan al
        finalizar la compra según tu código postal.
      </p>
    ),
    cambios: (
      <p className="text-sm leading-relaxed text-neutral-700">
        Si la prenda no te queda bien, podés cambiarla por otro talle o
        producto. Escribinos y te ayudamos con el proceso.
      </p>
    ),
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <AnnouncementBar />
      <header className="sticky top-0 z-50">
        <NavBar />
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-12 md:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-12">
          {/* ---------- Galería ---------- */}
          <div className="flex flex-col-reverse gap-3 md:flex-row">
            {/* Miniaturas */}
            <div className="flex gap-2 overflow-x-auto md:w-20 md:shrink-0 md:flex-col md:overflow-visible">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  aria-label={`Ver foto ${i + 1}`}
                  className={`h-16 w-16 shrink-0 cursor-pointer overflow-hidden border-2 bg-neutral-100 md:h-20 md:w-20 ${
                    activeImg === i ? "border-black" : "border-transparent"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="h-full w-full object-contain mix-blend-multiply"
                  />
                </button>
              ))}
            </div>

            {/* Foto principal */}
            <div className="relative aspect-square w-full overflow-hidden bg-neutral-100 md:flex-1">
              <img
                src={product.images[activeImg]}
                alt={product.name}
                className={`h-full w-full object-contain mix-blend-multiply transition-transform duration-300 ${
                  zoom ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
                }`}
                onClick={() => setZoom(!zoom)}
              />
              <button
                onClick={() => setZoom(!zoom)}
                aria-label="Ampliar imagen"
                className="absolute bottom-3 right-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white shadow transition-transform hover:scale-105"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ---------- Info ---------- */}
          <div className="flex flex-col">
            {/* Breadcrumb */}
            <nav className="mb-3 flex flex-wrap items-center gap-1.5 text-[11px] text-neutral-500">
              <Link to="/" className="hover:text-black">Inicio</Link>
              <span>›</span>
              <Link to="/" className="hover:text-black">Colección</Link>
              <span>›</span>
              <span className="text-black underline">{product.name}</span>
            </nav>

            <h1 className="text-3xl font-black uppercase leading-none tracking-tight md:text-4xl">
              {product.name}
            </h1>
            <p className="mt-2 text-2xl font-bold md:text-3xl">
              {formatPrice(product.price)}
            </p>

            {/* Rating */}
            <div className="mt-3 flex items-center gap-2 border-b border-neutral-200 pb-4">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < Math.round(product.rating)
                        ? "fill-black text-black"
                        : "text-neutral-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-neutral-600">
                {product.rating} ({product.reviews} reseñas)
              </span>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-neutral-700">
              {product.description}
            </p>

            {/* Features */}
            <ul className="mt-5 grid grid-cols-3 divide-x divide-neutral-200">
              {features.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex flex-col items-center gap-1.5 px-2 text-center"
                >
                  <Icon className="h-6 w-6" strokeWidth={1.5} />
                  <span className="text-[10px] leading-tight text-neutral-700">
                    {label}
                  </span>
                </li>
              ))}
            </ul>

            {/* Talles */}
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wide">
                  Talle:
                </span>
                <button className="cursor-pointer text-[11px] underline hover:text-neutral-600">
                  ¿Cuál es mi talle?
                </button>
              </div>
              <div className="flex gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    aria-pressed={size === s}
                    className={`h-9 w-11 cursor-pointer border text-[11px] font-bold transition-colors ${
                      size === s
                        ? "border-black bg-black text-white"
                        : "border-neutral-300 bg-white hover:border-black"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Botones */}
            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={handleAddToCart}
                className="flex cursor-pointer items-center justify-center gap-2 bg-black py-3.5 text-[11px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-neutral-800"
              >
                <ShoppingBag className="h-4 w-4" />
                {added ? "Agregado ✓" : "Agregar al carrito"}
              </button>
              <button
                onClick={() => setFav(!fav)}
                aria-pressed={fav}
                className="flex cursor-pointer items-center justify-center gap-2 border border-black py-3.5 text-[11px] font-bold uppercase tracking-widest transition-colors hover:bg-neutral-100"
              >
                <Heart className={`h-4 w-4 ${fav ? "fill-black" : ""}`} />
                {fav ? "En favoritos" : "Agregar a favoritos"}
              </button>
            </div>

            {/* Perks */}
            <ul className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              {perks.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-1.5">
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                  <span className="text-[10px] text-neutral-600">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ---------- Tabs + imagen de detalle ---------- */}
        <section className="mt-12 grid gap-6 md:mt-16 md:grid-cols-2 md:gap-8">
          <div>
            <div className="flex gap-6 border-b border-neutral-200">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`-mb-px cursor-pointer border-b-2 pb-2 text-[11px] font-bold uppercase tracking-wide transition-colors ${
                    tab === t.key
                      ? "border-black text-black"
                      : "border-transparent text-neutral-500 hover:text-black"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="pt-5">{tabContent[tab]}</div>
          </div>

          <div className="aspect-[16/9] overflow-hidden bg-neutral-100">
            <img
              src={product.images[2] ?? product.images[0]}
              alt={`Detalle de ${product.name}`}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        </section>

        <RelatedProducts currentId={product.id} />
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;