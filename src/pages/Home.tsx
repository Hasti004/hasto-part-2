import { useEffect, useState } from "react";
import { Slide } from "../components/Slide";
import { Intro, Feature, Closing, type FeatureItem } from "../components/Slides";
import { ShopFloat } from "../components/ShopFloat";
import { fetchFeaturedProducts } from "../lib/commerce";

export function Home() {
  const [featured, setFeatured] = useState<FeatureItem[]>([]);

  // Two live products for the editorial feature slides (newest, active only).
  useEffect(() => {
    fetchFeaturedProducts(4)
      .then((rows) => {
        const items: FeatureItem[] = rows
          .filter((r) => r.image)
          .slice(0, 2)
          .map((r) => ({
            image: r.image as string,
            name: r.name,
            slug: r.slug,
            price: Number(r.price),
            tagline: r.tagline,
            category: r.category,
          }));
        setFeatured(items);
      })
      .catch(() => setFeatured([]));
  }, []);

  return (
    <main className="relative">
      <Slide z={10} tone="dark">
        <Intro />
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
