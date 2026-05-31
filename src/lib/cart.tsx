import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { HastoCartLine, HastoProduct } from "./mapShopifyProduct";
import {
  addToCart as shopifyAddToCart,
  createCart,
  getCart,
  getStoredCartId,
  getStoredCheckoutUrl,
  removeCartLine,
  updateCartLine,
  clearBrokenCart,
  type ShopifyCart,
} from "./shopifyCart";

export type CartItem = HastoCartLine;

type CartProductInput = Pick<
  HastoProduct,
  "id" | "slug" | "name" | "price" | "image" | "stock_quantity" | "variantId"
> & { variantId: string };

type CartState = {
  items: CartItem[];
  count: number;
  subtotal: number;
  checkoutUrl: string | null;
  loading: boolean;
  adding: boolean;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (p: CartProductInput, qty?: number) => Promise<void>;
  remove: (lineId: string) => Promise<void>;
  setQty: (lineId: string, qty: number) => Promise<void>;
  clear: () => void;
  goToCheckout: () => void;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartState | null>(null);

function applyCart(setters: {
  setItems: (items: CartItem[]) => void;
  setCheckoutUrl: (url: string | null) => void;
  setSubtotal: (n: number) => void;
  setCount: (n: number) => void;
}, cart: ShopifyCart | null) {
  if (!cart) {
    setters.setItems([]);
    setters.setCheckoutUrl(null);
    setters.setSubtotal(0);
    setters.setCount(0);
    return;
  }
  setters.setItems(cart.lines);
  setters.setCheckoutUrl(cart.checkoutUrl);
  setters.setSubtotal(cart.subtotal);
  setters.setCount(cart.totalQuantity);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(
    () => getStoredCheckoutUrl()
  );
  const [subtotal, setSubtotal] = useState(0);
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const setters = { setItems, setCheckoutUrl, setSubtotal, setCount };

  const refreshCart = useCallback(async () => {
    setLoading(true);
    try {
      const cartId = getStoredCartId();
      if (!cartId) {
        applyCart(setters, null);
        return;
      }
      const cart = await getCart(cartId);
      applyCart(setters, cart);
    } catch {
      clearBrokenCart();
      applyCart(setters, null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCart();
  }, [refreshCart]);

  const add: CartState["add"] = async (p, qty = 1) => {
    if (!p.variantId) return;
    setAdding(true);
    try {
      const cartId = getStoredCartId();
      const cart = cartId
        ? await shopifyAddToCart(cartId, p.variantId, qty)
        : await createCart(p.variantId, qty);
      applyCart(setters, cart);
      setOpen(true);
    } finally {
      setAdding(false);
    }
  };

  const remove: CartState["remove"] = async (lineId) => {
    const cartId = getStoredCartId();
    if (!cartId) return;
    setLoading(true);
    try {
      const cart = await removeCartLine(cartId, lineId);
      applyCart(setters, cart);
    } finally {
      setLoading(false);
    }
  };

  const setQty: CartState["setQty"] = async (lineId, qty) => {
    const cartId = getStoredCartId();
    if (!cartId) return;
    if (qty <= 0) {
      await remove(lineId);
      return;
    }
    setLoading(true);
    try {
      const cart = await updateCartLine(cartId, lineId, qty);
      applyCart(setters, cart);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    clearBrokenCart();
    applyCart(setters, null);
  };

  const goToCheckout = () => {
    const url = checkoutUrl || getStoredCheckoutUrl();
    if (!url) return;
    window.location.href = url;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        subtotal,
        checkoutUrl,
        loading,
        adding,
        open,
        setOpen,
        add,
        remove,
        setQty,
        clear,
        goToCheckout,
        refreshCart,
      }}
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
