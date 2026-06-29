function CategoryChip({ label, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
        active
          ? "bg-brand-brown text-brand-white"
          : "bg-brand-gray text-brand-brown-dark hover:bg-brand-brown-light/30"
      }`}
    >
      {label}
    </button>
  );
}

export default CategoryChip;