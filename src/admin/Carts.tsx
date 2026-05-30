import { useEffect, useState } from "react";
import { fetchAdminCarts, type AdminCart } from "../lib/admin";
import { formatINR } from "../lib/products";
import { cn } from "../lib/cn";

const timeAgo = (iso: string) => {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export function Carts() {
  const [carts, setCarts] = useState<AdminCart[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminCarts()
      .then(setCarts)
      .catch((e) => setError(e.message));
  }, []);

  const value = (c: AdminCart) =>
    c.cart_items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);

  // Active but idle > 1h = likely abandoned.
  const isAbandoned = (c: AdminCart) =>
    c.status === "active" &&
    Date.now() - new Date(c.updated_at).getTime() > 3600_000;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Carts</h1>
        <p className="mt-1 text-sm text-ink/50">
          Who’s added pieces to their bag {carts ? `· ${carts.length}` : ""}
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {carts === null ? (
        <p className="text-sm text-ink/40">Loading…</p>
      ) : carts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/15 p-10 text-center text-sm text-ink/45">
          No carts with items yet.
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {carts.map((c) => {
            const abandoned = isAbandoned(c);
            const ordered = c.status === "ordered";
            return (
              <div key={c.id} className="rounded-2xl border border-ink/10 bg-paper p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-ink">
                      {c.email || (c.user_id ? "Account customer" : "Guest visitor")}
                    </p>
                    <p className="text-[11px] text-ink/40">
                      {c.user_id ? "registered" : "guest"} · updated {timeAgo(c.updated_at)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-medium",
                      ordered
                        ? "bg-green-100 text-green-700"
                        : abandoned
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                    )}
                  >
                    {ordered ? "ordered" : abandoned ? "abandoned" : "active"}
                  </span>
                </div>

                <ul className="mt-3 space-y-1 text-sm text-ink/70">
                  {c.cart_items.map((i) => (
                    <li key={i.id} className="flex justify-between">
                      <span>
                        {i.name} × {i.quantity}
                      </span>
                      <span>{formatINR(Number(i.price) * i.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex justify-between border-t border-ink/10 pt-2 text-sm">
                  <span className="text-ink/50">Cart value</span>
                  <span className="font-display text-ink">{formatINR(value(c))}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
