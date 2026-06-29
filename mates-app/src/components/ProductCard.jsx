import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";

function ProductCard({ product, categoryName }) {
  return (
    <Link
      to={`/catalogo/${product.id}`}
      className="block bg-brand-white border border-brand-gray rounded-2xl overflow-hidden hover:border-brand-brown-light transition-colors"
    >
      <div className="aspect-square bg-brand-gray">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-4 space-y-2">
        <p className="text-xs text-brand-brown-light">{categoryName}</p>
        <h3 className="font-semibold leading-snug">{product.name}</h3>
        <StatusBadge status={product.status} />
      </div>
    </Link>
  );
}

export default ProductCard;