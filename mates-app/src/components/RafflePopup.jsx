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
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {activeRaffle.image_url ? (
          <div className="relative">
            <img
              src={activeRaffle.image_url}
              alt={activeRaffle.title}
              className="w-full object-cover"
              loading="lazy"
            />
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-3 right-3 w-8 h-8 bg-black/50 text-white rounded-full text-lg flex items-center justify-center"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="bg-brand-white p-6 space-y-1">
            <button type="button" onClick={handleClose}
              className="absolute top-3 right-3 w-8 h-8 bg-brand-gray rounded-full text-lg flex items-center justify-center">
              ×
            </button>
            <h2 className="text-lg font-semibold">{activeRaffle.title}</h2>
            {activeRaffle.description && (
              <p className="text-sm text-brand-brown-dark">{activeRaffle.description}</p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={handleVerRifa}
          className="w-full bg-brand-brown text-brand-white font-semibold py-4 text-base"
        >
          Ver rifa
        </button>
      </div>
    </div>
  );
}

export default RafflePopup;