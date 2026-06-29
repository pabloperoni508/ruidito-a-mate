import { useSearchParams } from "react-router-dom";
import { products, categories } from "../lib/mockData";
import ProductCard from "../components/ProductCard";
import CategoryChip from "../components/CategoryChip";

function Catalogo() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("categoria");

  const filteredProducts = activeCategory
    ? products.filter((product) => product.categoryId === activeCategory)
    : products;

  function handleSelectCategory(categoryId) {
    if (categoryId === activeCategory) {
      setSearchParams({});
    } else {
      setSearchParams({ categoria: categoryId });
    }
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Catálogo</h1>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <CategoryChip
          label="Todos"
          active={!activeCategory}
          onClick={() => setSearchParams({})}
        />
        {categories.map((category) => (
          <CategoryChip
            key={category.id}
            label={category.name}
            active={activeCategory === category.id}
            onClick={() => handleSelectCategory(category.id)}
          />
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <p className="text-brand-brown-light">
          No hay productos en esta categoría todavía.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              categoryName={
                categories.find((c) => c.id === product.categoryId)?.name
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default Catalogo;