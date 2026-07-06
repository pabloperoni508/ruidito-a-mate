import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useActiveRaffle } from "../hooks/useActiveRaffle";

const POPUP_KEY = "raffle_popup_shown";

function RafflePopup() {
  const { activeRaffle, loading } = useActiveRaffle();
  const navigate = useNavigate();

  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(POPUP_KEY) === "1"
  );

  function handleClose() {
    sessionStorage.setItem(POPUP_KEY, "1");
    setDismissed(true);
  }

  function handleVerRifa() {
    handleClose();
    navigate("/rifas");
  }

  if (loading || !activeRaffle || dismissed) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-brand-white rounded-2xl w-full max-w-sm overflow-hidden">
        {activeRaffle.image_url && (
          <div className="aspect-video bg-brand-gray">
            <img
              src={activeRaffle.image_url}
              alt={activeRaffle.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">{activeRaffle.title}</h2>
            {activeRaffle.description && (
              <p className="text-sm text-brand-brown-dark">{activeRaffle.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleVerRifa}
              className="flex-1 bg-brand-brown text-brand-white font-semibold py-3 rounded-full"
            >
              Ver rifa
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-3 rounded-full border border-brand-gray text-brand-brown-dark font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RafflePopup;