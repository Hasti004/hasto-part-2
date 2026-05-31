import type { ShopifyProduct, ShopifyVariant } from "./shopifyProducts";

export type ShopifyVariantMapped = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
  price: number;
  compareAtPrice: number | null;
  currency: string;
  image: string | null;
  imageAlt: string | null;
};

export type HastoProduct = {
  id: string;
  shopifyId: string;
  slug: string;
  handle: string;
  name: string;
  title: string;
  tagline: string | null;
  description: string | null;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  material: string | null;
  category: string;
  tags: string[];
  image: string | null;
  hover_image: string | null;
  images: string[];
  price: number;
  compare_at_price: number | null;
  currency: string;
  badge: string | null;
  status: "active" | "out_of_stock" | "discontinued";
  stock_quantity: number;
  availableForSale: boolean;
  inStock: boolean;
  variantId: string;
  variants: ShopifyVariantMapped[];
  collections: { id: string; title: string; handle: string }[];
  onlineStoreUrl: string | null;
  raw: ShopifyProduct;
};

const BADGE_TAGS = new Set(["new", "bestseller", "limited"]);

function firstSentence(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^[^.!?]+[.!?]?/);
  return match ? match[0].trim() : trimmed.slice(0, 120);
}

function mapVariant(variant: ShopifyVariant): ShopifyVariantMapped {
  return {
    id: variant.id,
    title: variant.title,
    availableForSale: variant.availableForSale,
    selectedOptions: variant.selectedOptions,
    price: Number(variant.price.amount),
    compareAtPrice: variant.compareAtPrice
      ? Number(variant.compareAtPrice.amount)
      : null,
    currency: variant.price.currencyCode,
    image: variant.image?.url ?? null,
    imageAlt: variant.image?.altText ?? null,
  };
}

function badgeFromTags(tags: string[]): string | null {
  const hit = tags.find((t) => BADGE_TAGS.has(t.toLowerCase()));
  return hit ?? null;
}

function stockFromVariant(variant: ShopifyVariantMapped | undefined) {
  if (!variant?.availableForSale) return 0;
  // Inventory quantity unavailable without unauthenticated_read_product_inventory.
  return 99;
}

export function mapShopifyProduct(product: ShopifyProduct): HastoProduct {
  const variants = product.variants.nodes.map(mapVariant);
  const firstVariant = variants[0];
  const firstAvailable =
    variants.find((v) => v.availableForSale) ?? firstVariant;

  const price = firstAvailable?.price ?? Number(product.priceRange.minVariantPrice.amount);
  const compareAt =
    firstAvailable?.compareAtPrice ??
    (product.compareAtPriceRange?.minVariantPrice
      ? Number(product.compareAtPriceRange.minVariantPrice.amount)
      : null);

  const imageNodes = product.images.nodes;
  const featured = product.featuredImage?.url ?? imageNodes[0]?.url ?? null;
  const gallery = imageNodes.map((img) => img.url).filter(Boolean);
  const extraImages = gallery.filter((url) => url !== featured);

  const category =
    product.collections.nodes[0]?.handle ||
    product.productType.toLowerCase() ||
    "";

  const available = Boolean(firstAvailable?.availableForSale);
  const stock = stockFromVariant(firstAvailable);

  return {
    id: product.id,
    shopifyId: product.id,
    slug: product.handle,
    handle: product.handle,
    name: product.title,
    title: product.title,
    tagline: firstSentence(product.description),
    description: product.description || null,
    descriptionHtml: product.descriptionHtml,
    vendor: product.vendor,
    productType: product.productType,
    material: product.vendor || null,
    category,
    tags: product.tags ?? [],
    image: featured,
    hover_image: extraImages[0] ?? null,
    images: extraImages,
    price,
    compare_at_price: compareAt && compareAt > price ? compareAt : null,
    currency:
      firstAvailable?.currency ?? product.priceRange.minVariantPrice.currencyCode,
    badge: badgeFromTags(product.tags ?? []),
    status: available ? "active" : "out_of_stock",
    stock_quantity: stock,
    availableForSale: available,
    inStock: available,
    variantId: firstAvailable?.id ?? "",
    variants,
    collections: product.collections.nodes,
    onlineStoreUrl: product.onlineStoreUrl,
    raw: product,
  };
}

export type HastoCartLine = {
  lineId: string;
  product_id: string;
  variantId: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
  stock: number;
  currency: string;
};

export function mapShopifyCartLine(line: {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title?: string;
    availableForSale?: boolean;
    price?: { amount: string; currencyCode: string };
    image?: { url: string; altText: string | null } | null;
    product: {
      id: string;
      handle: string;
      title: string;
      featuredImage?: { url: string; altText: string | null } | null;
    };
  };
}): HastoCartLine {
  const merch = line.merchandise;
  const product = merch.product;
  const price = Number(merch.price?.amount ?? 0);
  const stock = merch.availableForSale ? 99 : 0;

  return {
    lineId: line.id,
    product_id: product.id,
    variantId: merch.id,
    slug: product.handle,
    name: product.title,
    price,
    image: merch.image?.url ?? product.featuredImage?.url ?? null,
    quantity: line.quantity,
    stock,
    currency: merch.price?.currencyCode ?? "INR",
  };
}

export function hastoProductForVariant(
  product: HastoProduct,
  variantId: string
): HastoProduct & { variantId: string } {
  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  if (!variant) return product;

  const stock = stockFromVariant(variant);
  return {
    ...product,
    variantId: variant.id,
    price: variant.price,
    compare_at_price:
      variant.compareAtPrice && variant.compareAtPrice > variant.price
        ? variant.compareAtPrice
        : null,
    availableForSale: variant.availableForSale,
    inStock: variant.availableForSale,
    stock_quantity: stock,
    status: variant.availableForSale ? "active" : "out_of_stock",
    image: variant.image ?? product.image,
  };
}
