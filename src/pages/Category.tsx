import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { SlidersHorizontal, ChevronDown, Heart } from "lucide-react";
import {
  fetchPublicProducts,
  fetchCategories,
  formatINR,
  type ProductRow,
  type CategoryRow,
} from "../lib/products";
import { useWishlist } from "../lib/wishlist";
import { cn } from "../lib/cn";

export function Category() {
  const { category } = useParams();
  const navigate = useNavigate();
  const wishlist = useWishlist();
  const active = (category || "earrings").replace(/-/g, " ");
  const activeSlug = (category || "earrings").toLowerCase();

  const [cats, setCats] = useState<CategoryRow[]>([]);
  const [products, setProducts] = useState<ProductRow[] | null>(null);

  useEffect(() => {
    fetchCategories(true)
      .then(setCats)
      .catch(() => setCats([]));
  }, []);

  useEffect(() => {
    setProducts(null);
    fetchPublicProducts(activeSlug)
      .then(setProducts)
      .catch(() => setProducts([]));
  }, [activeSlug]);

  // Tabs: women categories first, fall back to a sensible default set.
  const tabs = useMemo(() => {
    const list = cats.length
      ? cats.map((c) => c.slug)
      : ["earrings", "rings", "bracelets", "necklaces"];
    return list;
  }, [cats]);

  const heading =
    cats.find((c) => c.slug === activeSlug)?.name || active;

  return (
    <main className="relative min-h-[100svh] bg-paper pt-24 text-ink">
      {/* page heading */}
      <div className="px-6 pb-5 pt-4 md:px-10">
        <h1 className="font-edit text-4xl font-medium uppercase tracking-[0.02em] md:text-6xl">
          {heading}
        </h1>
      </div>

      {/* sub-nav: filter · category tabs · view by */}
      <div className="sticky top-[60px] z-30 border-y border-ink/10 bg-paper/90 backdrop-blur-md">
        <div className="flex items-center justify-between gap-4 px-6 py-3 md:px-10">
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 text-[12px] uppercase tracking-[0.14em] text-ink/70 transition hover:text-ink">
              <SlidersHorizontal size={15} strokeWidth={1.6} />
              filter
            </button>
            <nav className="flex items-center gap-5 overflow-x-auto">
              {tabs.map((c) => {
                const isActive = c === activeSlug;
                return (
                  <Link
                    key={c}
                    to={`/shop/${c}`}
                    className={cn(
                      "whitespace-nowrap text-[12px] uppercase tracking-[0.12em] transition-colors",
                      isActive
                        ? "font-semibold text-ink underline underline-offset-[6px]"
                        : "text-ink/45 hover:text-ink"
                    )}
                  >
                    {c}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex shrink-0 items-center gap-5">
            <span className="hidden text-[11px] lowercase tracking-[0.15em] text-ink/40 sm:block">
              {products ? `${products.length} pieces` : "…"}
            </span>
            <button className="flex items-center gap-1.5 text-[12px] uppercase tracking-[0.14em] text-ink/70 transition hover:text-ink">
              view by
              <ChevronDown size={15} strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </div>

      {/* products grid */}
      {products === null ? (
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 px-6 py-10 md:grid-cols-3 md:px-10 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] rounded-[3px] bg-[#f1eee9]" />
              <div className="mt-3 h-3 w-2/3 bg-[#f1eee9]" />
              <div className="mt-2 h-3 w-1/3 bg-[#f1eee9]" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="px-6 py-24 text-center md:px-10">
          <p className="text-sm lowercase tracking-[0.12em] text-ink/45">
            nothing here yet — pieces are on their way.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-2 gap-y-16 px-2 py-10 md:grid-cols-3 md:gap-x-3 md:px-4 lg:grid-cols-4">
          {products.map((p) => {
            const soldOut = p.status === "out_of_stock";
            const saved = wishlist.has(p.id);
            const onHeart = async (e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              const ok = await wishlist.toggle(p.id);
              if (!ok)
                navigate("/account/login", {
                  state: { from: `/shop/${activeSlug}` },
                });
            };
            return (
              <Link
                key={p.id}
                to={`/product/${p.slug}`}
                className="group relative block"
                aria-label={p.name}
              >
                {/* image area — flat, no card; cut-outs float on the page */}
                <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden">
                  {p.image && (
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      className={cn(
                        "h-full w-full select-none object-contain p-4 transition-transform duration-700 group-hover:scale-[1.04]",
                        soldOut && "opacity-60"
                      )}
                    />
                  )}

                  {/* badges */}
                  {soldOut && (
                    <span className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink/85 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-paper">
                      out of stock · coming soon
                    </span>
                  )}
                  {p.badge && !soldOut && (
                    <span className="absolute left-3 top-3 text-[10px] lowercase tracking-[0.14em] text-ink/55">
                      {p.badge}
                    </span>
                  )}

                  {/* wishlist heart */}
                  <button
                    onClick={onHeart}
                    aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
                    className={cn(
                      "absolute bottom-3 right-3 z-10 rounded-full p-1.5 transition",
                      saved ? "text-ink" : "text-ink/40 hover:text-ink"
                    )}
                  >
                    <Heart
                      size={18}
                      strokeWidth={1.5}
                      fill={saved ? "currentColor" : "none"}
                    />
                  </button>
                </div>

                {/* meta */}
                <div className="mt-3 px-3">
                  <h3 className="text-[12px] uppercase tracking-[0.06em] text-ink/85">
                    {p.name}
                  </h3>
                  <p className="mt-1 text-[13px] tabular-nums text-ink">
                    {formatINR(Number(p.price))}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
