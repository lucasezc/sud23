import type { Product } from "../interfaces/product";
import { mapProduct } from "./products";

const API_URL = `${(import.meta.env.VITE_API_URL ?? "http://localhost:9010/api").replace(/\/+$/, "")}/auth/favorites`;

const authorizedFetch = async (token: string, url = API_URL, init: RequestInit = {}) => {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...init.headers,
      Authorization: `Bearer ${token}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (!response.ok) {
    const data: unknown = await response.json().catch(() => null);
    const message = data && typeof data === "object" && "message" in data && typeof data.message === "string"
      ? data.message
      : "No se pudieron actualizar los favoritos";
    throw new Error(message);
  }
  return response;
};

export const getFavorites = async (token: string): Promise<Product[]> => {
  const response = await authorizedFetch(token);
  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new Error("El servidor devolvió una lista de favoritos inválida");
  return data.map((item) => mapProduct(item as Record<string, unknown>));
};

export const addFavorite = async (token: string, productId: string): Promise<void> => {
  await authorizedFetch(token, `${API_URL}/${encodeURIComponent(productId)}`, { method: "POST" });
};

export const removeFavorite = async (token: string, productId: string): Promise<void> => {
  await authorizedFetch(token, `${API_URL}/${encodeURIComponent(productId)}`, { method: "DELETE" });
};
