import { useState } from "react";
import { useFetch } from "../hooks/useFetch";
import { getActiveRaffle, getRaffleNumbers, reserveNumber } from "../services/raffleService";
import StateMessage from "../components/StateMessage";

const statusColors = {
  libre: "bg-brand-gray text-brand-brown-dark hover:bg-brand-brown-light/30 cursor-pointer",
  pendiente: "bg-brand-yellow/80 text-brand-brown-dark cursor-not-allowed",
  bloqueado: "bg-brand-red text-brand-white cursor-not-allowed",
};

function ReservaModal({ number, raffleId, onClose, onSuccess }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await reserveNumber({ raffleId, number, fullName: fullName.trim(), phone: phone.trim() });
      onSuccess();
    } catch (err) {
      if (err.message === "numero_tomado") {
        setError("Este número ya fue reservado por otra persona. Elegí otro.");
      } else {
        setError("Error de conexión. Verificá tu señal e intentá de nuevo.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (  
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-brand-white rounded-2xl w-full max-w-sm p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Reservar número {String(number).padStart(2, "0")}
          </h2>
          <button type="button" onClick={onClose} className="text-brand-brown-light text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Nombre completo</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full border border-brand-gray rounded-xl px-4 py-3 focus:outline-none focus:border-brand-brown"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Celular</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full border border-brand-gray rounded-xl px-4 py-3 focus:outline-none focus:border-brand-brown"
            />
          </div>

          {error && <p className="text-brand-red text-sm">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-brand-brown text-brand-white font-semibold py-3 rounded-full disabled:opacity-50"
          >
            {saving ? "Reservando..." : "Confirmar reserva"}
          </button>
        </form>
      </div>
    </div>
  );
}

function GrillaRifa({ raffle }) {
  const { data: numbers, loading, error, refetch } = useFetch(
    () => getRaffleNumbers(raffle.id),
    [raffle.id]
  );
  const [selectedNumber, setSelectedNumber] = useState(null);

  function handleNumberClick(num) {
    if (num.status !== "libre") return;
    setSelectedNumber(num);
  }

  function handleReservaSuccess() {
    setSelectedNumber(null);
    refetch();
  }

  if (loading) return <StateMessage type="loading" message="Cargando números..." />;
  if (error) return <StateMessage type="error" message="No se pudieron cargar los números." />;

  return (
    <>
      <div className="grid grid-cols-10 gap-1.5">
        {numbers.map((num) => (
          <button
            key={num.number}
            type="button"
            onClick={() => handleNumberClick(num)}
            disabled={num.status !== "libre"}
            className={`aspect-square rounded-lg text-xs font-semibold flex items-center justify-center transition-colors ${statusColors[num.status]}`}
          >
            {String(num.number).padStart(2, "0")}
          </button>
        ))}
      </div>

      <div className="flex gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-brand-gray inline-block" /> Libre
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-brand-yellow/80 inline-block" /> Pendiente
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-brand-red inline-block" /> Bloqueado
        </span>
      </div>

      {selectedNumber && (
        <ReservaModal
          number={selectedNumber.number}
          raffleId={raffle.id}
          onClose={() => setSelectedNumber(null)}
          onSuccess={handleReservaSuccess}
        />
      )}
    </>
  );
}

function Rifas() {
  const { data: raffle, loading, error } = useFetch(getActiveRaffle, []);

  if (loading) return <StateMessage type="loading" message="Cargando..." />;
  if (error) return <StateMessage type="error" message="No se pudo cargar la información." />;

  if (!raffle) {
    return (
      <section className="space-y-4 text-center py-16">
        <h1 className="text-2xl font-semibold">Rifas</h1>
        <p className="text-brand-brown-light">
          Actualmente no hay sorteos disponibles.
        </p>
        <p className="text-sm text-brand-brown-light">
          Seguinos para enterarte cuando haya una nueva rifa.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Rifa activa</h1>

      {raffle.image_url && (
        <div className="relative rounded-2xl overflow-hidden">
          <img
            src={raffle.image_url}
            alt={raffle.title}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">{raffle.title}</h2>
        {raffle.description && (
          <p className="text-brand-brown-dark leading-relaxed">{raffle.description}</p>
        )}
        {raffle.draw_date && (
          <p className="text-sm text-brand-brown-light">
            Fecha del sorteo:{" "}
            {new Date(raffle.draw_date).toLocaleDateString("es-AR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      <GrillaRifa raffle={raffle} />
    </section>
  );
}

export default Rifas;