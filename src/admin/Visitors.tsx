import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { fetchVisitorActivity, type VisitorActivity } from "../lib/admin";

const timeAgo = (iso: string) => {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const shortId = (id: string) => id.slice(0, 8);

export function Visitors() {
  const [data, setData] = useState<VisitorActivity | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVisitorActivity()
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Visitors</h1>
        <p className="mt-1 text-sm text-ink/50">Page views &amp; most-viewed pieces</p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* most viewed */}
        <div className="rounded-2xl border border-ink/10 bg-paper p-6">
          <h2 className="mb-4 flex items-center gap-2 text-[12px] uppercase tracking-[0.14em] text-ink/55">
            <Eye size={15} /> most viewed (30 days)
          </h2>
          {data === null ? (
            <p className="text-sm text-ink/40">Loading…</p>
          ) : data.topProducts.length === 0 ? (
            <p className="text-sm text-ink/40">No product views yet.</p>
          ) : (
            <ul className="space-y-2.5">
              {data.topProducts.map((p) => (
                <li key={p.slug} className="flex items-center justify-between">
                  <span className="text-sm text-ink">{p.name}</span>
                  <span className="text-[12px] tabular-nums text-ink/50">
                    {p.views} view{p.views === 1 ? "" : "s"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* recent activity */}
        <div className="rounded-2xl border border-ink/10 bg-paper p-6">
          <h2 className="mb-4 text-[12px] uppercase tracking-[0.14em] text-ink/55">
            recent activity
          </h2>
          {data === null ? (
            <p className="text-sm text-ink/40">Loading…</p>
          ) : data.recent.length === 0 ? (
            <p className="text-sm text-ink/40">No activity recorded yet.</p>
          ) : (
            <ul className="max-h-[420px] space-y-2 overflow-y-auto">
              {data.recent.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 truncate">
                    <span className="rounded bg-ink/5 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.06em] text-ink/45">
                      {e.type === "product_view" ? "product" : "page"}
                    </span>
                    <span className="truncate text-ink/70">{e.path}</span>
                  </span>
                  <span className="shrink-0 text-[11px] text-ink/35">
                    {shortId(e.visitor_id)} · {timeAgo(e.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
