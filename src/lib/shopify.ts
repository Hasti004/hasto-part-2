type ShopifyUserError = { field?: string[] | null; message: string };

type ShopifyFetchResult<T> = {
  data?: T;
  errors?: { message: string }[];
};

function getShopifyConfig() {
  const domain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN;
  const token = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const version = import.meta.env.VITE_SHOPIFY_API_VERSION;

  if (!domain || !token || !version) {
    const missing = [
      !domain && "VITE_SHOPIFY_STORE_DOMAIN",
      !token && "VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN",
      !version && "VITE_SHOPIFY_API_VERSION",
    ].filter(Boolean);

    const message = `Missing Shopify env: ${missing.join(", ")}. Add them to .env.local`;
    if (import.meta.env.DEV) console.error(message);
    throw new Error(message);
  }

  return { domain, token, version };
}

function collectUserErrors(payload: Record<string, unknown> | null | undefined): ShopifyUserError[] {
  if (!payload || typeof payload !== "object") return [];
  const errors: ShopifyUserError[] = [];
  for (const value of Object.values(payload)) {
    if (
      value &&
      typeof value === "object" &&
      "userErrors" in value &&
      Array.isArray((value as { userErrors?: ShopifyUserError[] }).userErrors)
    ) {
      errors.push(...((value as { userErrors: ShopifyUserError[] }).userErrors ?? []));
    }
  }
  return errors;
}

export async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const { domain, token, version } = getShopifyConfig();
  const endpoint = `https://${domain}/api/${version}/graphql.json`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({ query, variables }),
    });
  } catch (err) {
    const message = "Unable to reach Shopify. Check your network connection.";
    if (import.meta.env.DEV) console.error(message, err);
    throw new Error(message);
  }

  if (!response.ok) {
    const message = `Shopify request failed (${response.status})`;
    if (import.meta.env.DEV) console.error(message);
    throw new Error(message);
  }

  const json = (await response.json()) as ShopifyFetchResult<T>;

  if (json.errors?.length) {
    const message = json.errors.map((e) => e.message).join("; ");
    if (import.meta.env.DEV) console.error("Shopify GraphQL errors:", message);
    throw new Error(message);
  }

  const userErrors = collectUserErrors(json.data as Record<string, unknown> | undefined);
  if (userErrors.length) {
    const message = userErrors.map((e) => e.message).join("; ");
    if (import.meta.env.DEV) console.error("Shopify userErrors:", message);
    throw new Error(message);
  }

  if (!json.data) {
    throw new Error("Shopify returned no data.");
  }

  return json.data;
}
