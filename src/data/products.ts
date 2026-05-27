export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  price: number;
  material: string;
  category: "rings" | "earrings" | "necklaces" | "bracelets";
  image: string;
  hoverImage?: string;
  badge?: "new" | "bestseller" | "limited";
};

const img = (seed: string) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=900&q=80`;

export const products: Product[] = [
  {
    id: "01",
    slug: "velvet-halo-ring",
    name: "Velvet Halo Ring",
    tagline: "A whisper around the finger.",
    price: 1290,
    material: "Rhodium-plated brass, cubic zirconia",
    category: "rings",
    image: img("1603561591411-07134e71a2a9"),
    badge: "new",
  },
  {
    id: "02",
    slug: "lilac-drop-earrings",
    name: "Lilac Drop Earrings",
    tagline: "For long evenings and longer conversations.",
    price: 1490,
    material: "Sterling silver finish, freshwater pearl",
    category: "earrings",
    image: img("1515562141207-7a88fb7ce338"),
    badge: "bestseller",
  },
  {
    id: "03",
    slug: "petal-chain-necklace",
    name: "Petal Chain Necklace",
    tagline: "The collarbone, underlined.",
    price: 1890,
    material: "18k gold-plated alloy",
    category: "necklaces",
    image: img("1599643478518-a784e5dc4c8f"),
  },
  {
    id: "04",
    slug: "dusk-cuff",
    name: "Dusk Cuff",
    tagline: "Weightless, but it lingers.",
    price: 2190,
    material: "Matte rhodium, lavender enamel",
    category: "bracelets",
    image: img("1611652022419-a9419f74343d"),
    badge: "limited",
  },
  {
    id: "05",
    slug: "ember-stud-set",
    name: "Ember Stud Set",
    tagline: "Three studs, one story.",
    price: 990,
    material: "Gold-plated brass, crystal",
    category: "earrings",
    image: img("1535632066927-ab7c9ab60908"),
  },
  {
    id: "06",
    slug: "ivory-signet",
    name: "Ivory Signet",
    tagline: "A heirloom that never was — now is.",
    price: 1690,
    material: "Silver-plated alloy, mother-of-pearl",
    category: "rings",
    image: img("1602173574767-37ac01994b2a"),
  },
];

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
