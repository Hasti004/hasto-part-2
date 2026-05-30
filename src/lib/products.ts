import { supabase } from "./supabase";
import type { Database } from "./database.types";

export type ProductRow = Database["public"]["Tables"]["products"]["Row"];
export type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
export type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];
export type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

export type ProductStatus = "active" | "out_of_stock" | "discontinued";

export const STATUS_LABELS: Record<ProductStatus, string> = {
  active: "Active",
  out_of_stock: "Out of stock · coming soon",
  discontinued: "Discontinued (hidden)",
};

/** A url-safe slug from a product name. */
export const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

// ---------------------------------------------------------------- public reads
/** Visible, non-discontinued products — what end users see. */
export async function fetchPublicProducts(category?: string) {
  let q = supabase
    .from("products")
    .select("*")
    .eq("is_hidden", false)
    .neq("status", "discontinued")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (category) q = q.eq("category", category);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function fetchCategories(activeOnly = true) {
  let q = supabase.from("categories").select("*").order("sort_order");
  if (activeOnly) q = q.eq("is_active", true);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

// ---------------------------------------------------------------- admin reads
/** Every product, including hidden/discontinued — admin only (RLS-gated). */
export async function fetchAllProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchProductById(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

// --------------------------------------------------------------- admin writes
export async function createProduct(input: ProductInsert) {
  const { data, error } = await supabase
    .from("products")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, patch: ProductUpdate) {
  const { data, error } = await supabase
    .from("products")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Permanently delete. For "discontinue but keep data" use updateProduct. */
export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

/** Bulk insert (CSV import). Upserts on slug so re-imports update. */
export async function upsertProducts(rows: ProductInsert[]) {
  const { data, error } = await supabase
    .from("products")
    .upsert(rows, { onConflict: "slug" })
    .select();
  if (error) throw error;
  return data ?? [];
}

// --------------------------------------------------------------- image upload
export async function uploadProductImage(file: File) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}
