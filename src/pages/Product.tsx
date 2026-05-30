import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, Minus, Plus, ChevronLeft } from "lucide-react";
import {
  fetchProductBySlug,
  fetchRecommendations,
  trackEvent,
  type ProductRow,
} from "../lib/commerce";
import { formatINR } from "../lib/products";
import { useCart } from "../lib/cart";
import { useWishlist } from "../lib/wishlist";
import { useAuth } from "../lib/auth";
import { cn } from "../lib/cn";

export function Product() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const { session } = useAuth();
  const wishlist = useWishlist();

  const [product, setProduct] = useState<ProductRow | null | undefined>(undefined);
  const [recs, setRecs] = useState<ProductRow[]>([]);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!slug) return;
    setProduct(undefined);
    setQty(1);
    fetchProductBySlug(slug)
      .then((p) => {
        setProduct(p);
        if (p) {
          void trackEvent("product_view", `/product/${slug}`, p.id);
          fetchRecommendations(p.category, p.id).then(setRecs).catch(() => {});
        }
      })
      .catch(() => setProduct(null));
  }, [slug]);

  if (product === undefined) {
    return (
      <main className="min-h-[100svh] bg-paper pt-28">
        <div className="mx-auto max-w-6xl animate-pulse px-6 md:px-10">
          <div className="grid gap-10 md:grid-cols-2">
            <div className="aspect-square rounded bg-[#f1eee9]" />
            <div className="space-y-4 pt-8">
              <div className="h-6 w-2/3 bg-[#f1eee9]" />
              <div className="h-4 w-1/3 bg-[#f1eee9]" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (product === null) {
    return (
      <main className="flex min-h-[100svh] flex-col items-center justify-center gap-4 bg-paper text-center">
        <h1 className="font-display text-3xl text-ink">Piece not found</h1>
        <Link to="/" className="text-[12px] uppercase tracking-[0.14em] text-ink underline underline-offset-4">
          back home
        </Link>
      </main>
    );
  }

  const soldOut = product.status === "out_of_stock" || product.stock_quantity <= 0;
  const gallery = [product.image, ...(product.images || [])].filter(Boolean) as string[];
  const inWishlist = wishlist.has(product.id);

  const onWishlist = async () => {
    const ok = await wishlist.toggle(product.id);
    if (!ok) navigate("/account/login", { state: { from: `/product/${slug}` } });
  };

  return (
    <main className="min-h-[100svh] bg-paper pt-24 text-ink">
      <div className="mx-auto max-w-6xl px-6 py-8 md:px-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.12em] text-ink/45 transition hover:text-ink"
        >
          <ChevronLeft size={14} /> back
        </button>

        <div className="grid gap-10 md:grid-cols-2 md:gap-14">
          {/* gallery */}
          <div className="space-y-3">
            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[4px] bg-[#f1eee9]">
              {gallery[0] && (
                <img
                  src={gallery[0]}
                  alt={product.name}
                  className={cn("h-full w-full object-cover", soldOut && "opacity-80")}
                />
              )}
              {product.badge && (
                <span className="absolute left-4 top-4 rounded-full bg-paper/90 px-3 py-1 text-[10px] lowercase tracking-[0.1em] text-ink">
                  {product.badge}
                </span>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-3">
                {gallery.slice(1, 5).map((src, i) => (
                  <div key={i} className="h-20 w-16 overflow-hidden rounded-[3px] bg-[#f1eee9]">
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* details */}
          <div className="md:pt-6">
            <p className="text-[11px] uppercase tracking-[0.18em] text-ink/40">
              {product.category}
            </p>
            <h1 className="mt-2 font-display text-4xl leading-tight tracking-[0.01em] md:text-5xl">
              {product.name}
            </h1>
            {product.tagline && (
              <p className="mt-3 font-serif text-base italic text-ink/55">
                {product.tagline}
              </p>
            )}
            <p className="mt-5 font-display text-2xl text-ink">
              {formatINR(Number(product.price))}
              {product.compare_at_price && (
                <span className="ml-3 text-base text-ink/40 line-through">
                  {formatINR(Number(product.compare_at_price))}
                </span>
              )}
            </p>

            {product.description && (
              <p className="mt-6 max-w-md text-sm leading-relaxed text-ink/70">
                {product.description}
              </p>
            )}
            {product.material && (
              <p className="mt-4 text-[12px] uppercase tracking-[0.1em] text-ink/45">
                {product.material}
              </p>
            )}

            {/* qty + add */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {!soldOut && (
                <div className="flex items-center rounded-full border border-ink/15">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-3 text-ink/60 hover:text-ink"
                    aria-label="Decrease"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="min-w-[28px] text-center text-sm tabular-nums">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(product.stock_quantity, q + 1))}
                    disabled={qty >= product.stock_quantity}
                    className="px-3.5 py-3 text-ink/60 hover:text-ink disabled:opacity-30"
                    aria-label="Increase"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              )}

              <button
                disabled={soldOut}
                onClick={() => add(product, qty)}
                className={cn(
                  "flex-1 rounded-full px-8 py-3.5 text-[12px] uppercase tracking-[0.16em] transition",
                  soldOut
                    ? "cursor-not-allowed bg-ink/10 text-ink/40"
                    : "bg-ink text-paper hover:bg-ink/90"
                )}
              >
                {soldOut ? "out of stock · coming soon" : "add to bag"}
              </button>

              <button
                onClick={onWishlist}
                aria-label="Wishlist"
                className={cn(
                  "rounded-full border p-3.5 transition",
                  inWishlist
                    ? "border-ink bg-ink text-paper"
                    : "border-ink/15 text-ink/60 hover:border-ink/40"
                )}
              >
                <Heart size={16} fill={inWishlist ? "currentColor" : "none"} />
              </button>
            </div>

            {!soldOut && product.stock_quantity <= 5 && (
              <p className="mt-4 text-[12px] lowercase tracking-[0.08em] text-amber-700">
                only {product.stock_quantity} left
              </p>
            )}
            {!session && (
              <p className="mt-6 text-[11px] lowercase tracking-[0.06em] text-ink/40">
                <Link to="/account/login" className="underline underline-offset-2">
                  sign in
                </Link>{" "}
                to save to your wishlist
              </p>
            )}
          </div>
        </div>

        {/* recommendations */}
        {recs.length > 0 && (
          <section className="mt-20">
            <h2 className="mb-6 text-[12px] uppercase tracking-[0.18em] text-ink/55">
              you may also like
            </h2>
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
              {recs.map((r) => (
                <Link key={r.id} to={`/product/${r.slug}`} className="group block">
                  <div className="aspect-[3/4] overflow-hidden rounded-[3px] bg-[#f1eee9]">
                    {r.image && (
                      <img
                        src={r.image}
                        alt={r.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <h3 className="mt-3 text-[12px] uppercase tracking-[0.06em] text-ink/80">
                    {r.name}
                  </h3>
                  <p className="mt-1 font-display text-sm text-ink">
                    {formatINR(Number(r.price))}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
