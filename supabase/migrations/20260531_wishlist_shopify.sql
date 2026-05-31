-- Run in Supabase SQL editor before using wishlist with Shopify products.
-- Stores Shopify product GIDs (gid://shopify/Product/...) instead of Supabase UUIDs.

ALTER TABLE wishlists DROP CONSTRAINT IF EXISTS wishlists_product_id_fkey;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wishlists' AND column_name = 'product_id'
  ) THEN
    ALTER TABLE wishlists RENAME COLUMN product_id TO shopify_product_id;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS wishlists_user_product
  ON wishlists (user_id, shopify_product_id);
