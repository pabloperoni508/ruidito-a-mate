import { useState } from "react";
import { useFetch } from "../../hooks/useFetch";
import { getCategories } from "../../services/categoryService";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  deleteProductImage,
} from "../../services/productService";
import StatusBadge from "../../components/StatusBadge";
import StateMessage from "../../components/StateMessage";

const EMPTY_FORM = {
  name: "",
  description: "",
  category_id: "",
  status: "disponible",
};

function Productos() {
  const { data: products, loading: loadingProducts, error: errorProducts, refetch } = useFetch(getProducts, []);
  const { data: categories, loading: loadingCategories } = useFetch(getCategories, []);

  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [images, setImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  function handleField(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleFileChange(e) {
    setNewImages(Array.from(e.target.files));
  }

  function handleEdit(product) {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description ?? "",
      category_id: product.category_id ?? "",
      status: product.status,
    });
    setImages(product.images ?? []);
    setNewImages([]);
    setFormError(null);
    setShowForm(true);
  }

  function handleCancel() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImages([]);
    setNewImages([]);
    setFormError(null);
    setShowForm(false);
  }

  function handleRemoveExistingImage(url) {
    setImages((prev) => prev.filter((img) => img !== url));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    setFormError(null);
    try {
      const uploadedUrls = await Promise.all(
        newImages.map((file) => uploadProductImage(file))
      );
      if (editing) {
        const removed = (editing.images ?? []).filter(
          (url) => !images.includes(url)
        );
        await Promise.all(removed.map((url) => deleteProductImage(url)));
      }
      const finalImages = [...images, ...uploadedUrls];
      const payload = { ...form, images: finalImages };
      if (editing) {
        await updateProduct(editing.id, payload);
      } else {
        await createProduct(payload);
      }
      handleCancel();
      refetch();
    } catch {
      setFormError("Ocurrió un error. Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(product) {
    const newStatus = product.status === "disponible" ? "sin_stock" : "disponible";
    try {
      await updateProduct(product.id, { status: newStatus });
      refetch();
    } catch {
      alert("No se pudo cambiar el estado.");
    }
  }

  async function handleDelete(product) {
    if (!confirm(`¿Eliminar "${product.name}"?`)) return;
    try {
      await Promise.all((product.images ?? []).map((url) => deleteProductImage(url)));
      await deleteProduct(product.id);
      refetch();
    } catch {
      alert("No se pudo eliminar el producto.");
    }
  }

  if (loadingProducts || loadingCategories) {
    return <StateMessage type="loading" message="Cargando productos..." />;
  }
  if (errorProducts) {
    return <StateMessage type="error" message="No se pudieron cargar los productos." />;
  }

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Productos</h1>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="bg-brand-brown text-brand-white text-sm font-semibold px-5 py-2.5 rounded-full"
          >
            + Agregar
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 border border-brand-gray rounded-2xl p-5"
        >
          <h2 className="font-semibold">
            {editing ? "Editar producto" : "Nuevo producto"}
          </h2>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Nombre</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleField}
              required
              className="w-full border border-brand-gray rounded-xl px-4 py-3 focus:outline-none focus:border-brand-brown"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Descripción</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleField}
              rows={3}
              className="w-full border border-brand-gray rounded-xl px-4 py-3 focus:outline-none focus:border-brand-brown resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Categoría</label>
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleField}
              className="w-full border border-brand-gray rounded-xl px-4 py-3 focus:outline-none focus:border-brand-brown bg-brand-white"
            >
              <option value="">Sin categoría</option>
              {(categories ?? []).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Estado</label>
            <select
              name="status"
              value={form.status}
              onChange={handleField}
              className="w-full border border-brand-gray rounded-xl px-4 py-3 focus:outline-none focus:border-brand-brown bg-brand-white"
            >
              <option value="disponible">Disponible</option>
              <option value="sin_stock">Sin stock</option>
            </select>
          </div>

          {images.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">Imágenes actuales</label>
              <div className="flex gap-2 flex-wrap">
                {images.map((url) => (
                  <div key={url} className="relative w-20 h-20">
                    <img
                      src={url}
                      alt="Imagen del producto"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(url)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-brand-red text-brand-white rounded-full text-xs flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              {images.length > 0 ? "Agregar más imágenes" : "Imágenes"}
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="w-full text-sm text-brand-brown-light"
            />
          </div>

          {formError && <p className="text-brand-red text-sm">{formError}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-brand-brown text-brand-white font-semibold py-3 rounded-full disabled:opacity-50"
            >
              {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear producto"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 rounded-full border border-brand-gray text-brand-brown-dark font-medium"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {products.length === 0 ? (
        <StateMessage type="empty" message="No hay productos todavía." />
      ) : (
        <ul className="space-y-3">
          {products.map((product) => (
            <li
              key={product.id}
              className="flex items-center gap-4 border border-brand-gray rounded-xl px-4 py-3"
            >
              <div className="w-14 h-14 rounded-lg bg-brand-gray overflow-hidden flex-shrink-0 flex items-center justify-center">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-brand-brown-light">—</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{product.name}</p>
                <p className="text-xs text-brand-brown-light">
                  {product.categories?.name ?? "Sin categoría"}
                </p>
                <StatusBadge status={product.status} />
              </div>

              <div className="flex flex-col gap-1 items-end flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleEdit(product)}
                  className="text-sm text-brand-brown font-medium"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleStatus(product)}
                  className="text-xs text-brand-brown-light"
                >
                  {product.status === "disponible" ? "Marcar sin stock" : "Marcar disponible"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(product)}
                  className="text-sm text-brand-red font-medium"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default Productos;