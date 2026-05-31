import { useCallback, useEffect, useState } from "react";
import { mapShopifyProduct, type HastoProduct } from "../lib/mapShopifyProduct";
import {
  logShopifyCollectionDebug,
} from "../lib/collectionAliases";
import {
  getProductsForRoute,
  type ShopifyCollection,
} from "../lib/shopifyProducts";

export function useShopifyCollectionProducts(
  routeCategory: string | undefined,
  collections: ShopifyCollection[] = [],
  collectionsLoading = false
) {
  const [products, setProducts] = useState<HastoProduct[] | null>(null);
  const [loading, setLoading] = useState(Boolean(routeCategory));
  const [error, setError] = useState<string | null>(null);
  const [resolvedHandle, setResolvedHandle] = useState("");
  const [usedFallback, setUsedFallback] = useState(false);

  const refetch = useCallback(async () => {
    if (!routeCategory) {
      setProducts([]);
      setLoading(false);
      return;
    }

    if (collectionsLoading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getProductsForRoute(routeCategory, collections);
      setResolvedHandle(result.resolvedHandle);
      setUsedFallback(result.usedFallback);
      setProducts(result.products.map(mapShopifyProduct));

      logShopifyCollectionDebug({
        routeCategory,
        availableCollections: collections.map((c) => ({
          title: c.title,
          handle: c.handle,
        })),
        resolvedHandle: result.resolvedHandle,
        productsCount: result.products.length,
        usedFallback: result.usedFallback,
        source: result.source,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load products.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [routeCategory, collections, collectionsLoading]);

  useEffect(() => {
    setProducts(null);
    void refetch();
  }, [refetch]);

  return { products, loading, error, refetch, resolvedHandle, usedFallback };
}
