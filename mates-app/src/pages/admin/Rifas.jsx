import { useState } from "react";
import { useFetch } from "../../hooks/useFetch";
import {
  getRaffles,
  createRaffle,
  updateRaffle,
  deleteRaffle,
  activateRaffle,
  deactivateRaffle,
  uploadRaffleImage,
  getPendingNumbers,
  approveNumber,
  rejectNumber,
  freeNumber,
} from "../../services/raffleService";
import StateMessage from "../../components/StateMessage";

const EMPTY_FORM = {
  title: "",
  description: "",
  draw_date: "",
};

function Reservas({ raffle }) {
  const { data: numbers, loading, error, refetch } = useFetch(
    () => getPendingNumbers(raffle.id),
    [raffle.id]
  );

  async function handleApprove(id) {
    try {
      await approveNumber(id);
      refetch();
    } catch {
      alert("No se pudo aprobar.");
    }
  }

  async function handleReject(id) {
    if (!confirm("¿Rechazar esta reserva?")) return;
    try {
      await rejectNumber(id);
      refetch();
    } catch {
      alert("No se pudo rechazar.");
    }
  }

  async function handleFree(id) {
    if (!confirm("¿Liberar este número?")) return;
    try {
      await freeNumber(id);
      refetch();
    } catch {
      alert("No se pudo liberar.");
    }
  }

  if (loading) return <StateMessage type="loading" message="Cargando reservas..." />;
  if (error) return <StateMessage type="error" message="No se pudieron cargar las reservas." />;
  if (numbers.length === 0) {
    return <p className="text-brand-brown-light text-sm">No hay reservas todavía.</p>;
  }

  const pendientes = numbers.filter((n) => n.status === "pendiente");
  const bloqueados = numbers.filter((n) => n.status === "bloqueado");

  return (
    <div className="space-y-4">
      {pendientes.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-brand-yellow">
            Pendientes ({pendientes.length})
          </h4>
          <ul className="space-y-2">
            {pendientes.map((n) => (
              <li key={n.id} className="flex items-center justify-between border border-brand-gray rounded-xl px-4 py-3">
                <div>
                  <span className="font-semibold text-sm">{String(n.number).padStart(2, "0")}</span>
                  <span className="text-sm text-brand-brown-dark ml-2">{n.full_name}</span>
                  <span className="text-xs text-brand-brown-light ml-2">{n.phone}</span>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => handleApprove(n.id)} className="text-sm text-brand-green font-medium">Aprobar</button>
                  <button type="button" onClick={() => handleReject(n.id)} className="text-sm text-brand-red font-medium">Rechazar</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {bloqueados.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-brand-red">
            Bloqueados ({bloqueados.length})
          </h4>
          <ul className="space-y-2">
            {bloqueados.map((n) => (
              <li key={n.id} className="flex items-center justify-between border border-brand-gray rounded-xl px-4 py-3">
                <div>
                  <span className="font-semibold text-sm">{String(n.number).padStart(2, "0")}</span>
                  <span className="text-sm text-brand-brown-dark ml-2">{n.full_name}</span>
                  <span className="text-xs text-brand-brown-light ml-2">{n.phone}</span>
                </div>
                <button type="button" onClick={() => handleFree(n.id)} className="text-sm text-brand-brown-light font-medium">Liberar</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Rifas() {
  const { data: raffles, loading, error, refetch } = useFetch(getRaffles, []);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  function handleField(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleEdit(raffle) {
    setEditing(raffle);
    setForm({
      title: raffle.title,
      description: raffle.description ?? "",
      draw_date: raffle.draw_date ?? "",
    });
    setNewImage(null);
    setFormError(null);
    setShowForm(true);
  }

  function handleCancel() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setNewImage(null);
    setFormError(null);
    setShowForm(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    setFormError(null);
    try {
      let image_url = editing?.image_url ?? null;
      if (newImage) image_url = await uploadRaffleImage(newImage);
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        draw_date: form.draw_date || null,
        image_url,
      };
      if (editing) {
        await updateRaffle(editing.id, payload);
      } else {
        await createRaffle(payload);
      }
      handleCancel();
      refetch();
    } catch {
      setFormError("Ocurrió un error. Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(raffle) {
    try {
      if (raffle.active) {
        await deactivateRaffle(raffle.id);
      } else {
        await activateRaffle(raffle.id);
      }
      refetch();
    } catch {
      alert("No se pudo cambiar el estado.");
    }
  }

  async function handleDelete(raffle) {
    if (!confirm(`¿Eliminar la rifa "${raffle.title}"?`)) return;
    try {
      await deleteRaffle(raffle.id);
      refetch();
    } catch {
      alert("No se pudo eliminar.");
    }
  }

  if (loading) return <StateMessage type="loading" message="Cargando rifas..." />;
  if (error) return <StateMessage type="error" message="No se pudieron cargar las rifas." />;

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Rifas</h1>
        {!showForm && (
          <button type="button" onClick={() => setShowForm(true)} className="bg-brand-brown text-brand-white text-sm font-semibold px-5 py-2.5 rounded-full">
            + Nueva rifa
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 border border-brand-gray rounded-2xl p-5">
          <h2 className="font-semibold">{editing ? "Editar rifa" : "Nueva rifa"}</h2>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Título</label>
            <input type="text" name="title" value={form.title} onChange={handleField} required className="w-full border border-brand-gray rounded-xl px-4 py-3 focus:outline-none focus:border-brand-brown" />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Descripción</label>
            <textarea name="description" value={form.description} onChange={handleField} rows={3} className="w-full border border-brand-gray rounded-xl px-4 py-3 focus:outline-none focus:border-brand-brown resize-none" />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Fecha del sorteo</label>
            <input type="date" name="draw_date" value={form.draw_date} onChange={handleField} className="w-full border border-brand-gray rounded-xl px-4 py-3 focus:outline-none focus:border-brand-brown" />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">{editing?.image_url ? "Cambiar imagen" : "Imagen"}</label>
            {editing?.image_url && (
              <img src={editing.image_url} alt="Imagen actual" className="w-24 h-24 object-cover rounded-lg" />
            )}
            <input type="file" accept="image/*" onChange={(e) => setNewImage(e.target.files[0] ?? null)} className="w-full text-sm text-brand-brown-light" />
          </div>

          {formError && <p className="text-brand-red text-sm">{formError}</p>}

          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="flex-1 bg-brand-brown text-brand-white font-semibold py-3 rounded-full disabled:opacity-50">
              {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear rifa"}
            </button>
            <button type="button" onClick={handleCancel} className="px-6 py-3 rounded-full border border-brand-gray text-brand-brown-dark font-medium">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {raffles.length === 0 ? (
        <StateMessage type="empty" message="No hay rifas todavía." />
      ) : (
        <ul className="space-y-4">
          {raffles.map((raffle) => (
            <li key={raffle.id} className="border border-brand-gray rounded-2xl overflow-hidden">
              <div className="flex items-center gap-4 px-4 py-3">
                {raffle.image_url && (
                  <img src={raffle.image_url} alt={raffle.title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{raffle.title}</p>
                    {raffle.active && (
                      <span className="text-xs bg-brand-green/10 text-brand-green font-medium px-2 py-0.5 rounded-full">Activa</span>
                    )}
                  </div>
                  {raffle.draw_date && (
                    <p className="text-xs text-brand-brown-light">
                      {new Date(raffle.draw_date).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1 items-end flex-shrink-0">
                  <button type="button" onClick={() => handleEdit(raffle)} className="text-sm text-brand-brown font-medium">Editar</button>
                  <button type="button" onClick={() => handleToggleActive(raffle)} className="text-xs text-brand-brown-light">
                    {raffle.active ? "Desactivar" : "Activar"}
                  </button>
                  <button type="button" onClick={() => setExpandedId(expandedId === raffle.id ? null : raffle.id)} className="text-xs text-brand-brown-light">
                    {expandedId === raffle.id ? "Ocultar reservas" : "Ver reservas"}
                  </button>
                  <button type="button" onClick={() => handleDelete(raffle)} className="text-sm text-brand-red font-medium">Eliminar</button>
                </div>
              </div>

              {expandedId === raffle.id && (
                <div className="border-t border-brand-gray px-4 py-4">
                  <Reservas raffle={raffle} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default Rifas;