import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Instagram, Youtube, Twitter, Facebook, Plus, Minus } from "lucide-react";
import { formatINR } from "../lib/products";
import { cn } from "../lib/cn";

const ease = [0.22, 1, 0.36, 1] as const;

/* ---------------------------------------------------------------- intro --- */

export function Intro() {
  return (
    <div className="relative h-full w-full bg-periwinkle">
      <motion.img
        initial={{ scale: 1.06 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.6, ease }}
        src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=2000&q=85"
        alt="hasto — spring edit 2026"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* soft scrim so the bottom caption stays legible on any image */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/35 to-transparent" />

      <motion.a
        href="#collection"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.7, ease }}
        className="group absolute inset-x-0 bottom-10 flex flex-col items-center gap-2 text-center text-paper"
      >
        <span className="text-sm uppercase tracking-[0.3em]">
          spring edit — 2026
        </span>
        <span className="text-[12px] uppercase tracking-[0.32em] opacity-80 transition group-hover:opacity-100">
          see more
        </span>
        <span className="animate-bounce text-xl leading-none">⌄</span>
      </motion.a>
    </div>
  );
}

/* -------------------------------------------------------------- feature --- */

export type FeatureItem = {
  image: string;
  name: string;
  slug: string;
  price: number;
  tagline?: string | null;
  category: string;
};

export function Feature({
  item,
  align = "left",
  bg = "bg-paper",
  indexLabel,
}: {
  item: FeatureItem;
  align?: "left" | "right";
  bg?: string;
  indexLabel?: string;
}) {
  return (
    <div className={`relative h-full w-full overflow-hidden ${bg}`}>
      <motion.img
        src={item.image}
        alt={item.name}
        initial={{ scale: 1.2 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "-8%" }}
        transition={{ duration: 2, ease }}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/20" />

      <div className="absolute inset-0 flex flex-col justify-between px-6 pb-10 pt-24 md:px-10">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-paper/70">
          <span>{item.category}</span>
          {indexLabel && <span>{indexLabel}</span>}
        </div>

        <motion.div
          initial={{ y: 56, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 1.3, delay: 0.15, ease }}
          className={align === "right" ? "ml-auto text-right" : ""}
        >
          <h2
            className="font-display font-medium uppercase leading-[0.9] tracking-[0.01em] text-paper"
            style={{ fontSize: "clamp(2.5rem, 8vw, 8rem)" }}
          >
            {item.name}
          </h2>
          <div
            className={`mt-6 flex items-center gap-7 ${
              align === "right" ? "justify-end" : ""
            }`}
          >
            {item.tagline && (
              <p className="max-w-xs font-serif text-sm italic text-paper/80">
                {item.tagline}
              </p>
            )}
            <span className="text-sm tracking-[0.1em] text-paper">
              {formatINR(item.price)}
            </span>
            <Link
              to={`/product/${item.slug}`}
              className="border-b border-paper/60 pb-1 text-[12px] uppercase tracking-[0.2em] text-paper transition hover:border-paper"
            >
              discover
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- story --- */

export function StorySlide() {
  return (
    <div
      id="story"
      className="relative flex min-h-[100svh] items-center bg-paper px-6 pb-20 pt-28 md:px-10"
    >
      <div className="mx-auto grid w-full max-w-[1500px] grid-cols-12 items-center gap-8">
        <motion.div
          initial={{ scale: 1.05, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease }}
          className="col-span-12 hidden aspect-[4/5] max-h-[70vh] overflow-hidden rounded-[4px] bg-lavender-100 md:col-span-5 md:block"
        >
          <motion.img
            initial={{ scale: 1.18 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, margin: "-8%" }}
            transition={{ duration: 1.8, ease }}
            src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=1200&q=85"
            alt="hasti, the maker"
            className="h-full w-full object-cover mix-blend-multiply"
          />
        </motion.div>

        <div className="col-span-12 md:col-span-6 md:col-start-7">
          <p className="text-[11px] uppercase tracking-[0.2em] text-ink/50">
            the house
          </p>
          <motion.h2
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 1.3, ease }}
            className="mt-4 font-display font-light uppercase leading-[1.05] tracking-[0.01em] text-ink"
            style={{ fontSize: "clamp(1.7rem, 3.4vw, 3.4rem)" }}
          >
            jewellery that doesn't{" "}
            <em className="font-serif italic font-light text-lavender-700">
              ask for attention
            </em>{" "}
            — it earns it, slowly, through being worn.
          </motion.h2>

          <p className="mt-6 max-w-md text-sm leading-relaxed text-ink/70">
            hasto began on a kitchen table in ahmedabad. every piece is plated
            by hand, polished twice, and packed in cloth. small runs, small
            team — no filler.
          </p>

          <dl className="mt-8 grid max-w-md grid-cols-3 gap-6 border-t border-ink/10 pt-6 text-ink">
            <Stat k="128" l="pieces, this year" />
            <Stat k="06" l="collections" />
            <Stat k="01" l="pair of hands" />
          </dl>
        </div>
      </div>
    </div>
  );
}

