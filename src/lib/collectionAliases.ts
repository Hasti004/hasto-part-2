import type { ShopifyCollection, ShopifyProduct } from "./shopifyProducts";

export const COLLECTION_ALIASES: Record<string, string[]> = {
  necklaces: ["necklace", "necklaces"],
  necklace: ["necklace", "necklaces"],
  rings: ["rings", "ring"],
  ring: ["rings", "ring"],
  bracelets: ["bracelets", "bracelet"],
  bracelet: ["bracelets", "bracelet"],
  earrings: ["earrings", "earring"],
  earring: ["earrings", "earring"],
  home: ["home-page", "home page", "homepage", "featured"],
  "home-page": ["home-page", "home page", "homepage", "featured"],
};

export function normalizeHandle(value: string | null | undefined): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type CollectionLike = Pick<ShopifyCollection, "handle" | "title">;

function findCollectionByNormalized(
  collections: CollectionLike[],
  normalized: string
): CollectionLike | undefined {
  return collections.find(
    (collection) =>
      normalizeHandle(collection.handle) === normalized ||
      normalizeHandle(collection.title) === normalized
  );
}

export function resolveCollectionHandle(
  input: string | undefined,
  collections: CollectionLike[] = []
): string {
  const normalizedInput = normalizeHandle(input);
  if (!normalizedInput) return "";

  const direct = findCollectionByNormalized(collections, normalizedInput);
  if (direct) return direct.handle;

  const aliases = COLLECTION_ALIASES[normalizedInput] || [];
  for (const alias of aliases) {
    const matched = findCollectionByNormalized(collections, normalizeHandle(alias));
    if (matched) return matched.handle;
  }

  return normalizedInput;
}

export function getCategoryKeywords(routeSlug: string | undefined): string[] {
  const normalized = normalizeHandle(routeSlug);
  if (!normalized) return [];

  const aliases = COLLECTION_ALIASES[normalized] || [normalized];
  const keywords = new Set<string>([normalized, ...aliases.map(normalizeHandle)]);
  return Array.from(keywords).filter(Boolean);
}

function textMatchesKeyword(text: string, keyword: string): boolean {
  const normalizedText = normalizeHandle(text);
  const normalizedKeyword = normalizeHandle(keyword);
  if (!normalizedKeyword) return false;
  return (
    normalizedText === normalizedKeyword ||
    normalizedText.includes(normalizedKeyword) ||
    normalizedKeyword.includes(normalizedText)
  );
}

function productMatchesKeywords(product: ShopifyProduct, keywords: string[]): boolean {
  const fields: string[] = [
    product.handle,
    product.title,
    product.productType,
    ...product.tags,
    ...product.collections.nodes.flatMap((c) => [c.handle, c.title]),
  ];

  return keywords.some((keyword) =>
    fields.some((field) => textMatchesKeyword(field, keyword))
  );
}

export function filterProductsByCategory(
  products: ShopifyProduct[],
  routeSlug: string | undefined
): ShopifyProduct[] {
  const keywords = getCategoryKeywords(routeSlug);
  if (!keywords.length) return [];
  return products.filter((product) => productMatchesKeywords(product, keywords));
}

export type ShopifyCollectionDebug = {
  routeCategory: string;
  availableCollections: { title: string; handle: string }[];
  resolvedHandle: string;
  productsCount: number;
  usedFallback: boolean;
  source?: string;
};

export function logShopifyCollectionDebug(payload: ShopifyCollectionDebug) {
  if (!import.meta.env.DEV) return;
  console.log("[Shopify Collection Debug]", payload);
}

export function findShopifyProductForPiece(
  products: ShopifyProduct[],
  piece: { name: string; handle?: string },
  slugify: (name: string) => string
): ShopifyProduct | undefined {
  const candidates = [
    piece.handle,
    slugify(piece.name),
    normalizeHandle(piece.name),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    const normalized = normalizeHandle(candidate);
    const byHandle = products.find((p) => normalizeHandle(p.handle) === normalized);
    if (byHandle) return byHandle;

    const byTitle = products.find((p) => normalizeHandle(p.title) === normalized);
    if (byTitle) return byTitle;
  }

  const keywords = piece.name
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => ["ring", "rings", "necklace", "necklaces", "bracelet", "bracelets", "bangle", "bangles", "pendant"].includes(word));

  if (keywords.length) {
    return products.find((product) => productMatchesKeywords(product, keywords));
  }

  return undefined;
}
