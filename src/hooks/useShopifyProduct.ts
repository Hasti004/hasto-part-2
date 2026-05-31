import { useCallback, useEffect, useState } from "react";
import { mapShopifyProduct, type HastoProduct } from "../lib/mapShopifyProduct";
import { getShopifyProductByHandle } from "../lib/shopifyProducts";

export function useShopifyProduct(handle: string | undefined) {
  const [product, setProduct] = useState<HastoProduct | null | undefined>(undefined);
  const [loading, setLoading] = useState(Boolean(handle));
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!handle) {
      setProduct(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const row = await getShopifyProductByHandle(handle);
      setProduct(row ? mapShopifyProduct(row) : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load product.");
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [handle]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { product, loading, error, refetch };
}
