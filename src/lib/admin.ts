import { supabase } from "./supabase";
import type { Database } from "./database.types";

export type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type CartRow = Database["public"]["Tables"]["carts"]["Row"];
export type CartItem = Database["public"]["Tables"]["cart_items"]["Row"];

export type AdminOrder = OrderRow & { order_items: OrderItem[] };
export type AdminCart = CartRow & { cart_items: CartItem[] };

export const ORDER_STATUSES = [
  "placed",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

// ---------------------------------------------------------------- orders
export async function fetchAdminOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AdminOrder[];
}

export async function updateOrder(
  id: string,
  patch: Partial<Pick<OrderRow, "status" | "payment_status" | "notes">>
) {
  const { data, error } = await supabase
    .from("orders")
    .update(patch)
    .eq("id", id)
    .select("*, order_items(*)")
    .single();
  if (error) throw error;
  return data as AdminOrder;
}

// ---------------------------------------------------------------- carts
/** Carts that hold at least one item (active or abandoned). */
export async function fetchAdminCarts() {
  const { data, error } = await supabase
    .from("carts")
    .select("*, cart_items(*)")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as AdminCart[]).filter((c) => c.cart_items.length > 0);
}

// ---------------------------------------------------------------- analytics
const since = (days: number) =>
  new Date(Date.now() - days * 864e5).toISOString();

export type AdminStats = {
  ordersCount: number;
  revenue: number;
  pendingOrders: number;
  activeCarts: number;
  cartValue: number;
  visitors30d: number;
  pageViews30d: number;
};

export async function fetchAdminStats(): Promise<AdminStats> {
  const [ordersRes, cartsRes, eventsRes] = await Promise.all([
    supabase.from("orders").select("total, status"),
    supabase.from("carts").select("id, status, cart_items(price, quantity)"),
    supabase.from("events").select("visitor_id, type").gte("created_at", since(30)),
  ]);

  const orders = ordersRes.data ?? [];
  const carts = (cartsRes.data ?? []) as {
    status: string;
    cart_items: { price: number; quantity: number }[];
  }[];
  const events = (eventsRes.data ?? []) as { visitor_id: string; type: string }[];

  const activeCarts = carts.filter(
    (c) => c.status === "active" && c.cart_items.length > 0
  );

  return {
    ordersCount: orders.length,
    revenue: orders
      .filter((o) => o.status !== "cancelled")
      .reduce((s, o) => s + Number(o.total), 0),
    pendingOrders: orders.filter((o) => o.status === "placed").length,
    activeCarts: activeCarts.length,
    cartValue: activeCarts.reduce(
      (s, c) =>
        s + c.cart_items.reduce((x, i) => x + Number(i.price) * i.quantity, 0),
      0
    ),
    visitors30d: new Set(events.map((e) => e.visitor_id)).size,
    pageViews30d: events.filter((e) => e.type === "page_view").length,
  };
}

export type VisitorActivity = {
  recent: {
    id: number;
    visitor_id: string;
    type: string;
    path: string | null;
    created_at: string;
  }[];
  topProducts: { name: string; slug: string; views: number }[];
};

export async function fetchVisitorActivity(): Promise<VisitorActivity> {
  const [recentRes, viewsRes] = await Promise.all([
    supabase
      .from("events")
      .select("id, visitor_id, type, path, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("events")
      .select("product_id")
      .eq("type", "product_view")
      .gte("created_at", since(30))
      .not("product_id", "is", null),
  ]);

  const counts = new Map<string, number>();
  for (const r of (viewsRes.data ?? []) as { product_id: string }[]) {
    counts.set(r.product_id, (counts.get(r.product_id) ?? 0) + 1);
  }
  const topIds = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  let topProducts: VisitorActivity["topProducts"] = [];
  if (topIds.length) {
    const { data: prods } = await supabase
      .from("products")
      .select("id, name, slug")
      .in(
        "id",
        topIds.map(([id]) => id)
      );
    const byId = new Map((prods ?? []).map((p) => [p.id, p]));
    topProducts = topIds
      .map(([id, views]) => {
        const p = byId.get(id);
        return p ? { name: p.name, slug: p.slug, views } : null;
      })
      .filter(Boolean) as VisitorActivity["topProducts"];
  }

  return {
    recent: (recentRes.data ?? []) as VisitorActivity["recent"],
    topProducts,
  };
}
