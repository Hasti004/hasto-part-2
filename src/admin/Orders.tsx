import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  fetchAdminOrders,
  updateOrder,
  ORDER_STATUSES,
  type AdminOrder,
  type OrderStatus,
} from "../lib/admin";
import { formatINR } from "../lib/products";
import { cn } from "../lib/cn";

const STATUS_STYLE: Record<string, string> = {
  placed: "bg-blue-100 text-blue-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  shipped: "bg-amber-100 text-amber-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-ink/10 text-ink/50",
};

export function Orders() {
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminOrders()
      .then(setOrders)
      .catch((e) => setError(e.message));
  }, []);

  const setStatus = async (id: string, status: OrderStatus) => {
    setBusyId(id);
    try {
      const updated = await updateOrder(id, { status });
      setOrders((os) => os?.map((o) => (o.id === id ? updated : o)) ?? null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const togglePaid = async (o: AdminOrder) => {
    setBusyId(o.id);
    try {
      const updated = await updateOrder(o.id, {
        payment_status: o.payment_status === "paid" ? "pending" : "paid",
      });
      setOrders((os) => os?.map((x) => (x.id === o.id ? updated : x)) ?? null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const filtered = useMemo(
    () => (orders ?? []).filter((o) => filter === "all" || o.status === filter),
    [orders, filter]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Orders</h1>
        <p className="mt-1 text-sm text-ink/50">
          {orders ? `${orders.length} total` : "Loading…"}
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {(["all", ...ORDER_STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "rounded-full px-3.5 py-2 text-[12px] capitalize tracking-[0.04em] transition",
              filter === s
                ? "bg-ink text-paper"
                : "border border-ink/15 text-ink/60 hover:border-ink/40"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {orders === null ? (
        <p className="text-sm text-ink/40">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/15 p-10 text-center text-sm text-ink/45">
          No orders here yet.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => {
            const open = openId === o.id;
            return (
              <div
                key={o.id}
                className={cn(
                  "rounded-2xl border border-ink/10 bg-paper",
                  busyId === o.id && "opacity-50"
                )}
              >
                <button
                  onClick={() => setOpenId(open ? null : o.id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-display text-lg text-ink">{o.order_number}</span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] font-medium capitalize",
                        STATUS_STYLE[o.status] ?? "bg-ink/10 text-ink/60"
                      )}
                    >
                      {o.status}
                    </span>
                    {o.payment_status === "paid" && (
                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-medium text-green-700">
                        paid
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="hidden text-[12px] text-ink/45 sm:block">
                      {o.customer_name}
                    </span>
                    <span className="font-display text-ink">{formatINR(Number(o.total))}</span>
                    <ChevronDown
                      size={16}
                      className={cn("text-ink/40 transition", open && "rotate-180")}
                    />
                  </div>
                </button>

                {open && (
                  <div className="border-t border-ink/10 px-5 py-4">
                    <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
                      {/* items */}
                      <div>
                        <h3 className="mb-2 text-[11px] uppercase tracking-[0.12em] text-ink/45">
                          items
                        </h3>
                        <ul className="space-y-1.5 text-sm text-ink/75">
                          {o.order_items.map((it) => (
                            <li key={it.id} className="flex justify-between">
                              <span>
                                {it.name} × {it.quantity}
                              </span>
                              <span>{formatINR(Number(it.line_total))}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 flex justify-between border-t border-ink/10 pt-2 text-sm">
                          <span className="text-ink/55">Total · {o.payment_method.toUpperCase()}</span>
                          <span className="font-display text-ink">{formatINR(Number(o.total))}</span>
                        </div>
                      </div>

                      {/* customer + actions */}
                      <div className="space-y-4">
                        <div className="text-sm text-ink/70">
                          <h3 className="mb-2 text-[11px] uppercase tracking-[0.12em] text-ink/45">
                            ship to
                          </h3>
                          <p className="text-ink">{o.customer_name}</p>
                          <p>{o.customer_email}</p>
                          {o.customer_phone && <p>{o.customer_phone}</p>}
                          <p className="mt-1">
                            {[o.address_line1, o.address_line2, o.city, o.state, o.pincode]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                          {o.notes && (
                            <p className="mt-2 italic text-ink/50">“{o.notes}”</p>
                          )}
                        </div>

                        <div>
                          <h3 className="mb-2 text-[11px] uppercase tracking-[0.12em] text-ink/45">
                            update status
                          </h3>
                          <div className="flex flex-wrap gap-1.5">
                            {ORDER_STATUSES.map((s) => (
                              <button
                                key={s}
                                onClick={() => setStatus(o.id, s)}
                                className={cn(
                                  "rounded-full px-3 py-1.5 text-[11px] capitalize transition",
                                  o.status === s
                                    ? "bg-ink text-paper"
                                    : "bg-ink/5 text-ink/55 hover:bg-ink/10"
                                )}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => togglePaid(o)}
                            className="mt-3 rounded-full border border-ink/15 px-3.5 py-1.5 text-[11px] uppercase tracking-[0.08em] text-ink/65 transition hover:border-ink/40"
                          >
                            mark {o.payment_status === "paid" ? "unpaid" : "paid"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
