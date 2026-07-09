import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import { getCategories } from "../../services/categoryService";
import {
  getProductById,
  updateProduct,
  uploadProductImage,
  deleteProductImage,
} from "../../services/productService";
import StateMessage from "../../components/StateMessage";
import { isValidName, NAME_ERROR } from "../../utils/validation";

// Formulario interno: recibe product y categories ya cargados.
// Los useState se inicializan con valores reales desde el primer render,
// eliminando la necesidad de useEffect para sincronizar estado.
function FormularioEdicion({ product, categories }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: product.name,
    description: product.description ?? "",
    category_id: product.category_id ?? "",
    status: product.status,
  });
  const [images, setImages] = useState(product.images ?? []);
  const [newImages, setNewImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  function handleField(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleFileChange(e) {
    setNewImages(Array.from(e.target.files));
  }

  function handleRemoveExistingImage(url) {
    setImages((prev) => prev.filter((img) => img !== url));
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
      const removed = (product.images ?? []).filter((url) => !images.includes(url));
      await Promise.all(removed.map((url) => deleteProductImage(url)));
      const finalImages = [...images, ...uploadedUrls];
      await updateProduct(product.id, { ...form, images: finalImages });
      navigate("/admin/productos");
    } catch {
      setFormError("Ocurrió un error. Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-6">
      <Link to="/admin/productos" className="text-sm text-brand-brown font-medium">
        ← Volver a productos
      </Link>

      <h1 className="text-2xl font-semibold">Editar producto</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
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
            {categories.map((cat) => (
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

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-brand-brown text-brand-white font-semibold py-3 rounded-full disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
          <Link
            to="/admin/productos"
            className="px-6 py-3 rounded-full border border-brand-gray text-brand-brown-dark font-medium text-center"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </section>
  );
}

// Componente contenedor: solo se encarga de cargar los datos.
// Cuando ambos están listos, renderiza el formulario.
function EditarProducto() {
  const { id } = useParams();

  const { data: product, loading: loadingProduct, error: errorProduct } = useFetch(
    () => getProductById(id),
    [id]
  );
  const { data: categories, loading: loadingCategories, error: errorCategories } = useFetch(
    getCategories,
    []
  );

  if (loadingProduct || loadingCategories) {
    return <StateMessage type="loading" message="Cargando producto..." />;
  }

  if (errorProduct || errorCategories || !product) {
    return <StateMessage type="error" message="No se pudo cargar el producto." />;
  }

  return <FormularioEdicion product={product} categories={categories} />;
}

export default EditarProducto;