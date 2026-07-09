import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import { getCategories } from "../../services/categoryService";
import {
  getProducts,
  createProduct,
  deleteProduct,
  uploadProductImage,
  deleteProductImage,
  updateProduct,
} from "../../services/productService";
import { groupByCategory } from "../../utils/groupByCategory";
import { isValidName, NAME_ERROR } from "../../utils/validation";
import StatusBadge from "../../components/StatusBadge";
import StateMessage from "../../components/StateMessage";

const EMPTY_FORM = {
  name: "",
  description: "",
  category_id: "",
  status: "disponible",
};

function Productos() {
  const navigate = useNavigate();
  const { data: products, loading: loadingProducts, error: errorProducts, refetch } = useFetch(getProducts, []);
  const { data: categories, loading: loadingCategories } = useFetch(getCategories, []);

  const [form, setForm] = useState(EMPTY_FORM);
  const [newImages, setNewImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});

  function toggleCategory(categoryName) {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  }

  function handleField(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleFileChange(e) {
    setNewImages(Array.from(e.target.files));
  }

  function handleCancel() {
    setForm(EMPTY_FORM);
    setNewImages([]);
    setFormError(null);
    setShowForm(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (!isValidName(form.name)) {
      setFormError(NAME_ERROR);
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const uploadedUrls = await Promise.all(
        newImages.map((file) => uploadProductImage(file))
      );
      await createProduct({ ...form, images: uploadedUrls });
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
          <h2 className="font-semibold">Nuevo producto</h2>

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

          <div className="space-y-2">
            <label className="block text-sm font-medium">Imágenes</label>
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
              {saving ? "Guardando..." : "Crear producto"}
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
        <div className="space-y-3">
          {groupByCategory(products, categories ?? []).map(({ categoryName, items }) => {
            const isExpanded = expandedCategories[categoryName] ?? false;
            return (
              <div key={categoryName} className="border border-brand-gray rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleCategory(categoryName)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                >
                  <span className="font-semibold">{categoryName}</span>
                  <span className="text-sm text-brand-brown-light">
                    {items.length} producto{items.length !== 1 ? "s" : ""}{" "}
                    {isExpanded ? "▲" : "▼"}
                  </span>
                </button>

                {isExpanded && (
                  <ul className="border-t border-brand-gray divide-y divide-brand-gray">
                    {items.map((product) => (
                      <li key={product.id} className="p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-lg bg-brand-gray overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <span className="text-xs text-brand-brown-light">—</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{product.name}</p>
                            <StatusBadge status={product.status} />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/productos/${product.id}/editar`)}
                            className="py-2.5 rounded-xl bg-brand-brown/10 text-brand-brown text-sm font-medium"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(product)}
                            className="py-2.5 rounded-xl bg-brand-gray text-brand-brown-dark text-sm font-medium"
                          >
                            {product.status === "disponible" ? "Sin stock" : "Disponible"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(product)}
                            className="py-2.5 rounded-xl bg-brand-red/10 text-brand-red text-sm font-medium"
                          >
                            Eliminar
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Productos;