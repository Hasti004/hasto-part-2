import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Upload, AlertTriangle } from "lucide-react";
import { fetchAllProducts, formatINR, type ProductRow } from "../lib/products";
import { fetchAdminStats, type AdminStats } from "../lib/admin";

export function Dashboard() {
  const [products, setProducts] = useState<ProductRow[] | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllProducts()
      .then(setProducts)
      .catch((e) => setError(e.message));
    fetchAdminStats()
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  const total = products?.length ?? 0;
  const active = products?.filter((p) => p.status === "active" && !p.is_hidden).length ?? 0;
  const outOfStock = products?.filter((p) => p.status === "out_of_stock").length ?? 0;
  const hidden = products?.filter((p) => p.is_hidden || p.status === "discontinued").length ?? 0;
  const lowStock =
    products?.filter((p) => p.status === "active" && p.stock_quantity <= 3) ?? [];
  const inventoryValue =
    products?.reduce((sum, p) => sum + Number(p.price) * p.stock_quantity, 0) ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-ink/50">Store overview</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/products/new"
            className="flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[12px] uppercase tracking-[0.12em] text-paper transition hover:bg-ink/90"
          >
            <Plus size={15} /> Add product
          </Link>
          <Link
            to="/admin/import"
            className="flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2.5 text-[12px] uppercase tracking-[0.12em] text-ink/70 transition hover:border-ink/40"
          >
            <Upload size={15} /> Import CSV
          </Link>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Total products" value={total} />
        <Stat label="Live on site" value={active} />
        <Stat label="Out of stock" value={outOfStock} />
        <Stat label="Hidden / discontinued" value={hidden} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-ink/10 bg-paper p-6 lg:col-span-2">
          <div className="flex items-center gap-2 text-ink/70">
            <AlertTriangle size={16} />
            <h2 className="text-[12px] uppercase tracking-[0.14em]">Low stock</h2>
          </div>
          {products === null ? (
            <p className="mt-4 text-sm text-ink/40">Loading…</p>
          ) : lowStock.length === 0 ? (
            <p className="mt-4 text-sm text-ink/40">Everything is well stocked.</p>
          ) : (
            <ul className="mt-4 divide-y divide-ink/5">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2.5">
                  <Link
                    to={`/admin/products/${p.id}`}
                    className="text-sm text-ink hover:underline"
                  >
                    {p.name}
                  </Link>
                  <span className="text-[12px] tabular-nums text-ink/50">
                    {p.stock_quantity} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-ink/10 bg-paper p-6">
          <h2 className="text-[12px] uppercase tracking-[0.14em] text-ink/70">
            Inventory value
          </h2>
          <p className="mt-3 font-display text-3xl text-ink">
            {formatINR(inventoryValue)}
          </p>
          <p className="mt-1 text-[12px] text-ink/45">price × stock, all products</p>
        </div>
      </div>

      {/* live commerce */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <CommerceTile
          to="/admin/orders"
          label="Orders"
          big={stats ? String(stats.ordersCount) : "…"}
          sub={
            stats
              ? `${formatINR(stats.revenue)} revenue · ${stats.pendingOrders} to fulfil`
              : ""
          }
        />
        <CommerceTile
          to="/admin/carts"
          label="Carts in progress"
          big={stats ? String(stats.activeCarts) : "…"}
          sub={stats ? `${formatINR(stats.cartValue)} in active bags` : ""}
        />
        <CommerceTile
          to="/admin/visitors"
          label="Visitors (30 days)"
          big={stats ? String(stats.visitors30d) : "…"}
          sub={stats ? `${stats.pageViews30d} page views` : ""}
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-paper p-5">
      <p className="text-[11px] uppercase tracking-[0.14em] text-ink/45">{label}</p>
      <p className="mt-2 font-display text-3xl text-ink tabular-nums">{value}</p>
    </div>
  );
}

function CommerceTile({
  to,
  label,
  big,
  sub,
}: {
  to: string;
  label: string;
  big: string;
  sub: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-ink/10 bg-paper p-6 transition hover:border-ink/30"
    >
      <h2 className="text-[12px] uppercase tracking-[0.14em] text-ink/45">{label}</h2>
      <p className="mt-2 font-display text-3xl text-ink tabular-nums">{big}</p>
      <p className="mt-1 text-[12px] text-ink/45">{sub}</p>
    </Link>
  );
}
