import type { CartItem } from "../context/CartContext";

const API_URL = `${(import.meta.env.VITE_API_URL ?? "http://localhost:9010/api").replace(/\/+$/, "")}/payments`;

export interface CheckoutCustomer {
  name: string;
  email: string;
  phone: string;
}

export interface CheckoutAddress {
  street: string;
  number: string;
  floor: string;
  apartment: string;
  city: string;
  province: string;
  zipCode: string;
}

export const getShippingQuote = async (items: CartItem[]): Promise<{
  deliveryCost: number;
  pickupCost: number;
  freeShipping: boolean;
}> => {
  const response = await fetch(`${API_URL}/mercadopago/shipping-quote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: items.map(({ product, quantity, size }) => ({ productId: product.id, quantity, size })),
    }),
  });
  const data: unknown = await response.json();
  if (!response.ok || !data || typeof data !== "object") {
    throw new Error("No se pudo calcular el envío");
  }
  const quote = data as Record<string, unknown>;
  if (typeof quote.deliveryCost !== "number" || typeof quote.pickupCost !== "number") {
    throw new Error("El servidor devolvió una cotización inválida");
  }
  return {
    deliveryCost: quote.deliveryCost,
    pickupCost: quote.pickupCost,
    freeShipping: quote.freeShipping === true,
  };
};

export const createMercadoPagoPreferenceWithShipping = async (
  items: CartItem[],
  customer: CheckoutCustomer,
  shippingMethod: "delivery" | "pickup",
  address?: CheckoutAddress,
): Promise<string> => {
  const response = await fetch(`${API_URL}/mercadopago/preference`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: items.map(({ product, quantity, size }) => ({
        productId: product.id,
        quantity,
        size,
      })),
      customer,
      shippingMethod,
      address,
    }),
  });

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error("El servidor devolvió una respuesta inválida al iniciar el pago");
  }

  if (!data || typeof data !== "object") {
    throw new Error("El servidor devolvió una respuesta inválida al iniciar el pago");
  }
  if (!response.ok) {
    const message = "message" in data && typeof data.message === "string"
      ? data.message
      : "No se pudo iniciar el pago";
    throw new Error(message);
  }
  if (!("checkoutUrl" in data) || typeof data.checkoutUrl !== "string" ||
    !data.checkoutUrl.startsWith("https://")) {
    throw new Error("Mercado Pago no devolvió un enlace de pago válido");
  }

  return data.checkoutUrl;
};
