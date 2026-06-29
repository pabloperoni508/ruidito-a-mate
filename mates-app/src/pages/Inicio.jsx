import { Link } from "react-router-dom";
import { products, categories } from "../lib/mockData";
import ProductCard from "../components/ProductCard";
import CategoryChip from "../components/CategoryChip";

function Inicio() {
  const featuredProducts = products.slice(0, 3);

  return (
    <section className="space-y-10">
      <div className="bg-brand-brown text-brand-white rounded-2xl p-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">Mates Comercio</h1>
        <p className="text-brand-white/80">
          Los mejores mates y accesorios, hechos para vos.
        </p>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              categoryName={
                categories.find((c) => c.id === product.categoryId)?.name
              }
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Categorías</h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Link key={category.id} to={`/catalogo?categoria=${category.id}`}>
              <CategoryChip label={category.name} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Inicio;