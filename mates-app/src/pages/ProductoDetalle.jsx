import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import { getProductById } from "../services/productService";
import StatusBadge from "../components/StatusBadge";
import WhatsAppButton from "../components/WhatsAppButton";
import StateMessage from "../components/StateMessage";

function ProductoDetalle() {
  const { id } = useParams();
  const { data: product, loading, error } = useFetch(() => getProductById(id), [id]);
  const [activeImage, setActiveImage] = useState(0);
  const [activeColor, setActiveColor] = useState(null);

  if (loading) return <StateMessage type="loading" message="Cargando producto..." />;

  if (error || !product) {
    return (
      <section className="space-y-4 text-center py-12">
        <h1 className="text-xl font-semibold">Producto no encontrado</h1>
        <Link to="/catalogo" className="text-brand-brown font-medium">
          Volver al catálogo
        </Link>
      </section>
    );
  }

  const colors = product.colors ?? [];
  const currentImages = activeColor !== null
    ? (colors[activeColor]?.images ?? [])
    : (product.images ?? []);
  const hasImages = currentImages.length > 0;

  function handleSelectColor(index) {
    setActiveColor(index === activeColor ? null : index);
    setActiveImage(0);
  }

  return (
    <section className="space-y-6">
      <Link to="/catalogo" className="text-sm text-brand-brown font-medium">
        ← Volver al catálogo
      </Link>

      <div className="aspect-square bg-brand-gray rounded-2xl overflow-hidden flex items-center justify-center">
        {hasImages ? (
          <img src={currentImages[activeImage]} alt={product.name}
            className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <span className="text-sm text-brand-brown-light">Sin imagen</span>
        )}
      </div>

      {hasImages && currentImages.length > 1 && (
        <div className="flex gap-2">
          {currentImages.map((image, index) => (
            <button key={image} type="button" onClick={() => setActiveImage(index)}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                index === activeImage ? "border-brand-brown" : "border-transparent"
              }`}>
              <img src={image} alt={`${product.name} ${index + 1}`}
                className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <p className="text-sm text-brand-brown-light">{product.categories?.name}</p>
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <StatusBadge status={product.status} />
        <p className="text-brand-brown-dark leading-relaxed">{product.description}</p>

        {colors.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Colores disponibles</p>
            <div className="flex gap-2 flex-wrap">
              {colors.map((color, index) => (
                <button key={index} type="button" onClick={() => handleSelectColor(index)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    activeColor === index
                      ? "bg-brand-brown text-brand-white border-brand-brown"
                      : "bg-brand-white text-brand-brown-dark border-brand-gray hover:border-brand-brown"
                  }`}>
                  {color.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <WhatsAppButton productName={product.name} />
    </section>
  );
}

export default ProductoDetalle;