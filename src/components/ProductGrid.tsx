import { motion } from "framer-motion";
import { products, formatINR, type Product } from "../data/products";

const bgForIndex = [
  "bg-lavender-100",
  "bg-lavender-50",
  "bg-[#EFE9DC]",
  "bg-lavender-200",
  "bg-[#F2E8EC]",
  "bg-lavender-100",
];

export function ProductGrid() {
  return (
    <section id="collection" className="bg-paper">
      <div className="mx-auto max-w-[1600px] px-6 py-24 md:px-10 md:py-32">
        <div className="flex items-end justify-between gap-6">
          <h2
            className="condensed font-display font-medium leading-[0.85] tracking-[-0.05em] text-ink"
            style={{ fontSize: "clamp(3rem, 9vw, 9rem)" }}
          >
            the edit
          </h2>
          <p className="max-w-xs pb-3 text-right text-[11px] lowercase tracking-[0.2em] text-ink/50">
            06 pieces · spring 2026
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} bg={bgForIndex[i % bgForIndex.length]} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({
  product,
  index,
  bg,
}: {
  product: Product;
  index: number;
  bg: string;
}) {
  return (
    <motion.a
      href={`#${product.slug}`}
      initial={{ y: 40, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{
        duration: 0.9,
        delay: (index % 3) * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group block"
    >
      <div className={`relative aspect-[4/5] overflow-hidden rounded-[4px] ${bg}`}>
        {product.badge && (
          <span className="absolute left-4 top-4 z-10 font-display text-[11px] lowercase tracking-wide text-ink">
            ({product.badge})
          </span>
        )}
        <span className="absolute right-4 top-4 z-10 font-display text-[11px] lowercase tracking-wide text-ink/50">
          {product.id}
        </span>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover mix-blend-multiply transition duration-[1200ms] group-hover:scale-[1.05]"
        />
        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between">
          <span className="font-display text-[11px] lowercase tracking-wide text-ink">
            {product.category}
          </span>
          <span className="rounded-full bg-ink px-3 py-1.5 text-[11px] lowercase tracking-wide text-paper opacity-0 transition group-hover:opacity-100">
            add →
          </span>
        </div>
      </div>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-[22px] font-medium lowercase leading-tight tracking-[-0.02em] text-ink">
            {product.name.toLowerCase()}
          </h3>
          <p className="mt-1 font-serif text-sm italic text-ink/60">
            {product.tagline.toLowerCase()}
          </p>
        </div>
        <p className="whitespace-nowrap font-display text-base font-medium text-ink">
          {formatINR(product.price)}
        </p>
      </div>
    </motion.a>
  );
}
