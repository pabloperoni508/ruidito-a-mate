import { useState } from "react";
import { useFetch } from "../../hooks/useFetch";
import {
  getRaffles,
  createRaffle,
  deleteRaffle,
  activateRaffle,
  deactivateRaffle,
  updateRaffle,
  uploadRaffleImage,
  getPendingNumbers,
  approveNumber,
  rejectNumber,
  freeNumber,
} from "../../services/raffleService";
import StateMessage from "../../components/StateMessage";

function Reservas({ raffle }) {
  const { data: numbers, loading, error, refetch } = useFetch(
    () => getPendingNumbers(raffle.id),
    [raffle.id]
  );

  async function handleApprove(id) {
    try { await approveNumber(id); refetch(); }
    catch { alert("No se pudo aprobar."); }
  }

  async function handleReject(id) {
    if (!confirm("¿Rechazar esta reserva?")) return;
    try { await rejectNumber(id); refetch(); }
    catch { alert("No se pudo rechazar."); }
  }

  async function handleFree(id) {
    if (!confirm("¿Liberar este número?")) return;
    try { await freeNumber(id); refetch(); }
    catch { alert("No se pudo liberar."); }
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
          <h4 className="text-sm font-semibold text-brand-yellow">Pendientes ({pendientes.length})</h4>
          <ul className="space-y-2">
            {pendientes.map((n) => (
              <li key={n.id} className="border border-brand-gray rounded-xl px-4 py-3 space-y-2">
                <div>
                  <span className="font-semibold text-sm">{String(n.number).padStart(2, "0")}</span>
                  <span className="text-sm text-brand-brown-dark ml-2">{n.full_name}</span>
                  <span className="text-xs text-brand-brown-light ml-2">{n.phone}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => handleApprove(n.id)}
                    className="py-2 rounded-xl bg-brand-green/10 text-brand-green text-sm font-medium">
                    Aprobar
                  </button>
                  <button type="button" onClick={() => handleReject(n.id)}
                    className="py-2 rounded-xl bg-brand-red/10 text-brand-red text-sm font-medium">
                    Rechazar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {bloqueados.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-brand-red">Confirmados ({bloqueados.length})</h4>
          <ul className="space-y-2">
            {bloqueados.map((n) => (
              <li key={n.id} className="border border-brand-gray rounded-xl px-4 py-3 space-y-2">
                <div>
                  <span className="font-semibold text-sm">{String(n.number).padStart(2, "0")}</span>
                  <span className="text-sm text-brand-brown-dark ml-2">{n.full_name}</span>
                  <span className="text-xs text-brand-brown-light ml-2">{n.phone}</span>
                </div>
                <button type="button" onClick={() => handleFree(n.id)}
                  className="w-full py-2 rounded-xl bg-brand-gray text-brand-brown-dark text-sm font-medium">
                  Liberar
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function RaffleCard({ raffle, onRefetch }) {
  const [form, setForm] = useState({
    title: raffle.title,
    description: raffle.description ?? "",
    draw_date: raffle.draw_date ?? "",
  });
  const [newImage, setNewImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function handleField(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      let image_url = raffle.image_url ?? null;
      if (newImage) image_url = await uploadRaffleImage(newImage);
      await updateRaffle(raffle.id, {
        title: form.title.trim(),
        description: form.description.trim() || null,
        draw_date: form.draw_date || null,
        image_url,
      });
      setNewImage(null);
      onRefetch();
    } catch {
      setError("Ocurrió un error. Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive() {
    try {
      if (raffle.active) { await deactivateRaffle(raffle.id); }
      else { await activateRaffle(raffle.id); }
      onRefetch();
    } catch {
      alert("No se pudo cambiar el estado.");
    }
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar la rifa "${raffle.title}"?`)) return;
    try { await deleteRaffle(raffle.id); onRefetch(); }
    catch { alert("No se pudo eliminar."); }
  }

  return (
    <li className="border border-brand-gray rounded-2xl overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between bg-brand-gray/30">
        <span className="font-semibold text-sm">
          {raffle.active ? "🟢 Activa" : "⏸ Pausada"}
        </span>
        <button type="button" onClick={handleDelete} className="text-sm text-brand-red font-medium">
          Eliminar
        </button>
      </div>

      <form onSubmit={handleSave} className="px-4 py-4 space-y-3 border-b border-brand-gray">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-brand-brown-light">Título</label>
          <input type="text" name="title" value={form.title} onChange={handleField} required
            className="w-full border border-brand-gray rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-brown" />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-brand-brown-light">Descripción</label>
          <textarea name="description" value={form.description} onChange={handleField} rows={2}
            className="w-full border border-brand-gray rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-brown resize-none" />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-brand-brown-light">Fecha del sorteo</label>
          <input type="date" name="draw_date" value={form.draw_date} onChange={handleField}
            className="w-full border border-brand-gray rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-brown" />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-brand-brown-light">
            {raffle.image_url ? "Cambiar imagen" : "Imagen"}
          </label>
          {raffle.image_url && (
            <img src={raffle.image_url} alt={raffle.title}
              className="w-20 h-20 object-cover rounded-lg" loading="lazy" />
          )}
          <input type="file" accept="image/*"
            onChange={(e) => setNewImage(e.target.files[0] ?? null)}
            className="w-full text-sm text-brand-brown-light" />
        </div>

        {error && <p className="text-brand-red text-sm">{error}</p>}

        <div className="grid grid-cols-2 gap-2">
          <button type="submit" disabled={saving}
            className="py-2.5 rounded-xl bg-brand-brown text-brand-white text-sm font-semibold disabled:opacity-50">
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
          <button type="button" onClick={handleToggleActive}
            className="py-2.5 rounded-xl bg-brand-gray text-brand-brown-dark text-sm font-medium">
            {raffle.active ? "Pausar" : "Despausar"}
          </button>
        </div>
      </form>

      <div className="px-4 py-4">
        <h3 className="text-sm font-semibold mb-3">Reservas</h3>
        <Reservas raffle={raffle} />
      </div>
    </li>
  );
}

function Rifas() {
  const { data: raffles, loading, error, refetch } = useFetch(getRaffles, []);
  const [form, setForm] = useState({ title: "", description: "", draw_date: "" });
  const [newImage, setNewImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  function handleField(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleCancel() {
    setForm({ title: "", description: "", draw_date: "" });
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
      let image_url = null;
      if (newImage) image_url = await uploadRaffleImage(newImage);
      await createRaffle({
        title: form.title.trim(),
        description: form.description.trim() || null,
        draw_date: form.draw_date || null,
        image_url,
      });
      handleCancel();
      refetch();
    } catch {
      setFormError("Ocurrió un error. Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <StateMessage type="loading" message="Cargando rifas..." />;
  if (error) return <StateMessage type="error" message="No se pudieron cargar las rifas." />;

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Rifas</h1>
        {!showForm && (
          <button type="button" onClick={() => setShowForm(true)}
            className="bg-brand-brown text-brand-white text-sm font-semibold px-5 py-2.5 rounded-full">
            + Nueva rifa
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 border border-brand-gray rounded-2xl p-5">
          <h2 className="font-semibold">Nueva rifa</h2>

          <div className="space-y-1">
            <label className="block text-sm font-medium">Título</label>
            <input type="text" name="title" value={form.title} onChange={handleField} required
              className="w-full border border-brand-gray rounded-xl px-4 py-3 focus:outline-none focus:border-brand-brown" />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">Descripción</label>
            <textarea name="description" value={form.description} onChange={handleField} rows={3}
              className="w-full border border-brand-gray rounded-xl px-4 py-3 focus:outline-none focus:border-brand-brown resize-none" />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">Fecha del sorteo</label>
            <input type="date" name="draw_date" value={form.draw_date} onChange={handleField}
              className="w-full border border-brand-gray rounded-xl px-4 py-3 focus:outline-none focus:border-brand-brown" />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">Imagen</label>
            <input type="file" accept="image/*" onChange={(e) => setNewImage(e.target.files[0] ?? null)}
              className="w-full text-sm text-brand-brown-light" />
          </div>

          {formError && <p className="text-brand-red text-sm">{formError}</p>}

          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="flex-1 bg-brand-brown text-brand-white font-semibold py-3 rounded-full disabled:opacity-50">
              {saving ? "Guardando..." : "Crear rifa"}
            </button>
            <button type="button" onClick={handleCancel}
              className="px-6 py-3 rounded-full border border-brand-gray text-brand-brown-dark font-medium">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {raffles.length === 0 ? (
        <StateMessage type="empty" message="No hay rifas todavía." />
      ) : (
        <ul className="space-y-6">
          {raffles.map((raffle) => (
            <RaffleCard key={raffle.id} raffle={raffle} onRefetch={refetch} />
          ))}
        </ul>
      )}
    </section>
  );
}

export default Rifas;