import { supabase } from "../lib/SupabaseClient";

// Se incluye la categoría relacionada (categories(name)) en la misma consulta
// para evitar una segunda llamada a la base de datos por cada producto.

export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getProductById(id) {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}