import { useState } from "react";
import { useFetch } from "../../hooks/useFetch";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/categoryService";
import {
  getSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from "../../services/subcategoryService";
import StateMessage from "../../components/StateMessage";
import { isValidName, NAME_ERROR } from "../../utils/validation";

function SubcategorySection({ category, allSubcategories, onRefetch }) {
  const subcategories = (allSubcategories ?? []).filter(
    (s) => s.category_id === category.id
  );
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    if (!isValidName(name)) { setError(NAME_ERROR); return; }
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await updateSubcategory(editing.id, name.trim());
      } else {
        await createSubcategory(name.trim(), category.id);
      }
      setName("");
      setEditing(null);
      onRefetch();
    } catch {
      setError("Ocurrió un error. Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("¿Eliminar esta subcategoría?")) return;
    try { await deleteSubcategory(id); onRefetch(); }
    catch { alert("No se pudo eliminar."); }
  }

  function handleEdit(sub) {
    setEditing(sub);
    setName(sub.name);
    setError(null);
  }

  function handleCancel() {
    setEditing(null);
    setName("");
    setError(null);
  }

  return (
    <div className="mt-3 pt-3 border-t border-brand-gray space-y-3">
      <p className="text-xs font-semibold text-brand-brown-light uppercase tracking-wide">
        Subcategorías
      </p>

      {subcategories.length > 0 && (
        <ul className="space-y-1">
          {subcategories.map((sub) => (
            <li key={sub.id} className="flex items-center justify-between bg-brand-gray/50 rounded-lg px-3 py-2">
              <span className="text-sm">{sub.name}</span>
              <div className="flex gap-3">
                <button type="button" onClick={() => handleEdit(sub)}
                  className="text-xs text-brand-brown font-medium">Editar</button>
                <button type="button" onClick={() => handleDelete(sub.id)}
                  className="text-xs text-brand-red font-medium">Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nueva subcategoría"
          required
          className="flex-1 border border-brand-gray rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-brown"
        />
        <button type="submit" disabled={saving}
          className="bg-brand-brown text-brand-white text-sm font-medium px-4 py-2 rounded-xl disabled:opacity-50">
          {saving ? "..." : editing ? "Guardar" : "Agregar"}
        </button>
        {editing && (
          <button type="button" onClick={handleCancel}
            className="text-sm text-brand-brown-light px-3 py-2 rounded-xl border border-brand-gray">
            Cancelar
          </button>
        )}
      </form>
      {error && <p className="text-brand-red text-xs">{error}</p>}
    </div>
  );
}

function Categorias() {
  const { data: categories, loading, error, refetch: refetchCategories } = useFetch(getCategories, []);
  const { data: subcategories, refetch: refetchSubcategories } = useFetch(getSubcategories, []);

  const [name, setName] = useState("");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  function refetchAll() {
    refetchCategories();
    refetchSubcategories();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    if (!isValidName(name)) { setFormError(NAME_ERROR); return; }
    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        await updateCategory(editing.id, name.trim());
      } else {
        await createCategory(name.trim());
      }
      setName("");
      setEditing(null);
      refetchCategories();
    } catch {
      setFormError("Ocurrió un error. Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(category) {
    setEditing(category);
    setName(category.name);
    setFormError(null);
  }

  function handleCancel() {
    setEditing(null);
    setName("");
    setFormError(null);
  }

  async function handleDelete(id) {
    if (!confirm("¿Eliminar esta categoría?")) return;
    try { await deleteCategory(id); refetchAll(); }
    catch { alert("No se pudo eliminar. Es posible que tenga productos asociados."); }
  }

  if (loading) return <StateMessage type="loading" message="Cargando categorías..." />;
  if (error) return <StateMessage type="error" message="No se pudieron cargar las categorías." />;

  return (
    <section className="space-y-8">
      <h1 className="text-2xl font-semibold">Categorías</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de la categoría"
          required
          className="w-full border border-brand-gray rounded-xl px-4 py-3 text-brand-brown-dark focus:outline-none focus:border-brand-brown"
        />
        {formError && <p className="text-brand-red text-sm">{formError}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={saving}
            className="flex-1 bg-brand-brown text-brand-white font-semibold py-3 rounded-full disabled:opacity-50">
            {saving ? "Guardando..." : editing ? "Guardar cambios" : "Agregar categoría"}
          </button>
          {editing && (
            <button type="button" onClick={handleCancel}
              className="px-6 py-3 rounded-full border border-brand-gray text-brand-brown-dark font-medium">
              Cancelar
            </button>
          )}
        </div>
      </form>

      {categories.length === 0 ? (
        <StateMessage type="empty" message="No hay categorías todavía." />
      ) : (
        <ul className="space-y-3">
          {categories.map((category) => (
            <li key={category.id} className="border border-brand-gray rounded-2xl px-4 py-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{category.name}</span>
                <div className="flex gap-3">
                  <button type="button" onClick={() => handleEdit(category)}
                    className="text-sm text-brand-brown font-medium">Editar</button>
                  <button type="button" onClick={() => handleDelete(category.id)}
                    className="text-sm text-brand-red font-medium">Eliminar</button>
                </div>
              </div>
              <SubcategorySection
                category={category}
                allSubcategories={subcategories}
                onRefetch={refetchAll}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default Categorias;