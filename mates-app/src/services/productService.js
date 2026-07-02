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

export async function createProduct(productData) {
  const { data, error } = await supabase
    .from("products")
    .insert(productData)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id, productData) {
  const { data, error } = await supabase
    .from("products")
    .update(productData)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadProductImage(file) {
  const ext = file.name.split(".").pop();
  const fileName = `${Date.now()}.${ext}`;
  const path = `products/${fileName}`;

  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file);
  if (error) throw error;

  const { data } = supabase.storage
    .from("product-images")
    .getPublicUrl(path);

  return data.publicUrl;
}

export async function deleteProductImage(url) {
  const path = url.split("/product-images/")[1];
  if (!path) return;
  await supabase.storage.from("product-images").remove([path]);
}