// Datos simulados para la Fase 2.
// En la Fase 3 esta información se va a reemplazar completamente por datos
// reales obtenidos desde Supabase, manteniendo la misma forma (shape) de datos.

export const categories = [
  { id: "mates", name: "Mates" },
  { id: "bombillas", name: "Bombillas" },
  { id: "termos", name: "Termos" },
  { id: "yerberas", name: "Yerberas" },
];

export const products = [
  {
    id: "1",
    name: "Mate Imperial Camionero",
    description:
      "Mate de calabaza forrado en cuero, con virola y base de alpaca. Ideal para el uso diario.",
    categoryId: "mates",
    status: "disponible",
    images: [
      "https://picsum.photos/seed/mate1/600/600",
      "https://picsum.photos/seed/mate1b/600/600",
    ],
  },
  {
    id: "2",
    name: "Mate Torpedo Algarrobo",
    description:
      "Mate de madera de algarrobo, curado y listo para usar. Diseño clásico torpedo.",
    categoryId: "mates",
    status: "disponible",
    images: ["https://picsum.photos/seed/mate2/600/600"],
  },
  {
    id: "3",
    name: "Mate Camionero Acero",
    description: "Mate de acero inoxidable, doble pared, mantiene la temperatura por más tiempo.",
    categoryId: "mates",
    status: "sin_stock",
    images: ["https://picsum.photos/seed/mate3/600/600"],
  },
  {
    id: "4",
    name: "Bombilla Alpaca Clásica",
    description: "Bombilla de alpaca con filtro tipo cuchara, fácil de limpiar.",
    categoryId: "bombillas",
    status: "disponible",
    images: ["https://picsum.photos/seed/bombilla1/600/600"],
  },
  {
    id: "5",
    name: "Bombilla Acero Quebracho",
    description: "Bombilla de acero inoxidable con cabo de madera de quebracho.",
    categoryId: "bombillas",
    status: "disponible",
    images: ["https://picsum.photos/seed/bombilla2/600/600"],
  },
  {
    id: "6",
    name: "Termo 1L Acero Inoxidable",
    description: "Termo de un litro, pico cebador, mantiene la temperatura hasta 12 horas.",
    categoryId: "termos",
    status: "disponible",
    images: ["https://picsum.photos/seed/termo1/600/600"],
  },
  {
    id: "7",
    name: "Yerbera Cuero Grande",
    description: "Yerbera de cuero con tapa, capacidad para medio kilo de yerba.",
    categoryId: "yerberas",
    status: "sin_stock",
    images: ["https://picsum.photos/seed/yerbera1/600/600"],
  },
];

export function getProductById(id) {
  return products.find((product) => product.id === id);
}

export function getCategoryById(id) {
  return categories.find((category) => category.id === id);
}