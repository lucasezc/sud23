import { useEffect, useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../data/products";
import { createMercadoPagoPreferenceWithShipping, getShippingQuote } from "../services/payments";
import { useAuth } from "../context/AuthContext";

const Cart = () => {
  const { items, total, changeQuantity, removeItem, clearCart } = useCart();
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const { user } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<"delivery" | "pickup">("delivery");
  const [shippingCost, setShippingCost] = useState(0);
  const [customer, setCustomer] = useState({ name: "", email: user?.email ?? "", phone: "" });
  const [address, setAddress] = useState({
    street: "", number: "", floor: "", apartment: "", city: "", province: "", zipCode: "",
  });

  useEffect(() => {
    if (!showCheckout || items.length === 0) return;
    void getShippingQuote(items)
      .then((quote) => setShippingCost(quote.deliveryCost))
      .catch((error: unknown) => setCheckoutError(error instanceof Error ? error.message : "No se pudo calcular el envío"));
  }, [showCheckout, items]);

  useEffect(() => {
    if (user) {
      setCustomer((current) => ({ ...current, name: current.name || user.name, email: user.email }));
    }
  }, [user]);

  const checkout = async () => {
    setCheckoutBusy(true);
    setCheckoutError("");
    try {
      const checkoutUrl = await createMercadoPagoPreferenceWithShipping(
        items,
        customer,
        shippingMethod,
        shippingMethod === "delivery" ? address : undefined,
      );
      window.location.assign(checkoutUrl);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "No se pudo iniciar el pago");
      setCheckoutBusy(false);
    }
  };

  return (
    <aside className="absolute right-0 top-full z-50 w-[min(92vw,380px)] border border-neutral-200 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h2 className="flex items-center gap-2 text-sm font-black uppercase"><ShoppingBag className="h-4 w-4" /> Tu carrito</h2>
        {items.length > 0 && <button onClick={clearCart} className="text-[10px] font-bold uppercase text-neutral-500 hover:text-black">Vaciar</button>}
      </div>

      {items.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-neutral-500">Tu carrito está vacío.</p>
      ) : (
        <div>
          <div className="max-h-[420px] overflow-y-auto px-5">
            {items.map((item) => (
              <div key={`${item.product.id}-${item.size}`} className="flex gap-3 border-b py-4">
                <img src={item.product.image} alt={item.product.name} className="h-20 w-16 bg-neutral-100 object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold uppercase">{item.product.name}</p>
                  <p className="mt-1 text-[11px] text-neutral-500">Talle {item.size}</p>
                  <p className="mt-1 text-xs font-bold">{formatPrice(item.product.price)}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={() => changeQuantity(item.product.id, item.size, item.quantity - 1)} className="border p-1" aria-label="Restar"><Minus className="h-3 w-3" /></button>
                    <span className="w-5 text-center text-xs">{item.quantity}</span>
                    <button onClick={() => changeQuantity(item.product.id, item.size, item.quantity + 1)} className="border p-1" aria-label="Sumar"><Plus className="h-3 w-3" /></button>
                  </div>
                </div>
                <button onClick={() => removeItem(item.product.id, item.size)} className="self-start p-1 text-neutral-500 hover:text-black" aria-label="Eliminar"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
          <div className="border-t p-5">
            <div className="mb-3 flex justify-between text-xs"><span>Subtotal</span><span>{formatPrice(total)}</span></div>
            <div className="mb-4 flex justify-between text-xs"><span>Envío</span><span>{formatPrice(shippingMethod === "pickup" ? 0 : shippingCost)}</span></div>
            <div className="mb-4 flex justify-between text-sm font-bold"><span>Total</span><span>{formatPrice(total + (shippingMethod === "pickup" ? 0 : shippingCost))}</span></div>
            {!showCheckout ? (
              <button
                onClick={() => setShowCheckout(true)}
                className="w-full bg-[#009ee3] py-3.5 text-xs font-bold uppercase tracking-widest text-white"
              >
                Continuar con la compra
              </button>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setShippingMethod("delivery")} className={`border px-2 py-2 text-xs ${shippingMethod === "delivery" ? "border-black bg-neutral-100 font-bold" : ""}`}>Mercado Envíos</button>
                  <button type="button" onClick={() => setShippingMethod("pickup")} className={`border px-2 py-2 text-xs ${shippingMethod === "pickup" ? "border-black bg-neutral-100 font-bold" : ""}`}>Retiro</button>
                </div>
                <input required value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} placeholder="Nombre" className="w-full border px-3 py-2 text-sm" />
                <input required type="email" value={customer.email} onChange={(event) => setCustomer({ ...customer, email: event.target.value })} placeholder="Email" className="w-full border px-3 py-2 text-sm" />
                <input required value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} placeholder="Teléfono" className="w-full border px-3 py-2 text-sm" />
                {shippingMethod === "delivery" && (
                  <>
                    <div className="grid grid-cols-[2fr_1fr] gap-2">
                      <input required value={address.street} onChange={(event) => setAddress({ ...address, street: event.target.value })} placeholder="Calle" className="border px-3 py-2 text-sm" />
                      <input required value={address.number} onChange={(event) => setAddress({ ...address, number: event.target.value })} placeholder="Número" className="border px-3 py-2 text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input value={address.floor} onChange={(event) => setAddress({ ...address, floor: event.target.value })} placeholder="Piso" className="border px-3 py-2 text-sm" />
                      <input value={address.apartment} onChange={(event) => setAddress({ ...address, apartment: event.target.value })} placeholder="Depto." className="border px-3 py-2 text-sm" />
                    </div>
                    <input required value={address.city} onChange={(event) => setAddress({ ...address, city: event.target.value })} placeholder="Localidad" className="w-full border px-3 py-2 text-sm" />
                    <div className="grid grid-cols-2 gap-2">
                      <input required value={address.province} onChange={(event) => setAddress({ ...address, province: event.target.value })} placeholder="Provincia" className="border px-3 py-2 text-sm" />
                      <input required value={address.zipCode} onChange={(event) => setAddress({ ...address, zipCode: event.target.value })} placeholder="Código postal" className="border px-3 py-2 text-sm" />
                    </div>
                  </>
                )}
            {checkoutError && <p role="alert" className="mb-3 text-xs text-red-700">{checkoutError}</p>}
            <button
              onClick={() => void checkout()}
              disabled={checkoutBusy}
              className="w-full bg-[#009ee3] py-3.5 text-xs font-bold uppercase tracking-widest text-white disabled:opacity-50"
            >
              {checkoutBusy ? "Conectando con Mercado Pago..." : "Pagar con Mercado Pago"}
            </button>
              </div>
            )}
            <p className="mt-2 text-center text-[10px] text-neutral-500">Pago seguro procesado por Mercado Pago</p>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Cart;