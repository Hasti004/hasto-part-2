import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./auth";
import {
  fetchWishlistProductIds,
  addToWishlist,
  removeFromWishlist,
} from "./commerce";

type WishlistState = {
  ids: Set<string>;
  count: number;
  has: (productId: string) => boolean;
  /** Returns false if the user needs to sign in first. */
  toggle: (productId: string) => Promise<boolean>;
  refresh: () => void;
};

const WishlistContext = createContext<WishlistState | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());

  const refresh = () => {
    if (!session) {
      setIds(new Set());
      return;
    }
    fetchWishlistProductIds()
      .then((list) => setIds(new Set(list)))
      .catch(() => setIds(new Set()));
  };

  useEffect(refresh, [session]);

  const toggle: WishlistState["toggle"] = async (productId) => {
    if (!session) return false;
    const userId = session.user.id;
    const next = new Set(ids);
    if (next.has(productId)) {
      next.delete(productId);
      setIds(next);
      await removeFromWishlist(userId, productId).catch(refresh);
    } else {
      next.add(productId);
      setIds(next);
      await addToWishlist(userId, productId).catch(refresh);
    }
    return true;
  };

  return (
    <WishlistContext.Provider
      value={{ ids, count: ids.size, has: (id) => ids.has(id), toggle, refresh }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