function Stat({ k, l }: { k: string; l: string }) {
  return (
    <div>
      <dt className="font-display text-4xl font-medium tracking-[-0.04em] md:text-5xl">
        {k}
      </dt>
      <dd className="mt-2 text-[10px] uppercase tracking-[0.2em] text-ink/50">
        {l}
      </dd>
    </div>
  );
}

/* -------------------------------------------------------------- closing --- */

const SHOP_LINKS: FooterLink[] = [
  { label: "rings", to: "/shop/rings" },
  { label: "earrings", to: "/shop/earrings" },
  { label: "necklaces", to: "/shop/necklaces" },
  { label: "bracelets", to: "/shop/bracelets" },
  { label: "gift cards", to: "#" },
  { label: "new in", to: "#" },
];
const HOUSE_LINKS: FooterLink[] = [
  { label: "our story", to: "/about" },
  { label: "sustainability", to: "#" },
  { label: "careers", to: "#" },
  { label: "press", to: "#" },
  { label: "stockists", to: "#" },
];
const HELP_LINKS: FooterLink[] = [
  { label: "customer service", to: "#" },
  { label: "shipping & delivery", to: "#" },
  { label: "returns", to: "#" },
  { label: "find a store", to: "#" },
  { label: "contact", to: "#" },
  { label: "cookie settings", to: "#" },
];

export function Closing() {
  return (
    <div className="relative min-h-[100svh] bg-paper px-6 pb-12 pt-28 text-ink md:px-10">
      <div className="w-full">
        {/* link columns — full 4-up on desktop, tap-to-expand accordions on mobile + tablet */}
        <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-16">
          <FooterCol title="Shop" links={SHOP_LINKS} />
          <FooterCol title="The House" links={HOUSE_LINKS} />
          <FooterCol title="Help" links={HELP_LINKS} />
          <FooterCol title="Become a member">
            <p className="max-w-[15rem] text-[12px] leading-relaxed text-ink/80">
              Join now and get 10% off your first order.
            </p>
            <Link
              to="/account/login"
              className="mt-2.5 inline-block text-[11.5px] uppercase tracking-[0.03em] text-ink underline underline-offset-4 transition hover:text-lavender-700"
            >
              sign up now
            </Link>
          </FooterCol>
        </div>

        {/* region */}
        <div className="mt-16 flex items-center gap-4 text-[15px]">
          <span className="font-semibold">india (₹)</span>
          <a
            href="#"
            className="text-[13px] uppercase tracking-[0.03em] underline underline-offset-4 transition hover:text-lavender-700"
          >
            change region
          </a>
        </div>

        {/* copyright + socials */}
        <div className="mt-14 flex flex-col gap-8 border-t border-ink/10 pt-10 lg:flex-row lg:items-start lg:justify-between">
          <p className="max-w-2xl text-[13px] leading-relaxed text-ink/65">
            The content of this site is the property of hasto by hasti. hasto
            crafts small-batch, hand-finished jewellery in ahmedabad, india —
            kinder materials, softer prices, and pieces made to be worn every
            day. © 2026 hasto by hasti.
          </p>
          <div className="flex items-center gap-6 text-ink/70">
            {[Instagram, Youtube, Twitter, Facebook].map((Icon, i) => (
              <a key={i} href="#" className="transition hover:text-ink">
                <Icon size={20} strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>

        {/* payments */}
        <div className="mt-12">
          <h4 className="text-[13px] font-semibold text-ink">Payments</h4>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {["cod", "visa", "mastercard", "upi", "amex"].map((p) => (
              <span
                key={p}
                className="flex h-8 items-center rounded border border-ink/15 bg-white px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink/70"
              >
                {p}
              </span>
            ))}
            <a
              href="#"
              className="ml-2 text-[13px] underline underline-offset-4 transition hover:text-lavender-700"
            >
              view all payment options
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

type FooterLink = { label: string; to: string };

function FooterCol({
  title,
  links,
  children,
}: {
  title: string;
  links?: FooterLink[];
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {/* header — a toggle on mobile, a plain heading on desktop */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-4 text-left lg:pointer-events-none lg:py-0"
      >
        <h4 className="text-[13px] font-semibold text-ink">{title}</h4>
        <span className="text-ink/55 lg:hidden">
          {open ? <Minus size={18} /> : <Plus size={18} />}
        </span>
      </button>

      {/* content — collapsible on mobile, always shown on desktop */}
      <div
        className={cn(
          open ? "block" : "hidden",
          "pb-4 lg:mt-3.5 lg:block lg:pb-0"
        )}
      >
        {links ? (
          <ul className="space-y-1">
            {links.map((l) => (
              <li key={l.label}>
                {l.to.startsWith("/") ? (
                  <Link
                    to={l.to}
                    className="block text-[11.5px] uppercase leading-5 tracking-[0.03em] text-ink/70 transition hover:text-ink"
                  >
                    {l.label}
                  </Link>
                ) : (
                  <a
                    href={l.to}
                    className="block text-[11.5px] uppercase leading-5 tracking-[0.03em] text-ink/70 transition hover:text-ink"
                  >
                    {l.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
