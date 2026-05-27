import { Slide } from "../components/Slide";
import { Intro, Feature, Closing } from "../components/Slides";
import { ShopFloat } from "../components/ShopFloat";
import { products } from "../data/products";

export function Home() {
  return (
    <main className="relative">
      <Slide z={10} tone="dark">
        <Intro />
      </Slide>

      <Slide z={20} id="collection" tone="light">
        <ShopFloat />
      </Slide>

      <Slide z={30} tone="dark">
        <Feature product={products[2]} align="right" />
      </Slide>

      <Slide z={40} tone="dark">
        <Feature product={products[3]} align="left" />
      </Slide>

      <Slide z={60} pinned={false} tone="light">
        <Closing />
      </Slide>
    </main>
  );
}
