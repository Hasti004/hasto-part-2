import { useCallback, useEffect, useState } from "react";
import {
  getShopifyCollections,
  type ShopifyCollection,
} from "../lib/shopifyProducts";

export function useShopifyCollections() {
  const [collections, setCollections] = useState<ShopifyCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCollections(await getShopifyCollections());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load collections.");
      setCollections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { collections, loading, error, refetch };
}
