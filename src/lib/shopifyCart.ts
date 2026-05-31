import { shopifyFetch } from "./shopify";
import { mapShopifyCartLine, type HastoCartLine } from "./mapShopifyProduct";

export const CART_ID_KEY = "shopify_cart_id";
export const CHECKOUT_URL_KEY = "shopify_checkout_url";

export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: HastoCartLine[];
  subtotal: number;
  currency: string;
};

const CART_LINE_FRAGMENT = `
  id
  quantity
  merchandise {
    ... on ProductVariant {
      id
      title
      availableForSale
      price { amount currencyCode }
      image { url altText }
      product {
        id
        handle
        title
        featuredImage { url altText }
      }
    }
  }
`;

const CART_FRAGMENT = `
  id
  checkoutUrl
  totalQuantity
  cost {
    subtotalAmount { amount currencyCode }
  }
  lines(first: 50) {
    nodes { ${CART_LINE_FRAGMENT} }
  }
`;

const CART_CREATE = `
  mutation CartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart { ${CART_FRAGMENT} }
      userErrors { field message }
    }
  }
`;

const CART_LINES_ADD = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ${CART_FRAGMENT} }
      userErrors { field message }
    }
  }
`;

const CART_QUERY = `
  query Cart($cartId: ID!) {
    cart(id: $cartId) { ${CART_FRAGMENT} }
  }
`;

const CART_LINES_UPDATE = `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ${CART_FRAGMENT} }
      userErrors { field message }
    }
  }
`;

const CART_LINES_REMOVE = `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ${CART_FRAGMENT} }
      userErrors { field message }
    }
  }
`;

type RawCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: { amount: string; currencyCode: string } };
  lines: { nodes: Parameters<typeof mapShopifyCartLine>[0][] };
};

function mapCart(cart: RawCart): ShopifyCart {
  const lines = cart.lines.nodes.map(mapShopifyCartLine);
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity,
    lines,
    subtotal: Number(cart.cost.subtotalAmount.amount),
    currency: cart.cost.subtotalAmount.currencyCode,
  };
}

export function persistCart(cart: ShopifyCart) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_ID_KEY, cart.id);
  localStorage.setItem(CHECKOUT_URL_KEY, cart.checkoutUrl);
}

export function getStoredCartId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CART_ID_KEY);
}

export function getStoredCheckoutUrl(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CHECKOUT_URL_KEY);
}

export function clearBrokenCart() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_ID_KEY);
  localStorage.removeItem(CHECKOUT_URL_KEY);
}

function isInvalidCartError(err: unknown) {
  const msg = err instanceof Error ? err.message.toLowerCase() : "";
  return (
    msg.includes("cart") &&
    (msg.includes("not found") ||
      msg.includes("invalid") ||
      msg.includes("does not exist"))
  );
}

export async function createCart(
  variantId: string,
  quantity: number
): Promise<ShopifyCart> {
  const data = await shopifyFetch<{ cartCreate: { cart: RawCart | null } }>(
    CART_CREATE,
    { lines: [{ merchandiseId: variantId, quantity }] }
  );
  if (!data.cartCreate.cart) throw new Error("Could not create cart.");
  const cart = mapCart(data.cartCreate.cart);
  persistCart(cart);
  return cart;
}

export async function addToCart(
  cartId: string,
  variantId: string,
  quantity: number
): Promise<ShopifyCart> {
  try {
    const data = await shopifyFetch<{ cartLinesAdd: { cart: RawCart | null } }>(
      CART_LINES_ADD,
      { cartId, lines: [{ merchandiseId: variantId, quantity }] }
    );
    if (!data.cartLinesAdd.cart) throw new Error("Could not add to cart.");
    const cart = mapCart(data.cartLinesAdd.cart);
    persistCart(cart);
    return cart;
  } catch (err) {
    if (isInvalidCartError(err)) {
      clearBrokenCart();
      return createCart(variantId, quantity);
    }
    throw err;
  }
}

export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  try {
    const data = await shopifyFetch<{ cart: RawCart | null }>(CART_QUERY, {
      cartId,
    });
    if (!data.cart) {
      clearBrokenCart();
      return null;
    }
    const cart = mapCart(data.cart);
    persistCart(cart);
    return cart;
  } catch (err) {
    if (isInvalidCartError(err)) {
      clearBrokenCart();
      return null;
    }
    throw err;
  }
}

export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number
): Promise<ShopifyCart> {
  try {
    const data = await shopifyFetch<{ cartLinesUpdate: { cart: RawCart | null } }>(
      CART_LINES_UPDATE,
      { cartId, lines: [{ id: lineId, quantity }] }
    );
    if (!data.cartLinesUpdate.cart) throw new Error("Could not update cart.");
    const cart = mapCart(data.cartLinesUpdate.cart);
    persistCart(cart);
    return cart;
  } catch (err) {
    if (isInvalidCartError(err)) {
      clearBrokenCart();
      throw new Error("Your bag expired. Please add items again.");
    }
    throw err;
  }
}

export async function removeCartLine(
  cartId: string,
  lineId: string
): Promise<ShopifyCart> {
  try {
    const data = await shopifyFetch<{ cartLinesRemove: { cart: RawCart | null } }>(
      CART_LINES_REMOVE,
      { cartId, lineIds: [lineId] }
    );
    if (!data.cartLinesRemove.cart) throw new Error("Could not remove item.");
    const cart = mapCart(data.cartLinesRemove.cart);
    persistCart(cart);
    return cart;
  } catch (err) {
    if (isInvalidCartError(err)) {
      clearBrokenCart();
      throw new Error("Your bag expired. Please add items again.");
    }
    throw err;
  }
}
