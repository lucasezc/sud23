import type { Product } from "../interfaces/product";

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);

const SIZES = ["S", "M", "L", "XL"];

// TODO: reemplazar por la llamada a la API.
// En `images` van todas las fotos de la galería (frente, espalda, detalle, etc.).
// Por ahora repito la misma foto hasta que tengas las otras.
export const products: Product[] = [
  {
    id: "1",
    name: "Buzo SÜD23",
    price: 25000,
    description:
      "Buzo de algodón premium, con calce regular y logo SÜD23 en el pecho. Un básico para todos los días.",
    longDescription:
      "Diseñado para acompañarte en todo momento. El Buzo SÜD23 combina comodidad, calidad y un diseño atemporal. Ideal para un look urbano y versátil.",
    details: [
      "Algodón 100% de alta calidad",
      "Logo SÜD23 bordado",
      "Calce regular",
    ],
    image:
      "https://focus.ar/cdn/shop/files/BuzoLebronProducto1_2000x2000.png?v=1744146460",
    images: Array(5).fill(
      "https://focus.ar/cdn/shop/files/BuzoLebronProducto1_2000x2000.png?v=1744146460"
    ),
    sizes: SIZES,
    category: "Buzos",
    stock: 10,
    rating: 4.8,
    reviews: 124,
  },
  {
    id: "2",
    name: "Remera SÜD23",
    price: 25000,
    description:
      "Remera de algodón premium, con calce regular y detalles en vivos blancos que realzan su diseño minimalista. Logo SÜD23 bordado en el pecho.",
    longDescription:
      "Diseñada para acompañarte en todo momento. La Remera SÜD23 combina comodidad, calidad y un diseño atemporal. Ideal para un look urbano y versátil.",
    details: [
      "Algodón 100% de alta calidad",
      "Logo SÜD23 bordado",
      "Detalles en vivos blancos",
      "Calce regular",
    ],
    image:
      "https://focus.ar/cdn/shop/files/MuskNegraFrenteLogo_8f985f03-68b6-4523-9249-80a2a1e06217_2000x2000.png?v=1744077279",
    images: Array(5).fill(
      "https://focus.ar/cdn/shop/files/MuskNegraFrenteLogo_8f985f03-68b6-4523-9249-80a2a1e06217_2000x2000.png?v=1744077279"
    ),
    sizes: SIZES,
    category: "Remeras",
    stock: 10,
    rating: 4.8,
    reviews: 124,
  },
  {
    id: "3",
    name: "Short SÜD23",
    price: 25000,
    description:
      "Short de algodón premium, con calce regular y logo SÜD23. Liviano, cómodo y listo para el día a día.",
    longDescription:
      "Diseñado para acompañarte en todo momento. El Short SÜD23 combina comodidad, calidad y un diseño atemporal. Ideal para un look urbano y versátil.",
    details: [
      "Algodón 100% de alta calidad",
      "Logo SÜD23",
      "Cintura elastizada",
      "Calce regular",
    ],
    image:
      "https://focus.ar/cdn/shop/files/short-bryant-producto-1_2000x2000.png?v=1782402177",
    images: Array(5).fill(
      "https://focus.ar/cdn/shop/files/short-bryant-producto-1_2000x2000.png?v=1782402177"
    ),
    sizes: SIZES,
    category: "Shorts",
    stock: 10,
    rating: 4.8,
    reviews: 124,
  },
];