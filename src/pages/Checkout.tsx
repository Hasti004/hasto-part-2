import { Link } from "react-router-dom";
import { useCart } from "../lib/cart";
import { formatINR } from "../lib/products";

export function Checkout() {
  const { items, subtotal, goToCheckout, checkoutUrl, loading } = useCart();

  if (!loading && items.length === 0) {
    return (
      <main className="flex min-h-[100svh] flex-col items-center justify-center gap-4 bg-paper text-center">
        <h1 className="font-display text-3xl text-ink">Your bag is empty</h1>
        <Link
          to="/"
          className="text-[12px] uppercase tracking-[0.14em] text-ink underline underline-offset-4"
        >
          continue shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-[100svh] bg-paper pt-24 text-ink">
      <div className="mx-auto max-w-5xl px-6 py-10 md:px-10">
        <h1 className="font-display text-4xl">Checkout</h1>
        <p className="mt-2 text-sm text-ink/55">
          Payment and shipping are handled securely on Shopify.
        </p>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-xl border border-ink/10 bg-paper px-4 py-3 text-sm text-ink/70">
              You&apos;ll be redirected to Shopify to complete payment and enter your shipping address.
            </div>
            <button
              type="button"
              onClick={goToCheckout}
              disabled={loading || !checkoutUrl || items.length === 0}
              className="w-full rounded-full bg-ink py-3.5 text-[12px] uppercase tracking-[0.16em] text-paper transition hover:bg-ink/90 disabled:opacity-50"
            >
              {loading ? "loading bag…" : `proceed to checkout · ${formatINR(subtotal)}`}
            </button>
          </div>

          <aside className="h-fit rounded-2xl border border-ink/10 bg-paper p-6">
            <h2 className="text-[12px] uppercase tracking-[0.14em] text-ink/55">
              your bag
            </h2>
            <ul className="mt-4 divide-y divide-ink/8">
              {items.map((i) => (
                <li key={i.lineId} className="flex gap-3 py-3">
                  <div className="h-16 w-14 shrink-0 overflow-hidden rounded-[3px] bg-[#f1eee9]">
                    {i.image && <img src={i.image} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex flex-1 justify-between gap-2">
                    <div>
                      <p className="text-[12px] uppercase tracking-[0.05em] text-ink/80">{i.name}</p>
                      <p className="text-[11px] text-ink/45">qty {i.quantity}</p>
                    </div>
                    <p className="font-display text-sm text-ink">{formatINR(i.price * i.quantity)}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2 border-t border-ink/10 pt-4 text-sm">
              <Row label="Subtotal" value={formatINR(subtotal)} />
              <Row label="Shipping" value="At checkout" />
              <div className="flex justify-between pt-2 text-base">
                <span className="font-display text-ink">Total</span>
                <span className="font-display text-ink">{formatINR(subtotal)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-ink/65">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
