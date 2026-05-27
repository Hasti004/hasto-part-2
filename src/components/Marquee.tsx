import { motion } from "framer-motion";

const items = [
  "handcrafted in india",
  "hypoallergenic finishes",
  "free shipping over ₹1999",
  "tarnish-resistant",
  "boxed to gift",
  "made slow, made well",
];

export function Marquee() {
  const loop = [...items, ...items];
  return (
    <div className="border-y border-ink/10 bg-ink py-4 overflow-hidden marquee">
      <motion.div
        className="flex gap-10 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, ease: "linear", repeat: Infinity }}
      >
        {loop.map((it, i) => (
          <span
            key={i}
            className="flex items-center gap-10 font-display text-xl font-light lowercase tracking-tight text-paper"
          >
            {it}
            <span className="text-lavender-300">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
