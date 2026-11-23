import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { API_URL, getProducts } from "../services/products";
import type { Product } from "../interfaces/product";
import { useAuth } from "../context/AuthContext";
import { formatPrice, parseArgentinePrice } from "../data/products";

const emptyForm = {
  product: "",
  description: "",
  price: "",
  stock: "",
  category: "",
  image: "",
  sizes: "S,M,L,XL",
  active: true,
};

const Admin = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const { token, logout } = useAuth();

  const load = async () => {
    try {
      setProducts(await getProducts());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const price = parseArgentinePrice(form.price);
    if (price === null) {
      setError("Ingresa un precio válido en pesos argentinos, por ejemplo 50.000.");
      return;
    }

    const payload = {
      product: form.product,
      description: form.description,
      price,
      stock: Number(form.stock),
      category: form.category,
      image: form.image,
      images: form.image ? [form.image] : [],
      sizes: form.sizes.split(",").map((size) => size.trim()).filter(Boolean),
      active: form.active,
    };

    try {
      setSaving(true);
      const response = await fetch(editingId ? `${API_URL}/${editingId}` : API_URL, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("No se pudo guardar el producto");
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const edit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      product: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      category: product.category,
      image: product.image,
      sizes: product.sizes.join(","),
      active: true,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id: string) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) {
      setError("No se pudo eliminar el producto");
      return;
    }
    await load();
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-black">
      <header className="sticky top-0 z-50"><NavBar /></header>
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link to="/" className="mb-2 flex items-center gap-1 text-xs font-bold uppercase"><ArrowLeft className="h-4 w-4" /> Tienda</Link>
            <h1 className="text-2xl font-black uppercase">Panel administrador</h1>
          </div>
          <button onClick={logout} className="border border-neutral-300 bg-white px-4 py-2 text-xs font-bold uppercase">Cerrar sesión</button>
        </div>

        {error && <p className="mb-4 border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <form onSubmit={submit} className="mb-8 grid gap-3 border border-neutral-200 bg-white p-4 md:grid-cols-2 lg:grid-cols-4">
          <input required placeholder="Nombre" value={form.product} onChange={(event) => setForm({ ...form, product: event.target.value })} className="border px-3 py-2.5 text-sm" />
          <input required placeholder="Descripción" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="border px-3 py-2.5 text-sm" />
          <label className="flex flex-col gap-1 text-xs text-neutral-500">
            Precio (ARS)
            <input required inputMode="decimal" type="text" placeholder="50.000" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className="border px-3 py-2.5 text-sm text-black" />
          </label>
          <input required min="0" type="number" placeholder="Stock" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} className="border px-3 py-2.5 text-sm" />
          <input required placeholder="Categoría" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="border px-3 py-2.5 text-sm" />
          <input placeholder="URL de imagen" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} className="border px-3 py-2.5 text-sm" />
          <input placeholder="Talles: S,M,L,XL" value={form.sizes} onChange={(event) => setForm({ ...form, sizes: event.target.value })} className="border px-3 py-2.5 text-sm" />
          <button type="submit" className="flex items-center justify-center gap-2 bg-black px-4 py-2.5 text-xs font-bold uppercase text-white">
            {editingId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Agregar producto"}
          </button>
        </form>

        {loading ? <p>Cargando...</p> : (
          <div className="overflow-x-auto bg-white">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b bg-neutral-100"><tr><th className="p-3">Producto</th><th className="p-3">Precio</th><th className="p-3">Stock</th><th className="p-3">Acciones</th></tr></thead>
              <tbody>{products.map((product) => (
                <tr key={product.id} className="border-b">
                  <td className="p-3"><div className="flex items-center gap-3"><img src={product.image} alt="" className="h-12 w-12 object-cover" /><span className="font-bold">{product.name}</span></div></td>
                  <td className="p-3">{formatPrice(product.price)}</td><td className="p-3">{product.stock}</td>
                  <td className="p-3"><div className="flex gap-2"><button onClick={() => edit(product)} className="border p-2" aria-label="Editar"><Pencil className="h-4 w-4" /></button><button onClick={() => void remove(product.id)} className="border p-2 text-red-600" aria-label="Eliminar"><Trash2 className="h-4 w-4" /></button></div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
