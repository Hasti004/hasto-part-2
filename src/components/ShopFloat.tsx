import { useEffect, useRef, useState } from "react";
import { Eye, Heart, ShoppingBag } from "lucide-react";
import { formatINR } from "../data/products";
import { cn } from "../lib/cn";

const V = "?v=3"; // cache-bust when images are re-processed

type Piece = {
  name: string;
  price: number;
  image: string;
  x: number;
  y: number;
  w: number;
  rot: number;
  side: "left" | "right";
};

const pieces: Piece[] = [
  { name: "lattice cuff ring", price: 1290, image: "/jewelry/cuff.png", x: 11, y: 24, w: 168, rot: -7, side: "right" },
  { name: "shell signet ring", price: 1190, image: "/jewelry/shell.png", x: 42, y: 15, w: 158, rot: 5, side: "right" },
  { name: "molten wave ring", price: 1390, image: "/jewelry/wave.png", x: 71, y: 23, w: 165, rot: -5, side: "left" },
  { name: "clover ring", price: 1090, image: "/jewelry/clover.png", x: 24, y: 57, w: 158, rot: 8, side: "right" },
  { name: "starfish ring", price: 990, image: "/jewelry/starfish.png", x: 60, y: 57, w: 165, rot: -6, side: "left" },
];

const actions = [
  { Icon: Eye, label: "View", top: "0%", dx: 8 },
  { Icon: Heart, label: "Wishlist", top: "50%", dx: 26 },
  { Icon: ShoppingBag, label: "Add to cart", top: "100%", dx: 8 },
];

export function ShopFloat() {
  const [active, setActive] = useState<number | null>(null);
  const anyActive = active !== null;
  const rootRef = useRef<HTMLDivElement>(null);

  // When a piece is highlighted the slide goes dark, so flip the navbar to its
  // light (white-text) treatment for this section.
  useEffect(() => {
    const section = rootRef.current?.closest<HTMLElement>("[data-nav]");
    if (!section) return;
    section.dataset.nav = anyActive ? "dark" : "light";
    window.dispatchEvent(new Event("scroll"));
  }, [anyActive]);

  return (
    <div
      ref={rootRef}
      className="relative h-full w-full overflow-hidden bg-white"
      onClick={() => setActive(null)}
    >
      {/* galaxy-dark backdrop, fades in while a piece is highlighted */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_42%,#3d2415_0%,#28170F_58%,#190d06_100%)] transition-opacity duration-500",
          anyActive ? "opacity-100" : "opacity-0"
        )}
      />

      {pieces.map((p, i) => {
        const open = active === i;
        return (
          <div
            key={p.name}
            className={cn("absolute transition-opacity duration-500", open ? "z-[3]" : "z-[1]", anyActive && !open && "opacity-40")}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `min(${p.w}px, 36vw)`,
            }}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive((cur) => (cur === i ? null : cur))}
            onClick={(e) => {
              e.stopPropagation();
              setActive(i);
            }}
          >
            <div
              className="relative cursor-pointer transition-transform duration-300 ease-out"
              style={{
                transform: open
                  ? `translateY(-12px) rotate(${(p.rot * 0.3).toFixed(1)}deg) scale(1.12)`
                  : `rotate(${p.rot}deg)`,
              }}
            >
              {/* warm halo glow (reads against the dark backdrop) */}
              <div
                aria-hidden
                className={cn(
                  "pointer-events-none absolute left-1/2 top-1/2 z-0 h-[185%] w-[185%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,238,210,0.30),transparent_60%)] transition-opacity duration-300",
                  open ? "opacity-100" : "opacity-0"
                )}
              />
              <img
                src={`${p.image}${V}`}
                alt={p.name}
                draggable={false}
                className={cn(
                  "relative z-[1] h-auto w-full select-none object-contain transition-[filter] duration-300",
                  open && "[filter:drop-shadow(0_16px_30px_rgba(0,0,0,0.45))]"
                )}
              />
            </div>

            {actions.map(({ Icon, label, top, dx }, ai) => (
              <button
                key={label}
                aria-label={`${label} — ${p.name}`}
                onClick={(e) => e.stopPropagation()}
                style={{
                  top,
                  ...(p.side === "right"
                    ? { left: "100%", transform: `translate(${dx}px, -50%)` }
                    : { right: "100%", transform: `translate(${-dx}px, -50%)` }),
                  transitionDelay: open ? `${ai * 60}ms` : "0ms",
                }}
                className={cn(
                  "absolute z-20 flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 bg-white text-ink shadow-md transition-all duration-300 hover:bg-ink hover:text-white",
                  open
                    ? "scale-100 opacity-100"
                    : "pointer-events-none scale-50 opacity-0"
                )}
              >
                <Icon size={15} strokeWidth={1.6} />
              </button>
            ))}

            <p
              className={cn(
                "mt-3 text-center font-display text-[12px] tracking-[0.06em] transition-colors duration-500",
                anyActive ? "text-paper" : "text-ink"
              )}
            >
              {formatINR(p.price)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
