import { supabase } from "./supabase";
import type { Database } from "./database.types";

export type ProductRow = Database["public"]["Tables"]["products"]["Row"];
export type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];

// ---------------------------------------------------------------- visitor id
const VID_KEY = "hasto_vid";
export function getVisitorId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem(VID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VID_KEY, id);
  }
  return id;
}

// ---------------------------------------------------------------- tracking
export async function trackEvent(
  type: "page_view" | "product_view",
  path: string,
  productId?: string | null
) {
  try {
    await supabase.rpc("track_event", {
      p_visitor: getVisitorId(),
      p_type: type,
      p_path: path,
      p_product: productId ?? undefined,
    });
  } catch {
    /* tracking must never break the UI */
  }
}

// ---------------------------------------------------------------- cart sync
export async function syncCart(
  items: { product_id: string; quantity: number }[],
  email?: string | null
) {
  try {
    await supabase.rpc("sync_cart", {
      p_visitor: getVisitorId(),
      p_email: email ?? "",
      p_items: items,
    });
  } catch {
    /* non-fatal */
  }
}

// ---------------------------------------------------------------- products
export async function fetchProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_hidden", false)
    .neq("status", "discontinued")
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Same-category "you may also like", excluding the current product. */
export async function fetchRecommendations(category: string, excludeId: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .eq("is_hidden", false)
    .neq("status", "discontinued")
    .neq("id", excludeId)
    .limit(4);
  if (error) throw error;
  return data ?? [];
}

export async function fetchProductsByIds(ids: string[]) {
  if (!ids.length) return [];
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .in("id", ids)
    .eq("is_hidden", false)
    .neq("status", "discontinued");
  if (error) throw error;
  return data ?? [];
}

export async function fetchProductsBySlugs(slugs: string[]) {
  if (!slugs.length) return [];
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .in("slug", slugs)
    .eq("is_hidden", false)
    .neq("status", "discontinued");
  if (error) throw error;
  return data ?? [];
}

/** Featured strip for the home page — newest first, capped. */
export async function fetchFeaturedProducts(limit = 4) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_hidden", false)
    .eq("status", "active")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

// ---------------------------------------------------------------- orders
export type PlaceOrderInput = {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  items: { product_id: string; quantity: number }[];
  notes?: string;
};

export async function placeOrder(input: PlaceOrderInput): Promise<OrderRow> {
  const { data, error } = await supabase.rpc("place_order", {
    p_visitor: getVisitorId(),
    p_name: input.name,
    p_email: input.email,
    p_phone: input.phone,
    p_line1: input.line1,
    p_line2: input.line2,
    p_city: input.city,
    p_state: input.state,
    p_pincode: input.pincode,
    p_items: input.items,
    p_notes: input.notes ?? undefined,
  });
  if (error) throw error;
  return data as unknown as OrderRow;
}

export async function fetchMyOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ---------------------------------------------------------------- wishlist
export async function fetchWishlistProductIds(): Promise<string[]> {
  const { data, error } = await supabase.from("wishlists").select("product_id");
  if (error) throw error;
  return (data ?? []).map((r) => r.product_id);
}

export async function fetchWishlistProducts() {
  const { data, error } = await supabase
    .from("wishlists")
    .select("product:products(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? [])
    .map((r) => r.product as unknown as ProductRow)
    .filter(Boolean);
}

export async function addToWishlist(userId: string, productId: string) {
  const { error } = await supabase
    .from("wishlists")
    .insert({ user_id: userId, product_id: productId });
  if (error && !error.message.includes("duplicate")) throw error;
}

export async function removeFromWishlist(userId: string, productId: string) {
  const { error } = await supabase
    .from("wishlists")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);
  if (error) throw error;
}
