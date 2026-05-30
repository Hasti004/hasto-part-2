import { Link, useLocation } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import type { OrderRow } from "../lib/commerce";
import { formatINR } from "../lib/products";

export function OrderConfirmation() {
  const { state } = useLocation();
  const order = (state as { order?: OrderRow } | null)?.order;

  if (!order) {
    return (
      <main className="flex min-h-[100svh] flex-col items-center justify-center gap-4 bg-paper text-center">
        <h1 className="font-display text-3xl text-ink">No order to show</h1>
        <Link to="/" className="text-[12px] uppercase tracking-[0.14em] text-ink underline underline-offset-4">
          back home
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-paper px-6 pt-24 text-ink">
      <div className="w-full max-w-lg text-center">
        <CheckCircle2 size={44} strokeWidth={1.3} className="mx-auto text-green-600" />
        <h1 className="mt-5 font-display text-4xl">Order placed</h1>
        <p className="mt-2 text-sm text-ink/55">
          Thank you, {order.customer_name.split(" ")[0]}. A confirmation has been noted
          for <span className="text-ink">{order.customer_email}</span>.
        </p>

        <div className="mt-8 rounded-2xl border border-ink/10 bg-paper p-6 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[12px] uppercase tracking-[0.14em] text-ink/45">
              order
            </span>
            <span className="font-display text-lg text-ink">{order.order_number}</span>
          </div>
          <div className="mt-4 space-y-2 border-t border-ink/10 pt-4 text-sm text-ink/70">
            <div className="flex justify-between">
              <span>Total</span>
              <span className="font-display text-ink">{formatINR(Number(order.total))}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment</span>
              <span>Cash on Delivery</span>
            </div>
            <div className="flex justify-between">
              <span>Ship to</span>
              <span className="text-right">
                {[order.city, order.state, order.pincode].filter(Boolean).join(", ")}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/account"
            className="rounded-full border border-ink/15 px-6 py-2.5 text-[12px] uppercase tracking-[0.14em] text-ink/70 transition hover:border-ink/40"
          >
            my orders
          </Link>
          <Link
            to="/"
            className="rounded-full bg-ink px-6 py-2.5 text-[12px] uppercase tracking-[0.14em] text-paper transition hover:bg-ink/90"
          >
            continue shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
