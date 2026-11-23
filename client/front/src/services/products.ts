import type { Product } from "../interfaces/product";

const API_ROOT = (import.meta.env.VITE_API_URL ?? "http://localhost:9010/api").replace(/\/+$/, "");
export const API_URL = `${API_ROOT}/products`;

export const mapProduct = (item: Record<string, unknown>): Product => {
  const image = String(item.image ?? "");
  const rawImages = Array.isArray(item.images) ? item.images.map(String) : [];

  return {
    id: String(item._id ?? item.id ?? ""),
    name: String(item.product ?? item.name ?? "Producto"),
    price: Number(item.price ?? 0),
    description: String(item.description ?? ""),
    longDescription: String(item.longDescription ?? item.description ?? ""),
    details: Array.isArray(item.details) ? item.details.map(String) : [],
    image: image || rawImages[0] || "",
    images: rawImages.length ? rawImages : image ? [image] : [],
    sizes: Array.isArray(item.sizes) ? item.sizes.map(String) : ["S", "M", "L", "XL"],
    category: String(item.category ?? "General"),
    stock: Number(item.stock ?? 0),
    rating: Number(item.rating ?? 0),
    reviews: Number(item.reviews ?? 0),
  };
};

export const getProducts = async (search?: string): Promise<Product[]> => {
  const url = new URL(API_URL);
  if (search?.trim()) url.searchParams.set("search", search.trim());
  const response = await fetch(url);
  if (!response.ok) throw new Error("No se pudieron cargar los productos");
  const data = await response.json();
  return data.map(mapProduct);
};

export const getProduct = async (id: string): Promise<Product> => {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) throw new Error("Producto no encontrado");
  return mapProduct(await response.json());
};
