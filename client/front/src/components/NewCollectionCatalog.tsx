const newClothes = [
  {
    id: 1,
    name: "Buzo SÜD23",
    description: "Buzo negro unisex",
    price: 25000,
    stock: 10,
    img: "https://focus.ar/cdn/shop/files/BuzoLebronProducto1_2000x2000.png?v=1744146460",
  },
  {
    id: 2,
    name: "Remera SÜD23",
    description: "Remera negra unisex",
    price: 25000,
    stock: 10,
    img: "https://focus.ar/cdn/shop/files/MuskNegraFrenteLogo_8f985f03-68b6-4523-9249-80a2a1e06217_2000x2000.png?v=1744077279",
  },
  {
    id: 3,
    name: "Short SÜD23",
    description: "Short negro unisex",
    price: 25000,
    stock: 10,
    img: "https://focus.ar/cdn/shop/files/short-bryant-producto-1_2000x2000.png?v=1782402177",
  },
];

const formatPrice = (n: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);

const NewCollectionCatalog = () => {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-12 md:py-12">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] md:text-xs">
          Nueva colección
        </h2>
        <a
          href="/coleccion"
          className="text-[10px] font-medium uppercase tracking-wider text-neutral-600 transition-colors hover:text-black md:text-xs"
        >
          Ver todo →
        </a>
      </div>

      {/* Grilla */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
        {newClothes.map((c) => (
          <article key={c.id} className="group cursor-pointer">
            <div className="aspect-[4/5] overflow-hidden bg-neutral-100">
              <img
                src={c.img}
                alt={c.description}
                loading="lazy"
                className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <div className="mt-2.5 flex flex-col gap-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wide md:text-xs">
                {c.name}
              </span>
              <span className="text-[11px] font-semibold md:text-xs">
                {formatPrice(c.price)}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default NewCollectionCatalog;