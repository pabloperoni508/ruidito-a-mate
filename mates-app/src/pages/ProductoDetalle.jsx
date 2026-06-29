import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductById, getCategoryById } from "../lib/mockData";
import StatusBadge from "../components/StatusBadge";
import WhatsAppButton from "../components/WhatsAppButton";

function ProductoDetalle() {
  const { id } = useParams();
  const product = getProductById(id);
  const [activeImage, setActiveImage] = useState(0);

  if (!product) {
    return (
      <section className="space-y-4 text-center py-12">
        <h1 className="text-xl font-semibold">Producto no encontrado</h1>
        <Link to="/catalogo" className="text-brand-brown font-medium">
          Volver al catálogo
        </Link>
      </section>
    );
  }

  const category = getCategoryById(product.categoryId);

  return (
    <section className="space-y-6">
      <Link to="/catalogo" className="text-sm text-brand-brown font-medium">
        ← Volver al catálogo
      </Link>

      <div className="aspect-square bg-brand-gray rounded-2xl overflow-hidden">
        <img
          src={product.images[activeImage]}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {product.images.length > 1 && (
        <div className="flex gap-2">
          {product.images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveImage(index)}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                index === activeImage
                  ? "border-brand-brown"
                  : "border-transparent"
              }`}
            >
              <img
                src={image}
                alt={`${product.name} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <p className="text-sm text-brand-brown-light">{category?.name}</p>
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <StatusBadge status={product.status} />
        <p className="text-brand-brown-dark leading-relaxed">
          {product.description}
        </p>
      </div>

      <WhatsAppButton productName={product.name} />
    </section>
  );
}

export default ProductoDetalle;