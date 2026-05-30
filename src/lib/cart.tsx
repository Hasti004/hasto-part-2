import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { syncCart, type ProductRow } from "./commerce";

export type CartItem = {
  product_id: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
  stock: number;
};

type CartProductInput = Pick<
  ProductRow,
  "id" | "slug" | "name" | "price" | "image" | "stock_quantity"
>;

type CartState = {
  items: CartItem[];
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (p: CartProductInput, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartState | null>(null);
const STORAGE_KEY = "hasto_cart";

function load(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(load);
  const [open, setOpen] = useState(false);
  const syncTimer = useRef<number | undefined>(undefined);

  // Persist locally + mirror to DB (debounced) on every change.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.clearTimeout(syncTimer.current);
    syncTimer.current = window.setTimeout(() => {
      void syncCart(
        items.map((i) => ({ product_id: i.product_id, quantity: i.quantity }))
      );
    }, 600);
    return () => window.clearTimeout(syncTimer.current);
  }, [items]);

  const add: CartState["add"] = (p, qty = 1) => {
    setItems((cur) => {
      const existing = cur.find((i) => i.product_id === p.id);
      const cap = Math.max(1, p.stock_quantity || 99);
      if (existing) {
        return cur.map((i) =>
          i.product_id === p.id
            ? { ...i, quantity: Math.min(cap, i.quantity + qty) }
            : i
        );
      }
      return [
        ...cur,
        {
          product_id: p.id,
          slug: p.slug,
          name: p.name,
          price: Number(p.price),
          image: p.image,
          quantity: Math.min(cap, qty),
          stock: p.stock_quantity,
        },
      ];
    });
    setOpen(true);
  };

  const remove: CartState["remove"] = (productId) =>
    setItems((cur) => cur.filter((i) => i.product_id !== productId));

  const setQty: CartState["setQty"] = (productId, qty) =>
    setItems((cur) =>
      cur
        .map((i) =>
          i.product_id === productId
            ? { ...i, quantity: Math.max(0, Math.min(i.stock || 99, qty)) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );

  const clear = () => setItems([]);

  const count = items.reduce((n, i) => n + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, count, subtotal, open, setOpen, add, remove, setQty, clear }}
    >
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
