import { shopifyFetch } from "./shopify";
import {
  filterProductsByCategory,
  logShopifyCollectionDebug,
  resolveCollectionHandle,
} from "./collectionAliases";

export type ShopifyMoney = {
  amount: string;
  currencyCode: string;
};

export type ShopifyImage = {
  url: string;
  altText: string | null;
};

export type ShopifySelectedOption = {
  name: string;
  value: string;
};

export type ShopifyVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: ShopifySelectedOption[];
  price: ShopifyMoney;
  compareAtPrice: ShopifyMoney | null;
  image: ShopifyImage | null;
};

export type ShopifyCollection = {
  id: string;
  title: string;
  handle: string;
  image: ShopifyImage | null;
};

export type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  tags: string[];
  onlineStoreUrl: string | null;
  featuredImage: ShopifyImage | null;
  images: { nodes: ShopifyImage[] };
  priceRange: {
    minVariantPrice: ShopifyMoney;
    maxVariantPrice: ShopifyMoney;
  };
  compareAtPriceRange?: {
    minVariantPrice: ShopifyMoney;
    maxVariantPrice: ShopifyMoney;
  } | null;
  variants: { nodes: ShopifyVariant[] };
  collections: { nodes: Pick<ShopifyCollection, "id" | "title" | "handle">[] };
};

const PRODUCT_FRAGMENT = `
  id
  title
  handle
  description
  descriptionHtml
  vendor
  productType
  tags
  onlineStoreUrl
  featuredImage { url altText }
  images(first: 10) { nodes { url altText } }
  priceRange {
    minVariantPrice { amount currencyCode }
    maxVariantPrice { amount currencyCode }
  }
  compareAtPriceRange {
    minVariantPrice { amount currencyCode }
    maxVariantPrice { amount currencyCode }
  }
  variants(first: 50) {
    nodes {
      id
      title
      availableForSale
      selectedOptions { name value }
      price { amount currencyCode }
      compareAtPrice { amount currencyCode }
      image { url altText }
    }
  }
  collections(first: 10) {
    nodes { id title handle }
  }
`;

const PRODUCTS_QUERY = `
  query Products($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes { ${PRODUCT_FRAGMENT} }
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      ${PRODUCT_FRAGMENT}
    }
  }
`;

const PRODUCTS_BY_HANDLES_QUERY = `
  query ProductsByHandles($query: String!) {
    products(first: 50, query: $query) {
      nodes { ${PRODUCT_FRAGMENT} }
    }
  }
`;

const PRODUCTS_BY_IDS_QUERY = `
  query ProductsByIds($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        ${PRODUCT_FRAGMENT}
      }
    }
  }
`;

const COLLECTIONS_QUERY = `
  query Collections($first: Int!) {
    collections(first: $first) {
      nodes {
        id
        title
        handle
        image { url altText }
      }
    }
  }
`;

const COLLECTION_PRODUCTS_QUERY = `
  query CollectionProducts($handle: String!, $first: Int!, $after: String) {
    collection(handle: $handle) {
      products(first: $first, after: $after) {
        pageInfo { hasNextPage endCursor }
        nodes { ${PRODUCT_FRAGMENT} }
      }
    }
  }
`;

const FEATURED_PRODUCTS_QUERY = `
  query FeaturedProducts($query: String!) {
    products(first: 4, query: $query) {
      nodes { ${PRODUCT_FRAGMENT} }
    }
  }
`;

async function paginateProducts(
  fetchPage: (after: string | null) => Promise<{
    nodes: ShopifyProduct[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  }>
) {
  const all: ShopifyProduct[] = [];
  let after: string | null = null;
  let hasNext = true;

  while (hasNext) {
    const page = await fetchPage(after);
    all.push(...page.nodes);
    hasNext = page.pageInfo.hasNextPage;
    after = page.pageInfo.endCursor;
    if (!hasNext) break;
  }

  return all;
}

export async function getShopifyProducts(): Promise<ShopifyProduct[]> {
  return paginateProducts(async (after) => {
    const data = await shopifyFetch<{
      products: {
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
        nodes: ShopifyProduct[];
      };
    }>(PRODUCTS_QUERY, { first: 50, after });

    return data.products;
  });
}

export async function getShopifyProductByHandle(
  handle: string
): Promise<ShopifyProduct | null> {
  const data = await shopifyFetch<{ product: ShopifyProduct | null }>(
    PRODUCT_BY_HANDLE_QUERY,
    { handle }
  );
  return data.product;
}

export async function getShopifyProductsByHandles(
  handles: string[]
): Promise<ShopifyProduct[]> {
  if (!handles.length) return [];
  const query = handles.map((h) => `handle:${h}`).join(" OR ");
  const data = await shopifyFetch<{ products: { nodes: ShopifyProduct[] } }>(
    PRODUCTS_BY_HANDLES_QUERY,
    { query }
  );
  return data.products.nodes;
}

export async function getShopifyProductsByIds(
  ids: string[]
): Promise<ShopifyProduct[]> {
  if (!ids.length) return [];
  const data = await shopifyFetch<{ nodes: (ShopifyProduct | null)[] }>(
    PRODUCTS_BY_IDS_QUERY,
    { ids }
  );
  return data.nodes.filter((n): n is ShopifyProduct => Boolean(n?.id));
}

export async function getShopifyCollections(): Promise<ShopifyCollection[]> {
  try {
    const data = await shopifyFetch<{ collections: { nodes: ShopifyCollection[] } }>(
      COLLECTIONS_QUERY,
      { first: 50 }
    );
    return data.collections.nodes;
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn("[Shopify] Collections query failed, using alias fallback:", err);
    }
    return [];
  }
}

