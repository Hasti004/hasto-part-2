import { useNavigate } from "react-router-dom";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "../lib/cart";
import { formatINR } from "../lib/products";
import { cn } from "../lib/cn";

export function CartDrawer() {
  const { items, open, setOpen, subtotal, count, setQty, remove } = useCart();
  const navigate = useNavigate();

  const goCheckout = () => {
    setOpen(false);
    navigate("/checkout");
  };

  return (
    <>
      {/* overlay */}
      <div
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-[90] bg-ink/30 backdrop-blur-[2px] transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      {/* panel */}
      <aside
        className={cn(
          "fixed right-0 top-0 z-[95] flex h-[100svh] w-full max-w-[420px] flex-col bg-paper shadow-soft transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
          <h2 className="text-[13px] uppercase tracking-[0.18em] text-ink">
            bag {count > 0 && <span className="text-ink/40">({count})</span>}
          </h2>
          <button onClick={() => setOpen(false)} aria-label="Close" className="text-ink/70 hover:text-ink">
            <X size={20} strokeWidth={1.6} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag size={30} strokeWidth={1.2} className="text-ink/25" />
            <p className="text-sm lowercase tracking-[0.1em] text-ink/45">
              your bag is empty
            </p>
            <button
              onClick={() => setOpen(false)}
              className="text-[12px] uppercase tracking-[0.14em] text-ink underline underline-offset-4"
            >
              continue shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <ul className="divide-y divide-ink/8">
                {items.map((i) => (
                  <li key={i.product_id} className="flex gap-4 py-5">
                    <div className="h-24 w-20 shrink-0 overflow-hidden rounded-[3px] bg-[#f1eee9]">
                      {i.image && (
                        <img src={i.image} alt={i.name} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between gap-3">
                        <h3 className="text-[12px] uppercase tracking-[0.06em] text-ink/85">
                          {i.name}
                        </h3>
                        <button
                          onClick={() => remove(i.product_id)}
                          className="text-ink/35 hover:text-ink"
                          aria-label="Remove"
                        >
                          <X size={15} />
                        </button>
                      </div>
                      <p className="mt-1 font-display text-sm text-ink">
                        {formatINR(i.price)}
                      </p>
                      <div className="mt-auto flex items-center gap-3">
                        <div className="flex items-center rounded-full border border-ink/15">
                          <button
                            onClick={() => setQty(i.product_id, i.quantity - 1)}
                            className="px-2.5 py-1.5 text-ink/60 hover:text-ink"
                            aria-label="Decrease"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="min-w-[24px] text-center text-[12px] tabular-nums text-ink">
                            {i.quantity}
                          </span>
                          <button
                            onClick={() => setQty(i.product_id, i.quantity + 1)}
                            disabled={i.quantity >= i.stock}
                            className="px-2.5 py-1.5 text-ink/60 hover:text-ink disabled:opacity-30"
                            aria-label="Increase"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        {i.quantity >= i.stock && (
                          <span className="text-[10px] uppercase tracking-[0.1em] text-ink/35">
                            max
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-ink/10 px-6 py-5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] uppercase tracking-[0.14em] text-ink/55">
                  subtotal
                </span>
                <span className="font-display text-lg text-ink">{formatINR(subtotal)}</span>
              </div>
              <p className="mt-1 text-[11px] lowercase tracking-[0.08em] text-ink/40">
                shipping calculated at checkout
              </p>
              <button
                onClick={goCheckout}
                className="mt-4 w-full rounded-full bg-ink py-3.5 text-[12px] uppercase tracking-[0.16em] text-paper transition hover:bg-ink/90"
              >
                checkout
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
