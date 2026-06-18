import { useEffect, useState } from "react";
import { Slide } from "../components/Slide";
import { Feature, Closing, type FeatureItem } from "../components/Slides";
import { MoodboardHero } from "../components/MoodboardHero";
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
      <Slide z={10} tone="light">
        <MoodboardHero />
      </Slide>

      <Slide z={20} id="collection" tone="light">
        <ShopFloat />
      </Slide>

      {featured[0] && (
        <Slide z={30} tone="dark">
          <Feature item={featured[0]} align="right" indexLabel="01 / 02" />
        </Slide>
      )}

      {featured[1] && (
        <Slide z={40} tone="dark">
          <Feature item={featured[1]} align="left" indexLabel="02 / 02" />
        </Slide>
      )}

      <Slide z={60} pinned={false} tone="light">
        <Closing />
      </Slide>
    </main>
  );
}
