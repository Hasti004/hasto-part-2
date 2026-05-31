import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { X } from "lucide-react";
import { useAuth } from "../lib/auth";
import { useWishlist } from "../lib/wishlist";
import { fetchWishlistProducts } from "../lib/commerce";
import { formatINR } from "../lib/products";
import type { HastoProduct } from "../lib/mapShopifyProduct";

export function Wishlist() {
  const { session, loading } = useAuth();
  const wishlist = useWishlist();
  const [products, setProducts] = useState<HastoProduct[] | null>(null);

  useEffect(() => {
    if (!session) return;
    fetchWishlistProducts()
      .then(setProducts)
      .catch(() => setProducts([]));
  }, [session, wishlist.count]);

  if (loading) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-paper">
        <p className="text-[12px] uppercase tracking-[0.2em] text-ink/40">loading…</p>
      </main>
    );
  }
  if (!session) return <Navigate to="/account/login" replace state={{ from: "/wishlist" }} />;

  return (
    <main className="min-h-[100svh] bg-paper pt-24 text-ink">
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
        <h1 className="font-display text-4xl">Wishlist</h1>

        {products === null ? (
          <p className="mt-8 text-sm text-ink/40">Loading…</p>
        ) : products.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-ink/15 p-12 text-center">
            <p className="text-sm text-ink/45">Nothing saved yet.</p>
            <Link
              to="/"
              className="mt-2 inline-block text-[12px] uppercase tracking-[0.12em] underline underline-offset-4"
            >
              explore the collection
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <div key={p.id} className="group relative block">
                <button
                  onClick={() => void wishlist.toggle(p.id)}
                  aria-label="Remove"
                  className="absolute right-2 top-2 z-10 rounded-full bg-paper/90 p-1.5 text-ink/60 transition hover:text-ink"
                >
                  <X size={15} />
                </button>
                <Link to={`/product/${p.slug}`}>
                  <div className="aspect-[3/4] overflow-hidden rounded-[3px] bg-[#f1eee9]">
                    {p.image && (
                      <img
                        src={p.image}
                        alt={p.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <h3 className="mt-3 text-[12px] uppercase tracking-[0.06em] text-ink/80">
                    {p.name}
                  </h3>
                  <p className="mt-1 font-display text-sm text-ink">
                    {formatINR(Number(p.price))}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
