import { useState } from "react";
import { useFetch } from "../../hooks/useFetch";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/categoryService";
import StateMessage from "../../components/StateMessage";
import { isValidName, NAME_ERROR } from "../../utils/validation";

function Categorias() {
  const { data: categories, loading, error, refetch } = useFetch(getCategories, []);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    if (!isValidName(name)) {
      setFormError(NAME_ERROR);
      return;
    }
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
      refetch();
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
    try {
      await deleteCategory(id);
      refetch();
    } catch {
      alert("No se pudo eliminar. Es posible que tenga productos asociados.");
    }
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
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-brand-brown text-brand-white font-semibold py-3 rounded-full disabled:opacity-50"
          >
            {saving ? "Guardando..." : editing ? "Guardar cambios" : "Agregar categoría"}
          </button>
          {editing && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 rounded-full border border-brand-gray text-brand-brown-dark font-medium"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {categories.length === 0 ? (
        <StateMessage type="empty" message="No hay categorías todavía." />
      ) : (
        <ul className="space-y-2">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex items-center justify-between border border-brand-gray rounded-xl px-4 py-3"
            >
              <span className="font-medium">{category.name}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(category)}
                  className="text-sm text-brand-brown font-medium"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(category.id)}
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

export default Categorias;