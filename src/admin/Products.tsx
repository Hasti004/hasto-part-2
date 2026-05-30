import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Pencil, Eye, EyeOff, Trash2 } from "lucide-react";
import {
  fetchAllProducts,
  updateProduct,
  deleteProduct,
  formatINR,
  type ProductRow,
  type ProductStatus,
} from "../lib/products";
import { cn } from "../lib/cn";

type Filter = "all" | "active" | "out_of_stock" | "hidden";

export function Products() {
  const [rows, setRows] = useState<ProductRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () =>
    fetchAllProducts()
      .then(setRows)
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  const patch = async (id: string, patch: Parameters<typeof updateProduct>[1]) => {
    setBusyId(id);
    try {
      const updated = await updateProduct(id, patch);
      setRows((rs) => rs?.map((r) => (r.id === id ? updated : r)) ?? null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (p: ProductRow) => {
    if (
      !confirm(
        `Permanently delete “${p.name}”?\n\nTo keep the data but hide it from the site, use “Discontinue” instead.`
      )
    )
      return;
    setBusyId(p.id);
    try {
      await deleteProduct(p.id);
      setRows((rs) => rs?.filter((r) => r.id !== p.id) ?? null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const filtered = useMemo(() => {
    if (!rows) return [];
    return rows.filter((r) => {
      if (q && !`${r.name} ${r.category} ${r.slug}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      if (filter === "active") return r.status === "active" && !r.is_hidden;
      if (filter === "out_of_stock") return r.status === "out_of_stock";
      if (filter === "hidden") return r.is_hidden || r.status === "discontinued";
      return true;
    });
  }, [rows, q, filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Products</h1>
          <p className="mt-1 text-sm text-ink/50">
            {rows ? `${rows.length} total` : "Loading…"}
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[12px] uppercase tracking-[0.12em] text-paper transition hover:bg-ink/90"
        >
          <Plus size={15} /> Add product
        </Link>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {/* controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-ink/15 bg-paper px-3.5 py-2">
          <Search size={15} className="text-ink/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, category…"
            className="w-48 bg-transparent text-sm text-ink outline-none placeholder:text-ink/35"
          />
        </div>
        <div className="flex gap-1.5">
          {(
            [
              ["all", "All"],
              ["active", "Live"],
              ["out_of_stock", "Out of stock"],
              ["hidden", "Hidden"],
            ] as [Filter, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                "rounded-full px-3.5 py-2 text-[12px] tracking-[0.04em] transition",
                filter === key
                  ? "bg-ink text-paper"
                  : "border border-ink/15 text-ink/60 hover:border-ink/40"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* table */}
      <div className="overflow-hidden rounded-2xl border border-ink/10 bg-paper">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 text-[11px] uppercase tracking-[0.12em] text-ink/45">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {rows === null ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink/40">
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink/40">
                  No products match.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className={cn(busyId === p.id && "opacity-50")}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-[#efeae3]">
                        {p.image && (
                          <img
                            src={p.image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">{p.name}</p>
                        <p className="truncate text-[11px] text-ink/40">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 capitalize text-ink/70 sm:table-cell">
                    {p.category}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-ink/80">
                    {formatINR(Number(p.price))}
                  </td>
                  <td className="hidden px-4 py-3 tabular-nums text-ink/70 md:table-cell">
                    {p.stock_quantity}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill p={p} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <RowAction
                        title="Edit"
                        to={`/admin/products/${p.id}`}
                        icon={<Pencil size={15} />}
                      />
                      <button
                        title={p.is_hidden ? "Show on site" : "Hide from site"}
                        onClick={() => patch(p.id, { is_hidden: !p.is_hidden })}
                        className="rounded-md p-2 text-ink/55 transition hover:bg-ink/5 hover:text-ink"
                      >
                        {p.is_hidden ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button
                        title="Delete permanently"
                        onClick={() => remove(p)}
                        className="rounded-md p-2 text-ink/55 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    {/* status quick-set */}
                    <div className="mt-1 flex justify-end gap-1">
                      <StatusButton
                        active={p.status === "active"}
                        onClick={() => patch(p.id, { status: "active" })}
                      >
                        live
                      </StatusButton>
                      <StatusButton
                        active={p.status === "out_of_stock"}
                        onClick={() => patch(p.id, { status: "out_of_stock" })}
                      >
                        sold out
                      </StatusButton>
                      <StatusButton
                        active={p.status === "discontinued"}
                        onClick={() => patch(p.id, { status: "discontinued" })}
                      >
                        discontinue
                      </StatusButton>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusPill({ p }: { p: ProductRow }) {
  if (p.is_hidden)
    return <Pill className="bg-ink/10 text-ink/60">Hidden</Pill>;
  const map: Record<ProductStatus, { cls: string; label: string }> = {
    active: { cls: "bg-green-100 text-green-700", label: "Live" },
    out_of_stock: { cls: "bg-amber-100 text-amber-700", label: "Out of stock" },
    discontinued: { cls: "bg-ink/10 text-ink/50", label: "Discontinued" },
  };
  const s = map[p.status as ProductStatus] ?? map.active;
  return <Pill className={s.cls}>{s.label}</Pill>;
}

function Pill({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-1 text-[11px] font-medium",
        className
      )}
    >
      {children}
    </span>
  );
}

function RowAction({
  to,
  icon,
  title,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <Link
      to={to}
      title={title}
      className="rounded-md p-2 text-ink/55 transition hover:bg-ink/5 hover:text-ink"
    >
      {icon}
    </Link>
  );
}

function StatusButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded px-2 py-1 text-[10px] uppercase tracking-[0.08em] transition",
        active
          ? "bg-ink text-paper"
          : "bg-ink/5 text-ink/45 hover:bg-ink/10 hover:text-ink/70"
      )}
    >
      {children}
    </button>
  );
}
