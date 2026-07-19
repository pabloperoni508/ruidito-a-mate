import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import { getCategories } from "../../services/categoryService";
import { getSubcategories } from "../../services/subcategoryService";
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
  subcategory_id: "",
  status: "disponible",
};

function ColorForm({ onAdd }) {
  const [colorName, setColorName] = useState("");

  function handleAdd() {
    if (!colorName.trim()) return;
    onAdd({ name: colorName.trim(), images: [] });
    setColorName("");
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={colorName}
        onChange={(e) => setColorName(e.target.value)}
        placeholder="Nombre del color (ej: Rojo)"
        className="flex-1 border border-brand-gray rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-brown"
      />
      <button
        type="button"
        onClick={handleAdd}
        className="bg-brand-brown text-brand-white text-sm font-medium px-4 py-2.5 rounded-xl"
      >
        Agregar
      </button>
    </div>
  );
}

function Productos() {
  const navigate = useNavigate();
  const { data: products, loading: loadingProducts, error: errorProducts, refetch } = useFetch(getProducts, []);
  const { data: categories, loading: loadingCategories } = useFetch(getCategories, []);
  const { data: allSubcategories } = useFetch(getSubcategories, []);

  const [form, setForm] = useState(EMPTY_FORM);
  const [pendingImages, setPendingImages] = useState([]);
  const [imageInput, setImageInput] = useState(null);
  const [colors, setColors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showColorForm, setShowColorForm] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});

  const filteredSubcategories = (allSubcategories ?? []).filter(
    (s) => s.category_id === form.category_id
  );

  function toggleCategory(categoryName) {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  }

  function handleField(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "category_id" ? { subcategory_id: "" } : {}),
    }));
  }

  function handleRemoveColor(index) {
    setColors((prev) => prev.filter((_, i) => i !== index));
  }

  function handleCancel() {
    setForm(EMPTY_FORM);
    setPendingImages([]);
    setImageInput(null);
    setColors([]);
    setFormError(null);
    setShowForm(false);
    setShowColorForm(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (!isValidName(form.name)) { setFormError(NAME_ERROR); return; }
    setSaving(true);
    setFormError(null);
    try {
      const uploadedUrls = await Promise.all(
        pendingImages.map((file) => uploadProductImage(file))
      );
      await createProduct({
        ...form,
        subcategory_id: form.subcategory_id || null,
        images: uploadedUrls,
        colors,
      });
      handleCancel();
      refetch();
    } catch (err) {
      console.error("Error al crear producto:", err);
      setFormError("Ocurrió un error. Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(product) {
    const newStatus = product.status === "disponible" ? "sin_stock" : "disponible";
    try { await updateProduct(product.id, { status: newStatus }); refetch(); }
    catch { alert("No se pudo cambiar el estado."); }
  }

  async function handleDelete(product) {
    if (!confirm(`¿Eliminar "${product.name}"?`)) return;
    try {
      await Promise.all((product.images ?? []).map((url) => deleteProductImage(url)));
      for (const color of (product.colors ?? [])) {
        await Promise.all((color.images ?? []).map((url) => deleteProductImage(url)));
      }
      await deleteProduct(product.id);
      refetch();
    } catch { alert("No se pudo eliminar el producto."); }
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
          <button type="button" onClick={() => setShowForm(true)}
            className="bg-brand-brown text-brand-white text-sm font-semibold px-5 py-2.5 rounded-full">
            + Agregar
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 border border-brand-gray rounded-2xl p-5">
          <h2 className="font-semibold">Nuevo producto</h2>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Nombre</label>
            <input type="text" name="name" value={form.name} onChange={handleField} required
              className="w-full border border-brand-gray rounded-xl px-4 py-3 focus:outline-none focus:border-brand-brown" />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Descripción</label>
            <textarea name="description" value={form.description} onChange={handleField} rows={3}
              className="w-full border border-brand-gray rounded-xl px-4 py-3 focus:outline-none focus:border-brand-brown resize-none" />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Categoría</label>
            <select name="category_id" value={form.category_id} onChange={handleField}
              className="w-full border border-brand-gray rounded-xl px-4 py-3 focus:outline-none focus:border-brand-brown bg-brand-white">
              <option value="">Sin categoría</option>
              {(categories ?? []).map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {form.category_id && filteredSubcategories.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">Subcategoría</label>
              <select name="subcategory_id" value={form.subcategory_id} onChange={handleField}
                className="w-full border border-brand-gray rounded-xl px-4 py-3 focus:outline-none focus:border-brand-brown bg-brand-white">
                <option value="">Sin subcategoría</option>
                {filteredSubcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium">Estado</label>
            <select name="status" value={form.status} onChange={handleField}
              className="w-full border border-brand-gray rounded-xl px-4 py-3 focus:outline-none focus:border-brand-brown bg-brand-white">
              <option value="disponible">Disponible</option>
              <option value="sin_stock">Sin stock</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Imágenes</label>

            {pendingImages.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {pendingImages.map((file, i) => (
                  <div key={i} className="relative w-20 h-20">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`foto ${i + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setPendingImages((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-brand-red text-brand-white rounded-full text-xs flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageInput(e.target.files[0] ?? null)}
                className="flex-1 text-sm text-brand-brown-light"
              />
              <button
                type="button"
                onClick={() => {
                  if (imageInput) {
                    setPendingImages((prev) => [...prev, imageInput]);
                    setImageInput(null);
                  }
                }}
                className="bg-brand-brown text-brand-white text-sm font-medium px-4 py-2 rounded-xl"
              >
                + Foto
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">Colores disponibles</label>
              <button type="button" onClick={() => setShowColorForm((v) => !v)}
                className="text-sm text-brand-brown font-medium">
                {showColorForm ? "Cancelar" : "+ Agregar color"}
              </button>
            </div>

            {colors.length > 0 && (
              <ul className="space-y-2">
                {colors.map((color, i) => (
                  <li key={i} className="flex items-center justify-between bg-brand-gray/50 rounded-xl px-3 py-2">
                    <div>
                      <span className="text-sm font-medium">{color.name}</span>
                      <span className="text-xs text-brand-brown-light ml-2">
                        {color.images.length} foto{color.images.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <button type="button" onClick={() => handleRemoveColor(i)}
                      className="text-sm text-brand-red font-medium">Quitar</button>
                  </li>
                ))}
              </ul>
            )}

            {showColorForm && (
              <ColorForm onAdd={(color) => {
                setColors((prev) => [...prev, color]);
                setShowColorForm(false);
              }} />
            )}
          </div>

          {formError && <p className="text-brand-red text-sm">{formError}</p>}

          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="flex-1 bg-brand-brown text-brand-white font-semibold py-3 rounded-full disabled:opacity-50">
              {saving ? "Guardando..." : "Crear producto"}
            </button>
            <button type="button" onClick={handleCancel}
              className="px-6 py-3 rounded-full border border-brand-gray text-brand-brown-dark font-medium">
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
                <button type="button" onClick={() => toggleCategory(categoryName)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left">
                  <span className="font-semibold">{categoryName}</span>
                  <span className="text-sm text-brand-brown-light">
                    {items.length} producto{items.length !== 1 ? "s" : ""} {isExpanded ? "▲" : "▼"}
                  </span>
                </button>

                {isExpanded && (
                  <ul className="border-t border-brand-gray divide-y divide-brand-gray">
                    {items.map((product) => (
                      <li key={product.id} className="p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-lg bg-brand-gray overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt={product.name}
                                className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <span className="text-xs text-brand-brown-light">—</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{product.name}</p>
                            {product.subcategories?.name && (
                              <p className="text-xs text-brand-brown-light">{product.subcategories.name}</p>
                            )}
                            <StatusBadge status={product.status} />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <button type="button"
                            onClick={() => navigate(`/admin/productos/${product.id}/editar`)}
                            className="py-2.5 rounded-xl bg-brand-brown/10 text-brand-brown text-sm font-medium">
                            Editar
                          </button>
                          <button type="button" onClick={() => handleToggleStatus(product)}
                            className="py-2.5 rounded-xl bg-brand-gray text-brand-brown-dark text-sm font-medium">
                            {product.status === "disponible" ? "Sin stock" : "Disponible"}
                          </button>
                          <button type="button" onClick={() => handleDelete(product)}
                            className="py-2.5 rounded-xl bg-brand-red/10 text-brand-red text-sm font-medium">
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