export async function getShopifyProductsByCollection(
  handle: string
): Promise<ShopifyProduct[]> {
  try {
    return await paginateProducts(async (after) => {
      const data = await shopifyFetch<{
        collection: {
          products: {
            pageInfo: { hasNextPage: boolean; endCursor: string | null };
            nodes: ShopifyProduct[];
          };
        } | null;
      }>(COLLECTION_PRODUCTS_QUERY, { handle, first: 50, after });

      if (!data.collection) {
        return { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } };
      }
      return data.collection.products;
    });
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn(`[Shopify] Collection products failed for "${handle}":`, err);
    }
    return [];
  }
}

export async function getProductsForRoute(
  routeCategory: string,
  collections: ShopifyCollection[] = []
): Promise<{
  products: ShopifyProduct[];
  resolvedHandle: string;
  usedFallback: boolean;
  source: "collection" | "fallback";
}> {
  const resolvedHandle = resolveCollectionHandle(routeCategory, collections);
  let products = resolvedHandle
    ? await getShopifyProductsByCollection(resolvedHandle)
    : [];
  let usedFallback = false;
  let source: "collection" | "fallback" = "collection";

  if (products.length === 0) {
    const all = await getShopifyProducts();
    products = filterProductsByCategory(all, routeCategory);
    usedFallback = true;
    source = "fallback";
  }

  return { products, resolvedHandle, usedFallback, source };
}

export async function getShopifyHomeProducts(
  limit = 4
): Promise<{ products: ShopifyProduct[]; source: string }> {
  let collections: ShopifyCollection[] = [];
  try {
    collections = await getShopifyCollections();
  } catch {
    collections = [];
  }

  const homeHandle = resolveCollectionHandle("home", collections);

  if (homeHandle) {
    try {
      const fromCollection = await getShopifyProductsByCollection(homeHandle);
      if (fromCollection.length > 0) {
        logShopifyCollectionDebug({
          routeCategory: "home",
          availableCollections: collections.map((c) => ({
            title: c.title,
            handle: c.handle,
          })),
          resolvedHandle: homeHandle,
          productsCount: fromCollection.length,
          usedFallback: false,
          source: "home-page-collection",
        });
        return { products: fromCollection.slice(0, limit), source: "home-page-collection" };
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn("[Shopify] Home collection fetch failed:", err);
      }
    }
  }

  try {
    const data = await shopifyFetch<{ products: { nodes: ShopifyProduct[] } }>(
      FEATURED_PRODUCTS_QUERY,
      { query: "tag:featured" }
    );
    const tagged = data.products.nodes;
    if (tagged.length > 0) {
      logShopifyCollectionDebug({
        routeCategory: "home",
        availableCollections: collections.map((c) => ({
          title: c.title,
          handle: c.handle,
        })),
        resolvedHandle: homeHandle,
        productsCount: tagged.length,
        usedFallback: true,
        source: "featured-tag",
      });
      return { products: tagged.slice(0, limit), source: "featured-tag" };
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn("[Shopify] Featured tag query failed:", err);
    }
  }

  try {
    const all = await getShopifyProducts();
    logShopifyCollectionDebug({
      routeCategory: "home",
      availableCollections: collections.map((c) => ({
        title: c.title,
        handle: c.handle,
      })),
      resolvedHandle: homeHandle,
      productsCount: Math.min(all.length, limit),
      usedFallback: true,
      source: "all-products",
    });
    return { products: all.slice(0, limit), source: "all-products" };
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn("[Shopify] All products fallback failed:", err);
    }
    return { products: [], source: "none" };
  }
}

export async function getShopifyFeaturedProducts(
  limit = 4
): Promise<ShopifyProduct[]> {
  const data = await shopifyFetch<{ products: { nodes: ShopifyProduct[] } }>(
    FEATURED_PRODUCTS_QUERY,
    { query: "tag:featured" }
  );
  const tagged = data.products.nodes;
  if (tagged.length >= limit) return tagged.slice(0, limit);

  const all = await getShopifyProducts();
  const seen = new Set(tagged.map((p) => p.id));
  const rest = all.filter((p) => !seen.has(p.id));
  return [...tagged, ...rest].slice(0, limit);
}

export async function getShopifyRecommendations(
  collectionHandle: string,
  excludeId: string,
  collections: ShopifyCollection[] = [],
  limit = 4
): Promise<ShopifyProduct[]> {
  try {
    const resolvedHandle = resolveCollectionHandle(collectionHandle, collections);
    let products = resolvedHandle
      ? await getShopifyProductsByCollection(resolvedHandle)
      : [];

    if (products.length === 0) {
      const all = await getShopifyProducts();
      products = filterProductsByCategory(all, collectionHandle);
    }

    return products.filter((p) => p.id !== excludeId).slice(0, limit);
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn("[Shopify] Recommendations failed:", err);
    }
    return [];
  }
}
