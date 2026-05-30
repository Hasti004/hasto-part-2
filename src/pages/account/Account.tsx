import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Heart, LogOut } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import { fetchMyOrders } from "../../lib/commerce";
import { formatINR } from "../../lib/products";
import type { Database } from "../../lib/database.types";

type OrderWithItems = Database["public"]["Tables"]["orders"]["Row"] & {
  order_items: Database["public"]["Tables"]["order_items"]["Row"][];
};

const STATUS_LABEL: Record<string, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function Account() {
  const { session, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);
  const [orders, setOrders] = useState<OrderWithItems[] | null>(null);

  useEffect(() => {
    if (!session) return;
    supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        setName(data?.full_name ?? "");
        setPhone(data?.phone ?? "");
      });
    fetchMyOrders()
      .then((o) => setOrders(o as OrderWithItems[]))
      .catch(() => setOrders([]));
  }, [session]);

  if (loading) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-paper">
        <p className="text-[12px] uppercase tracking-[0.2em] text-ink/40">loading…</p>
      </main>
    );
  }
  if (!session) return <Navigate to="/account/login" replace />;

  const saveProfile = async () => {
    await supabase
      .from("profiles")
      .update({ full_name: name, phone })
      .eq("id", session.user.id);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <main className="min-h-[100svh] bg-paper pt-24 text-ink">
      <div className="mx-auto max-w-4xl px-6 py-10 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl">My account</h1>
            <p className="mt-1 text-sm text-ink/50">{session.user.email}</p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/wishlist"
              className="flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2.5 text-[12px] uppercase tracking-[0.12em] text-ink/70 transition hover:border-ink/40"
            >
              <Heart size={15} /> wishlist
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2.5 text-[12px] uppercase tracking-[0.12em] text-ink/70 transition hover:border-ink/40"
            >
              <LogOut size={15} /> sign out
            </button>
          </div>
        </div>

        {/* profile */}
        <section className="mt-8 rounded-2xl border border-ink/10 bg-paper p-6">
          <h2 className="text-[12px] uppercase tracking-[0.14em] text-ink/55">details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <input
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-ink/40"
            />
            <input
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-ink/40"
            />
          </div>
          <button
            onClick={saveProfile}
            className="mt-4 rounded-full bg-ink px-5 py-2.5 text-[12px] uppercase tracking-[0.12em] text-paper transition hover:bg-ink/90"
          >
            {saved ? "saved ✓" : "save"}
          </button>
        </section>

        {/* orders */}
        <section className="mt-8">
          <h2 className="mb-4 text-[12px] uppercase tracking-[0.14em] text-ink/55">
            order history
          </h2>
          {orders === null ? (
            <p className="text-sm text-ink/40">Loading…</p>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink/15 p-8 text-center">
              <p className="text-sm text-ink/45">No orders yet.</p>
              <Link to="/" className="mt-2 inline-block text-[12px] uppercase tracking-[0.12em] underline underline-offset-4">
                start shopping
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {orders.map((o) => (
                <li key={o.id} className="rounded-2xl border border-ink/10 bg-paper p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-lg">{o.order_number}</span>
                      <span className="rounded-full bg-ink/8 px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] text-ink/60">
                        {STATUS_LABEL[o.status] ?? o.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-ink/45">
                      {new Date(o.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <ul className="mt-3 space-y-1 text-sm text-ink/70">
                    {o.order_items?.map((it) => (
                      <li key={it.id} className="flex justify-between">
                        <span>
                          {it.name} × {it.quantity}
                        </span>
                        <span>{formatINR(Number(it.line_total))}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex justify-between border-t border-ink/10 pt-3 text-sm">
                    <span className="text-ink/55">Total · COD</span>
                    <span className="font-display text-ink">{formatINR(Number(o.total))}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
