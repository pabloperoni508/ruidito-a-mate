// Agrupa un array de productos por categoría.
// Los productos sin categoría se agrupan al final bajo "Sin categoría".
export function groupByCategory(products, categories) {
  const order = categories.map((c) => c.id);

  const groups = {};

  for (const product of products) {
    const key = product.category_id ?? "__sin_categoria__";
    if (!groups[key]) groups[key] = [];
    groups[key].push(product);
  }

  const sorted = order
    .filter((id) => groups[id])
    .map((id) => ({
      categoryName: categories.find((c) => c.id === id)?.name ?? "Sin categoría",
      items: groups[id],
    }));

  if (groups["__sin_categoria__"]) {
    sorted.push({ categoryName: "Sin categoría", items: groups["__sin_categoria__"] });
  }

  return sorted;
}