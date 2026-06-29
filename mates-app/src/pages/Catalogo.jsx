import { useSearchParams } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import { getProducts } from "../services/productService";
import { getCategories } from "../services/categoryService";
import ProductCard from "../components/ProductCard";
import CategoryChip from "../components/CategoryChip";
import StateMessage from "../components/StateMessage";

function Catalogo() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("categoria");

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

  function handleSelectCategory(categoryId) {
    if (categoryId === activeCategory) {
      setSearchParams({});
    } else {
      setSearchParams({ categoria: categoryId });
    }
  }

  if (loadingProducts || loadingCategories) {
    return <StateMessage type="loading" message="Cargando catálogo..." />;
  }

  if (errorProducts || errorCategories) {
    return (
      <StateMessage
        type="error"
        message="No pudimos cargar el catálogo. Intentá de nuevo más tarde."
      />
    );
  }

  const filteredProducts = activeCategory
    ? products.filter((product) => product.category_id === activeCategory)
    : products;

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
        <StateMessage
          type="empty"
          message="No hay productos en esta categoría todavía."
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              categoryName={product.categories?.name}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default Catalogo;