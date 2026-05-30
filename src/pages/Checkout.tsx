import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../lib/cart";
import { useAuth } from "../lib/auth";
import { placeOrder } from "../lib/commerce";
import { supabase } from "../lib/supabase";
import { formatINR } from "../lib/products";

const inputCls =
  "w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-ink/40";

export function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { session } = useAuth();
  const navigate = useNavigate();

  const [f, setF] = useState({
    name: "",
    email: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    notes: "",
  });
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefill from the signed-in profile.
  useEffect(() => {
    if (!session) return;
    setF((cur) => ({ ...cur, email: cur.email || session.user.email || "" }));
    supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data)
          setF((cur) => ({
            ...cur,
            name: cur.name || data.full_name || "",
            phone: cur.phone || data.phone || "",
          }));
      });
  }, [session]);

  const set = (k: keyof typeof f, v: string) => setF((cur) => ({ ...cur, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setPlacing(true);
    try {
      const order = await placeOrder({
        name: f.name,
        email: f.email,
        phone: f.phone,
        line1: f.line1,
        line2: f.line2,
        city: f.city,
        state: f.state,
        pincode: f.pincode,
        notes: f.notes,
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
      });
      clear();
      navigate("/order-confirmed", { state: { order } });
    } catch (err) {
      setError((err as Error).message);
      setPlacing(false);
    }
  };

  if (items.length === 0) {
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

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          {/* form */}
          <form onSubmit={submit} className="space-y-6">
            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
            )}

            <fieldset className="space-y-4">
              <legend className="mb-2 text-[12px] uppercase tracking-[0.14em] text-ink/55">
                contact
              </legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <input required placeholder="Full name" value={f.name} onChange={(e) => set("name", e.target.value)} className={inputCls} />
                <input required type="email" placeholder="Email" value={f.email} onChange={(e) => set("email", e.target.value)} className={inputCls} />
              </div>
              <input required placeholder="Phone" value={f.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} />
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="mb-2 text-[12px] uppercase tracking-[0.14em] text-ink/55">
                shipping address
              </legend>
              <input required placeholder="Address line 1" value={f.line1} onChange={(e) => set("line1", e.target.value)} className={inputCls} />
              <input placeholder="Address line 2 (optional)" value={f.line2} onChange={(e) => set("line2", e.target.value)} className={inputCls} />
              <div className="grid gap-4 sm:grid-cols-3">
                <input required placeholder="City" value={f.city} onChange={(e) => set("city", e.target.value)} className={inputCls} />
                <input required placeholder="State" value={f.state} onChange={(e) => set("state", e.target.value)} className={inputCls} />
                <input required placeholder="PIN code" value={f.pincode} onChange={(e) => set("pincode", e.target.value)} className={inputCls} />
              </div>
              <textarea placeholder="Order notes (optional)" rows={2} value={f.notes} onChange={(e) => set("notes", e.target.value)} className={`${inputCls} resize-y`} />
            </fieldset>

            <div className="rounded-xl border border-ink/10 bg-paper px-4 py-3 text-sm text-ink/70">
              Payment method: <span className="font-medium text-ink">Cash on Delivery</span>
            </div>

            <button
              type="submit"
              disabled={placing}
              className="w-full rounded-full bg-ink py-3.5 text-[12px] uppercase tracking-[0.16em] text-paper transition hover:bg-ink/90 disabled:opacity-50"
            >
              {placing ? "placing order…" : `place order · ${formatINR(subtotal)}`}
            </button>
            {!session && (
              <p className="text-center text-[11px] lowercase tracking-[0.06em] text-ink/40">
                checking out as guest ·{" "}
                <Link to="/account/login" state={{ from: "/checkout" }} className="underline underline-offset-2">
                  sign in
                </Link>{" "}
                to save your order
              </p>
            )}
          </form>

          {/* summary */}
          <aside className="h-fit rounded-2xl border border-ink/10 bg-paper p-6">
            <h2 className="text-[12px] uppercase tracking-[0.14em] text-ink/55">
              your bag
            </h2>
            <ul className="mt-4 divide-y divide-ink/8">
              {items.map((i) => (
                <li key={i.product_id} className="flex gap-3 py-3">
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
              <Row label="Shipping" value="Free" />
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
