import { supabase } from "../lib/SupabaseClient";

export async function getActiveRaffle() {
  const { data, error } = await supabase
    .from("raffles")
    .select("*")
    .eq("active", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}

export async function getRaffleNumbers(raffleId) {
  const { data, error } = await supabase
    .from("raffle_numbers")
    .select("*")
    .eq("raffle_id", raffleId)
    .order("number");

  if (error) throw error;
  return data;
}

export async function reserveNumber({ raffleId, number, fullName, phone }) {
  const { data, error } = await supabase
    .from("raffle_numbers")
    .update({ status: "pendiente", full_name: fullName, phone })
    .eq("raffle_id", raffleId)
    .eq("number", number)
    .eq("status", "libre")
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new Error("numero_tomado");
    }
    throw new Error("error_conexion");
  }

  if (!data) {
    throw new Error("numero_tomado");
  }

  return data;
}

// ── Admin ──────────────────────────────────────────────────────────────────

export async function getRaffles() {
  const { data, error } = await supabase
    .from("raffles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getRaffleById(id) {
  const { data, error } = await supabase
    .from("raffles")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createRaffle(raffleData) {
  const { data, error } = await supabase
    .from("raffles")
    .insert(raffleData)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateRaffle(id, raffleData) {
  const { data, error } = await supabase
    .from("raffles")
    .update(raffleData)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteRaffle(id) {
  const { error } = await supabase.from("raffles").delete().eq("id", id);
  if (error) throw error;
}

export async function activateRaffle(id) {
  const { error: deactivateError } = await supabase
    .from("raffles")
    .update({ active: false })
    .neq("id", id);
  if (deactivateError) throw deactivateError;

  const { data, error } = await supabase
    .from("raffles")
    .update({ active: true })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deactivateRaffle(id) {
  const { data, error } = await supabase
    .from("raffles")
    .update({ active: false })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function uploadRaffleImage(file) {
  const ext = file.name.split(".").pop();
  const fileName = `${Date.now()}.${ext}`;
  const path = `raffles/${fileName}`;

  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file);
  if (error) throw error;

  const { data } = supabase.storage
    .from("product-images")
    .getPublicUrl(path);

  return data.publicUrl;
}

export async function getPendingNumbers(raffleId) {
  const { data, error } = await supabase
    .from("raffle_numbers")
    .select("*")
    .eq("raffle_id", raffleId)
    .in("status", ["pendiente", "bloqueado"])
    .order("number");
  if (error) throw error;
  return data;
}

export async function approveNumber(id) {
  const { data, error } = await supabase
    .from("raffle_numbers")
    .update({ status: "bloqueado" })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function rejectNumber(id) {
  const { data, error } = await supabase
    .from("raffle_numbers")
    .update({ status: "libre", full_name: null, phone: null })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function freeNumber(id) {
  const { data, error } = await supabase
    .from("raffle_numbers")
    .update({ status: "libre", full_name: null, phone: null })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}