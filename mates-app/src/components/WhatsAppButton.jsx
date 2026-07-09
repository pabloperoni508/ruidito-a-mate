const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER;

function WhatsAppButton({ productName }) {
  const message = encodeURIComponent(
    `Hola! Quería consultar por: ${productName}`
  );

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 w-full bg-brand-green text-brand-white font-semibold py-3 rounded-lg hover:opacity-90 transition"
    >
      Consultar por WhatsApp
    </a>
  );
}

export default WhatsAppButton;