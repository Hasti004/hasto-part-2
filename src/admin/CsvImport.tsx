import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, Download, CheckCircle2 } from "lucide-react";
import {
  upsertProducts,
  slugify,
  type ProductInsert,
  type ProductStatus,
} from "../lib/products";
import { cn } from "../lib/cn";

const TEMPLATE_COLS = [
  "name",
  "category",
  "price",
  "stock_quantity",
  "slug",
  "tagline",
  "material",
  "description",
  "badge",
  "status",
  "image",
  "compare_at_price",
];

const TEMPLATE = `${TEMPLATE_COLS.join(",")}
Velvet Halo Ring,rings,1290,12,,A whisper around the finger.,Rhodium-plated brass,,new,active,https://example.com/ring.jpg,
Lilac Drop Earrings,earrings,1490,8,,For long evenings.,Sterling silver,,bestseller,active,,`;

const VALID_STATUS: ProductStatus[] = ["active", "out_of_stock", "discontinued"];

// Minimal CSV parser supporting quoted fields, escaped quotes and newlines.
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const t = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (inQuotes) {
      if (ch === '"') {
        if (t[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

type Parsed = { rows: ProductInsert[]; errors: string[] };

function toProducts(matrix: string[][]): Parsed {
  const errors: string[] = [];
  if (matrix.length < 2) return { rows: [], errors: ["No data rows found."] };
  const header = matrix[0].map((h) => h.trim().toLowerCase());
  const idx = (name: string) => header.indexOf(name);
  const need = ["name", "category", "price"];
  for (const n of need)
    if (idx(n) === -1) errors.push(`Missing required column: "${n}".`);
  if (errors.length) return { rows: [], errors };

  const rows: ProductInsert[] = [];
  for (let r = 1; r < matrix.length; r++) {
    const cells = matrix[r];
    const get = (name: string) => (idx(name) > -1 ? (cells[idx(name)] ?? "").trim() : "");
    const name = get("name");
    if (!name) {
      errors.push(`Row ${r + 1}: missing name — skipped.`);
      continue;
    }
    const statusRaw = get("status").toLowerCase();
    const status = (VALID_STATUS.includes(statusRaw as ProductStatus)
      ? statusRaw
      : "active") as ProductStatus;
    rows.push({
      name,
      slug: get("slug") || slugify(name),
      category: get("category") || "rings",
      price: Number(get("price")) || 0,
      compare_at_price: get("compare_at_price") ? Number(get("compare_at_price")) : null,
      stock_quantity: parseInt(get("stock_quantity"), 10) || 0,
      tagline: get("tagline") || null,
      material: get("material") || null,
      description: get("description") || null,
      badge: ["new", "bestseller", "limited"].includes(get("badge"))
        ? (get("badge") as ProductInsert["badge"])
        : null,
      status,
      image: get("image") || null,
    });
  }
  return { rows, errors };
}

export function CsvImport() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setDone(null);
    setError(null);
    const text = await file.text();
    setParsed(toProducts(parseCsv(text)));
  };

  const runImport = async () => {
    if (!parsed?.rows.length) return;
    setImporting(true);
    setError(null);
    try {
      const inserted = await upsertProducts(parsed.rows);
      setDone(inserted.length);
      setParsed(null);
      setFileName("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hasto-products-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.12em] text-ink/50 transition hover:text-ink"
      >
        <ArrowLeft size={14} /> Products
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-ink">Import products (CSV)</h1>
          <p className="mt-1 text-sm text-ink/50">
            Rows are matched by slug — re-importing updates existing products.
          </p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2.5 text-[12px] uppercase tracking-[0.1em] text-ink/70 transition hover:border-ink/40"
        >
          <Download size={15} /> Template
        </button>
      </div>

      {done !== null && (
        <p className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 size={16} /> Imported {done} product{done === 1 ? "" : "s"}.{" "}
          <Link to="/admin/products" className="underline">
            View products
          </Link>
        </p>
      )}
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="rounded-2xl border border-dashed border-ink/20 bg-paper p-8 text-center">
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          onChange={onFile}
          className="hidden"
        />
        <Upload size={26} className="mx-auto text-ink/35" />
        <p className="mt-3 text-sm text-ink/60">
          {fileName || "Choose a .csv file to import"}
        </p>
        <button
          onClick={() => fileRef.current?.click()}
          className="mt-4 rounded-full bg-ink px-5 py-2.5 text-[12px] uppercase tracking-[0.12em] text-paper transition hover:bg-ink/90"
        >
          Choose file
        </button>
        <p className="mt-3 text-[11px] text-ink/40">
          Required columns: name, category, price. Others optional.
        </p>
      </div>

      {parsed && (
        <div className="space-y-4">
          {parsed.errors.length > 0 && (
            <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <ul className="list-disc space-y-0.5 pl-5">
                {parsed.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          {parsed.rows.length > 0 && (
            <>
              <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-paper">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-ink/10 text-[11px] uppercase tracking-[0.1em] text-ink/45">
                    <tr>
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Category</th>
                      <th className="px-4 py-3 font-medium">Price</th>
                      <th className="px-4 py-3 font-medium">Stock</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/5">
                    {parsed.rows.slice(0, 50).map((p, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2.5 text-ink">{p.name}</td>
                        <td className="px-4 py-2.5 capitalize text-ink/70">
                          {p.category}
                        </td>
                        <td className="px-4 py-2.5 tabular-nums text-ink/70">
                          ₹{Number(p.price).toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-2.5 tabular-nums text-ink/70">
                          {p.stock_quantity}
                        </td>
                        <td className="px-4 py-2.5 text-ink/70">{p.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={runImport}
                  disabled={importing}
                  className={cn(
                    "rounded-full bg-ink px-7 py-3 text-[12px] uppercase tracking-[0.14em] text-paper transition hover:bg-ink/90 disabled:opacity-50"
                  )}
                >
                  {importing
                    ? "Importing…"
                    : `Import ${parsed.rows.length} product${
                        parsed.rows.length === 1 ? "" : "s"
                      }`}
                </button>
                <span className="text-[12px] text-ink/45">
                  {parsed.rows.length > 50 && "Showing first 50 in preview."}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
