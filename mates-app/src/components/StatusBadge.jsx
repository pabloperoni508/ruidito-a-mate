const statusConfig = {
  disponible: {
    label: "Disponible",
    classes: "bg-brand-green/10 text-brand-green",
  },
  sin_stock: {
    label: "Sin stock",
    classes: "bg-brand-red/10 text-brand-red",
  },
};

function StatusBadge({ status }) {
  const config = statusConfig[status] ?? statusConfig.sin_stock;

  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${config.classes}`}
    >
      {config.label}
    </span>
  );
}

export default StatusBadge;