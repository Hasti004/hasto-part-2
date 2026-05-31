import { useCallback, useEffect, useState } from "react";
import { mapShopifyProduct, type HastoProduct } from "../lib/mapShopifyProduct";
import { getShopifyProducts } from "../lib/shopifyProducts";

export function useShopifyProducts() {
  const [products, setProducts] = useState<HastoProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await getShopifyProducts();
      setProducts(rows.map(mapShopifyProduct));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load products.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { products, loading, error, refetch };
}
