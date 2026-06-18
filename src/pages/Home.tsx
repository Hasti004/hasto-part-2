import { useEffect, useState } from "react";
import { Slide } from "../components/Slide";
import { Feature, Closing, type FeatureItem } from "../components/Slides";
import { Cover } from "../components/magazine/Cover";
import { Contents } from "../components/magazine/Contents";
import { Letter } from "../components/magazine/Letter";
import { ShopFloat } from "../components/ShopFloat";
import { getShopifyHomeProducts } from "../lib/shopifyProducts";
import { mapShopifyProduct } from "../lib/mapShopifyProduct";

export function Home() {
  const [featured, setFeatured] = useState<FeatureItem[]>([]);

  useEffect(() => {
    getShopifyHomeProducts(4)
      .then(({ products: rows }) => {
        const items: FeatureItem[] = rows
          .map(mapShopifyProduct)
          .filter((r) => r.image)
          .slice(0, 2)
          .map((r) => ({
            image: r.image as string,
            name: r.name,
            slug: r.slug,
            price: Number(r.price),
            tagline: r.tagline ?? "",
            category: r.category,
          }));
        setFeatured(items);
      })
      .catch(() => setFeatured([]));
  }, []);

  return (
    <main className="relative">
      {/* Issue 01 — magazine front matter */}
      <Slide z={10} tone="light">
        <Cover />
      </Slide>

      <Slide z={20} tone="light">
        <Contents />
      </Slide>

      <Slide z={30} tone="light">
        <Letter />
      </Slide>

      {/* shop section — kept from old; gets a magazine redesign next pass */}
      <Slide z={40} id="collection" tone="light">
        <ShopFloat />
      </Slide>

      {featured[0] && (
        <Slide z={50} tone="dark">
          <Feature item={featured[0]} align="right" indexLabel="01 / 02" />
        </Slide>
      )}

      <Slide z={70} pinned={false} tone="light">
        <Closing />
      </Slide>
    </main>
  );
}
