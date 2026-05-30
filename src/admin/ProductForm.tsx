import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, ImagePlus, Loader2, X } from "lucide-react";
import {
  createProduct,
  updateProduct,
  fetchProductById,
  fetchCategories,
  uploadProductImage,
  slugify,
  type CategoryRow,
  type ProductStatus,
} from "../lib/products";
import { cn } from "../lib/cn";

type FormState = {
  name: string;
  slug: string;
  category: string;
  price: string;
  compare_at_price: string;
  stock_quantity: string;
  material: string;
  tagline: string;
  description: string;
  badge: string;
  status: ProductStatus;
  is_hidden: boolean;
  image: string;
};

const empty: FormState = {
  name: "",
  slug: "",
  category: "",
  price: "",
  compare_at_price: "",
  stock_quantity: "0",
  material: "",
  tagline: "",
  description: "",
  badge: "",
  status: "active",
  is_hidden: false,
  image: "",
};

export function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(empty);
  const [cats, setCats] = useState<CategoryRow[]>([]);
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories(false)
      .then((c) => {
        setCats(c);
        setForm((f) => (f.category ? f : { ...f, category: c[0]?.slug ?? "" }));
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!id) return;
    fetchProductById(id)
      .then((p) => {
        setForm({
          name: p.name,
          slug: p.slug,
          category: p.category,
          price: String(p.price ?? ""),
          compare_at_price: p.compare_at_price == null ? "" : String(p.compare_at_price),
          stock_quantity: String(p.stock_quantity ?? 0),
          material: p.material ?? "",
          tagline: p.tagline ?? "",
          description: p.description ?? "",
          badge: p.badge ?? "",
          status: (p.status as ProductStatus) ?? "active",
          is_hidden: p.is_hidden,
          image: p.image ?? "",
        });
        setSlugTouched(true);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [id]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  // Auto-derive slug from name until the user edits it manually.
  const onName = (v: string) => {
    setForm((f) => ({
      ...f,
      name: v,
      slug: slugTouched ? f.slug : slugify(v),
    }));
  };

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadProductImage(file);
      set("image", url);
    } catch (err) {
      setError(`Image upload failed: ${(err as Error).message}`);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) return setError("Name is required.");
    if (!form.category) return setError("Pick a category.");
    const slug = (form.slug || slugify(form.name)).trim();

    const payload = {
      name: form.name.trim(),
      slug,
      category: form.category,
      price: Number(form.price) || 0,
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      stock_quantity: parseInt(form.stock_quantity, 10) || 0,
      material: form.material.trim() || null,
      tagline: form.tagline.trim() || null,
      description: form.description.trim() || null,
      badge: form.badge || null,
      status: form.status,
      is_hidden: form.is_hidden,
      image: form.image || null,
    };

    setSaving(true);
    try {
      if (isEdit && id) await updateProduct(id, payload);
      else await createProduct(payload);
      navigate("/admin/products");
    } catch (err) {
      const msg = (err as Error).message;
      setError(
        msg.includes("duplicate") || msg.includes("unique")
          ? "That slug is already taken — change the slug and try again."
          : msg
      );
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-ink/40">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.12em] text-ink/50 transition hover:text-ink"
      >
        <ArrowLeft size={14} /> Products
      </Link>

      <h1 className="font-display text-3xl text-ink">
        {isEdit ? "Edit product" : "Add product"}
      </h1>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* image */}
        <Card title="Image">
          <div className="flex items-center gap-5">
            <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-ink/10 bg-[#efeae3]">
              {form.image ? (
                <img src={form.image} alt="" className="h-full w-full object-cover" />
              ) : (
                <ImagePlus size={26} className="text-ink/30" />
              )}
            </div>
            <div className="space-y-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onPickFile}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-[12px] uppercase tracking-[0.1em] text-ink/70 transition hover:border-ink/40 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Uploading…
                  </>
                ) : (
                  <>
                    <ImagePlus size={14} /> Upload image
                  </>
                )}
              </button>
              {form.image && (
                <button
                  type="button"
                  onClick={() => set("image", "")}
                  className="flex items-center gap-1 text-[12px] text-ink/45 hover:text-red-600"
                >
                  <X size={13} /> remove
                </button>
              )}
              <p className="text-[11px] text-ink/40">JPG / PNG / WebP. Stored securely.</p>
            </div>
          </div>
          {/* fallback: paste a url */}
          <Field label="…or paste an image URL" className="mt-4">
            <input
              value={form.image}
              onChange={(e) => set("image", e.target.value)}
              placeholder="https://…"
              className={inputCls}
            />
          </Field>
        </Card>

        {/* basics */}
        <Card title="Details">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Name *">
              <input
                value={form.name}
                onChange={(e) => onName(e.target.value)}
                className={inputCls}
                required
              />
            </Field>
            <Field label="Slug (URL)">
              <input
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", slugify(e.target.value));
                }}
                className={inputCls}
                placeholder="auto from name"
              />
            </Field>
            <Field label="Category *">
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className={inputCls}
              >
                {cats.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name} ({c.group_name})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Material">
              <input
                value={form.material}
                onChange={(e) => set("material", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Tagline" className="sm:col-span-2">
              <input
                value={form.tagline}
                onChange={(e) => set("tagline", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                className={cn(inputCls, "resize-y")}
              />
            </Field>
          </div>
        </Card>

        {/* pricing & stock */}
        <Card title="Pricing & stock">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Price (₹) *">
              <input
                type="number"
                min="0"
                step="1"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                className={inputCls}
                required
              />
            </Field>
            <Field label="Compare-at price (₹)">
              <input
                type="number"
                min="0"
                step="1"
                value={form.compare_at_price}
                onChange={(e) => set("compare_at_price", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Stock quantity">
              <input
                type="number"
                min="0"
                step="1"
                value={form.stock_quantity}
                onChange={(e) => set("stock_quantity", e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
        </Card>

        {/* visibility */}
        <Card title="Visibility">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Badge">
              <select
                value={form.badge}
                onChange={(e) => set("badge", e.target.value)}
                className={inputCls}
              >
                <option value="">none</option>
                <option value="new">new</option>
                <option value="bestseller">bestseller</option>
                <option value="limited">limited</option>
              </select>
            </Field>
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value as ProductStatus)}
                className={inputCls}
              >
                <option value="active">Active — on sale</option>
                <option value="out_of_stock">Out of stock — coming soon</option>
                <option value="discontinued">Discontinued — keep data, hide</option>
              </select>
            </Field>
          </div>
          <label className="mt-4 flex items-center gap-3 text-sm text-ink/75">
            <input
              type="checkbox"
              checked={form.is_hidden}
              onChange={(e) => set("is_hidden", e.target.checked)}
              className="h-4 w-4 accent-ink"
            />
            Hide this listing from the public site (block)
          </label>
        </Card>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving || uploading}
            className="rounded-full bg-ink px-7 py-3 text-[12px] uppercase tracking-[0.14em] text-paper transition hover:bg-ink/90 disabled:opacity-50"
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add product"}
          </button>
          <Link
            to="/admin/products"
            className="text-[12px] uppercase tracking-[0.12em] text-ink/50 hover:text-ink"
          >
            cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-ink/40";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-paper p-6">
      <h2 className="mb-4 text-[12px] uppercase tracking-[0.14em] text-ink/55">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-ink/50">
        {label}
      </span>
      {children}
    </label>
  );
}
