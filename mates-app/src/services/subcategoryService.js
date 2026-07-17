import { supabase } from "../lib/SupabaseClient";

export async function getSubcategories() {
  const { data, error } = await supabase
    .from("subcategories")
    .select("*")
    .order("name");
  if (error) throw error;
  return data;
}

export async function createSubcategory(name, categoryId) {
  const { data, error } = await supabase
    .from("subcategories")
    .insert({ name, category_id: categoryId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateSubcategory(id, name) {
  const { data, error } = await supabase
    .from("subcategories")
    .update({ name })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSubcategory(id) {
  const { error } = await supabase.from("subcategories").delete().eq("id", id);
  if (error) throw error;
}