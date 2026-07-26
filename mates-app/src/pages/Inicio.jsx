import { Link } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import { getProducts } from "../services/productService";
import { getCategories } from "../services/categoryService";
import ProductCard from "../components/ProductCard";
import CategoryChip from "../components/CategoryChip";
import StateMessage from "../components/StateMessage";

function Inicio() {
  const {
    data: products,
    loading: loadingProducts,
    error: errorProducts,
  } = useFetch(getProducts, []);
  const {
    data: categories,
    loading: loadingCategories,
    error: errorCategories,
  } = useFetch(getCategories, []);

  if (loadingProducts || loadingCategories) {
    return <StateMessage type="loading" message="Cargando..." />;
  }

  if (errorProducts || errorCategories) {
    return (
      <StateMessage
        type="error"
        message="No pudimos cargar la información. Intentá de nuevo más tarde."
      />
    );
  }

  const featuredProducts = products.slice(0, 3);

  return (
    <section className="space-y-10">
      <div className="relative rounded-2xl overflow-hidden h-48">
        <img
          src="/logo.png"
          alt="Ruidito a mate"
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Categorías</h2>
        {categories.length === 0 ? (
          <p className="text-brand-brown-light">
            Todavía no hay categorías cargadas.
          </p>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Link key={category.id} to={`/catalogo?categoria=${category.id}`}>
                <CategoryChip label={category.name} />
              </Link>
            ))}
          </div>
        )}
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Productos destacados</h2>
          <Link
            to="/catalogo"
            className="text-sm text-brand-brown font-medium"
          >
            Ver todo
          </Link>
        </div>
        {featuredProducts.length === 0 ? (
          <StateMessage type="empty" message="Todavía no hay productos cargados." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                categoryName={product.categories?.name}
              />
            ))}
          </div>
        )}
      </div>

      
    </section>
  );
}

export default Inicio;