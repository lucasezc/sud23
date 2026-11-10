// Poné acá las rutas a tus imágenes (por ej. /banner-brand.jpg en /public).
// Si las dejás vacías, se ve un fondo oscuro con degradado.
const BRAND_IMAGE = "";
const DETAIL_IMAGE = "";

type Banner = {
  id: number;
  title?: string;
  text: string;
  button: string;
  image: string;
  href: string;
};

const banners: Banner[] = [
  {
    id: 1,
    title: "SÜD23",
    text: "DESIGNED TO BE DIFFERENT.",
    button: "CONOCÉ MÁS",
    image: BRAND_IMAGE,
    href: "/nosotros",
  },
  {
    id: 2,
    text: "CALIDAD\nEN CADA DETALLE.",
    button: "VER DETALLES",
    image: DETAIL_IMAGE,
    href: "/coleccion",
  },
];

const FeatureBanners = () => {
  return (
    <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-1 px-4 md:grid-cols-2 md:gap-2 md:px-12">
      {banners.map((b) => (
        <article
          key={b.id}
          className="relative flex h-56 items-center overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-600 md:h-64 lg:h-72"
        >
          {b.image && (
            <img
              src={b.image}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover grayscale"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

          <div className="relative z-10 flex flex-col items-start gap-3 px-6 text-white md:px-10">
            {b.title && (
              <h3 className="text-4xl font-black tracking-tight md:text-5xl">
                {b.title}
              </h3>
            )}
            <p className="whitespace-pre-line text-[10px] font-medium uppercase tracking-[0.25em] md:text-xs">
              {b.text}
            </p>
            <a
              href={b.href}
              className="mt-2 border border-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-white hover:text-black"
            >
              {b.button}
            </a>
          </div>
        </article>
      ))}
    </section>
  );
};

export default FeatureBanners;