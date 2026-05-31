import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Heart, ShoppingBag } from "lucide-react";
import { formatINR, slugify } from "../lib/products";
import { getShopifyProducts } from "../lib/shopifyProducts";
import { findShopifyProductForPiece } from "../lib/collectionAliases";
import { mapShopifyProduct, type HastoProduct } from "../lib/mapShopifyProduct";
import { useCart } from "../lib/cart";
import { useWishlist } from "../lib/wishlist";
import { useAuth } from "../lib/auth";
import { cn } from "../lib/cn";

const V = ""; // sliced files have fresh names — no cache-bust needed

// ── Spacing rule (keep for future reference) ────────────────────────────────
// Design spacing is sometimes specified in millimetres. At 96dpi, 1mm ≈ 3.78px,
// so multiply any "Nmm" value by MM. Current ring action-button rules:
//   • upward-biased quarter-arc (eye at top → cart out to the side at centre
//     height) so the cart icon stays ~5mm clear of the price below
//   • +2mm extra clearance from the ring so buttons never sit on the jewellery,
//     which also gives a little more space between adjacent buttons
const MM = 3.78; // px per millimetre @96dpi

// Monochrome film grain (feTurbulence desaturated) for that tactile 90s feel.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

type Piece = {
  name: string;
  price: number;
  image: string;
  handle?: string;
  cx: number; // centre X (% of slide) — taken from the composite layout
  cy: number; // centre Y (%)
  w: number; // display width in px (proportional to the composite)
  vw: number; // responsive cap (vw)
  ar: number; // aspect ratio (height / width) of the cut-out
  rot: number;
  side: "left" | "right";
};

// Positions/sizes read straight from the composite you arranged.
const pieces: Piece[] = [
  { name: "lattice cuff ring", price: 1290, image: "/jewelry/p1.png", cx: 31.1, cy: 17.8, w: 77, vw: 7.6, ar: 1.02, rot: -6, side: "right" },
  { name: "starfish ring", price: 990, image: "/jewelry/p2.png", cx: 61.3, cy: 19.0, w: 78, vw: 7.7, ar: 0.99, rot: 5, side: "left" },
  { name: "paperclip bracelet", price: 1690, image: "/jewelry/p3.png", cx: 17.8, cy: 31.1, w: 180, vw: 17.7, ar: 0.95, rot: -4, side: "right" },
  { name: "onyx pendant necklace", price: 1990, image: "/jewelry/p4.png", cx: 85.2, cy: 30.8, w: 198, vw: 19.5, ar: 1.37, rot: 7, side: "left" },
  { name: "molten wave ring", price: 1390, image: "/jewelry/p5.png", cx: 42.9, cy: 38.6, w: 74, vw: 7.3, ar: 1.09, rot: -5, side: "right" },
  { name: "shell signet ring", price: 1190, image: "/jewelry/p6.png", cx: 26.7, cy: 53.4, w: 79, vw: 7.8, ar: 0.9, rot: 6, side: "right" },
  { name: "classic bangle", price: 1890, image: "/jewelry/p7.png", cx: 65.4, cy: 47.9, w: 143, vw: 14.0, ar: 0.59, rot: -3, side: "left" },
  { name: "rose medallion necklace", price: 1790, image: "/jewelry/p8.png", cx: 43.9, cy: 68.3, w: 239, vw: 23.5, ar: 1.08, rot: 5, side: "right" },
  { name: "heart charm bracelet", price: 1590, image: "/jewelry/p9.png", cx: 88.8, cy: 72.6, w: 214, vw: 21.0, ar: 1.03, rot: 6, side: "left" },
  { name: "clover bracelet", price: 2190, image: "/jewelry/p10.png", cx: 10.8, cy: 78.1, w: 187, vw: 18.4, ar: 0.83, rot: -4, side: "right" },
  { name: "stacked bangles", price: 2490, image: "/jewelry/p11.png", cx: 68.4, cy: 87.6, w: 214, vw: 21.0, ar: 0.78, rot: 5, side: "left" },
];

type ActionKind = "view" | "wishlist" | "cart";
const actions: { Icon: typeof Eye; label: string; kind: ActionKind }[] = [
  { Icon: Eye, label: "View", kind: "view" },
  { Icon: Heart, label: "Wishlist", kind: "wishlist" },
  { Icon: ShoppingBag, label: "Add to cart", kind: "cart" },
];

export function ShopFloat() {
  const [active, setActive] = useState<number | null>(null);
  const anyActive = active !== null;
  const rootRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const cart = useCart();
  const wishlist = useWishlist();
  const { session } = useAuth();

  // Live Shopify products keyed by piece handle — clicking a piece adds the real one to cart.
  const [byPieceHandle, setByPieceHandle] = useState<Map<string, HastoProduct>>(new Map());
  useEffect(() => {
    getShopifyProducts()
      .then((rows) => {
        const map = new Map<string, HastoProduct>();
        for (const piece of pieces) {
          const pieceHandle = piece.handle ?? slugify(piece.name);
          const match = findShopifyProductForPiece(rows, piece, slugify);
          if (match) {
            map.set(pieceHandle, mapShopifyProduct(match));
          } else if (import.meta.env.DEV) {
            console.warn("[ShopFloat] No Shopify product matched piece:", {
              name: piece.name,
              handle: pieceHandle,
              attempted: [piece.handle, slugify(piece.name)].filter(Boolean),
            });
          }
        }
        setByPieceHandle(map);
      })
      .catch(() => setByPieceHandle(new Map()));
  }, []);

  const doAction = (kind: ActionKind, pieceHandle: string) => {
    const prod = byPieceHandle.get(pieceHandle);
    if (!prod) return;
    if (kind === "view") {
      setActive(null);
      navigate(`/product/${prod.slug}`);
    } else if (kind === "wishlist") {
      void wishlist.toggle(prod.id).then((ok) => {
        if (!ok) navigate("/account/login", { state: { from: "/" } });
      });
    } else {
      void cart.add(
        {
          id: prod.id,
          slug: prod.slug,
          name: prod.name,
          price: prod.price,
          image: prod.image,
          stock_quantity: prod.stock_quantity,
          variantId: prod.variantId,
        },
        1
      );
    }
  };

  // Track viewport width so the button radius matches each piece's *rendered*
  // size (pieces shrink via the vw cap on small screens).
  const [vw, setVw] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1440
  );
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Per-pixel hit test: returns true only when the cursor is over an opaque
  // (jewellery) pixel of the piece's PNG — so empty space inside a chain/box
  // doesn't trigger the hover. Caches each image's alpha map.
  const alphaCache = useRef(
    new Map<string, { data: Uint8ClampedArray; w: number; h: number }>()
  );
  const onJewellery = (
    e: ReactMouseEvent<HTMLDivElement>,
    rotDeg: number,
    scale: number
  ) => {
    const img = e.currentTarget.querySelector("img");
    if (!img) return false;
    const src = img.currentSrc || img.src;
    let c = alphaCache.current.get(src);
    if (!c) {
      if (!img.naturalWidth) return true; // not decoded yet → allow
      const cv = document.createElement("canvas");
      cv.width = img.naturalWidth;
      cv.height = img.naturalHeight;
      const ctx = cv.getContext("2d", { willReadFrequently: true });
      if (!ctx) return true;
      ctx.drawImage(img, 0, 0);
      try {
        c = {
          data: ctx.getImageData(0, 0, cv.width, cv.height).data,
          w: cv.width,
          h: cv.height,
        };
        alphaCache.current.set(src, c);
      } catch {
        return true; // tainted/unreadable → fall back to box hover
      }
    }
    const r = img.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const rad = (-rotDeg * Math.PI) / 180;
    const lx = dx * Math.cos(rad) - dy * Math.sin(rad);
    const ly = dx * Math.sin(rad) + dy * Math.cos(rad);
    const w = img.offsetWidth * scale;
    const h = img.offsetHeight * scale;
    const u = lx / w + 0.5;
    const v = ly / h + 0.5;
    if (u < 0 || u > 1 || v < 0 || v > 1) return false;
    const px = Math.min(c.w - 1, Math.floor(u * c.w));
    const py = Math.min(c.h - 1, Math.floor(v * c.h));
    return c.data[(py * c.w + px) * 4 + 3] > 25;
  };

  // The shop slide always wants the navbar transparent (no white glass strip) —
  // it's pure white when idle and tinted when a piece is highlighted, so a solid
  // bar looks out of place either way. Dark nav text reads fine on both.
  useEffect(() => {
    const section = rootRef.current?.closest<HTMLElement>("[data-nav]");
    if (!section) return;
    section.dataset.clear = "1";
    window.dispatchEvent(new Event("scroll"));
    return () => {
      delete section.dataset.clear;
    };
  }, []);

  // Deselect when the page actually scrolls, so the dark backdrop / navbar
  // never gets stuck on as you leave the slide. (Ignores the synthetic scroll
  // event dispatched above, which doesn't change the position.)
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      if (Math.abs(window.scrollY - lastY) > 4) {
        lastY = window.scrollY;
        setActive(null);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative h-full w-full overflow-hidden bg-white"
      onClick={() => setActive(null)}
    >
      {/* soft grainy lavender-grey backdrop, fades in while a piece is highlighted */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 z-0 transition-opacity duration-500",
          anyActive ? "opacity-100" : "opacity-0"
        )}
        style={{
          background:
            "radial-gradient(circle at 76% 74%, rgba(150,120,86,0.40) 0%, transparent 52%)," +
            "radial-gradient(circle at 22% 82%, rgba(146,116,84,0.30) 0%, transparent 50%)," +
            "radial-gradient(circle at 50% 40%, #acbeff 0%, #c4c5da 52%, #cdccd6 100%)",
        }}
      />

      {pieces.map((p, i) => {
        const open = active === i;
        const handle = p.handle ?? slugify(p.name);
        const live = byPieceHandle.get(handle);
        const displayName = live?.name ?? p.name;
        const displayPrice = live?.price ?? p.price;
        const displayImage = live?.image ?? `${p.image}${V}`;
        const isRing = p.name.includes("ring");
        // radius based on the actual rendered size, so buttons hug the piece on
        // every screen; rings get +2mm clearance and an upward-biased arc.
        const renderedW = Math.min(p.w, (p.vw * vw) / 100);
        const half = (Math.max(renderedW, renderedW * p.ar) / 2) * 1.12;
        const R = half + 26 + (isRing ? 2 * MM : 0);
        // hover/click stays alive out to 3mm beyond the buttons
        const hitR = R + 16 + 3 * MM;
        const angles = isRing
          ? p.side === "right"
            ? [-90, -45, 0]
            : [270, 225, 180]
          : p.side === "right"
            ? [-46, 0, 46]
            : [226, 180, 134];
        return (
          <div
            key={p.name}
            className={cn("absolute transition-all duration-500", open ? "z-[3]" : "z-[1]", anyActive && !open && "opacity-40 blur-[2px]")}
            style={{
              left: `${p.cx}%`,
              top: `${p.cy}%`,
              width: `min(${p.w}px, ${p.vw}vw)`,
              transform: "translate(-50%, -50%)",
            }}
            onMouseMove={(e) => {
              // only start the hover when actually over the jewellery
              if (onJewellery(e, open ? p.rot * 0.3 : p.rot, open ? 1.12 : 1))
                setActive(i);
            }}
            onMouseLeave={() => setActive((cur) => (cur === i ? null : cur))}
            onClick={(e) => {
              e.stopPropagation();
              setActive(
                onJewellery(e, open ? p.rot * 0.3 : p.rot, open ? 1.12 : 1)
                  ? i
                  : null
              );
            }}
          >
            {/* lift wrapper — raises the piece AND its buttons together so the
                arc stays centred on the ring */}
            <div
              className="relative cursor-pointer transition-transform duration-300 ease-out"
              style={{ transform: open ? "translateY(-14px)" : "none" }}
            >
              {/* stage — rotates / scales the piece */}
              <div
                className="relative transition-transform duration-300 ease-out"
                style={{
                  transform: open
                    ? `rotate(${(p.rot * 0.3).toFixed(1)}deg) scale(1.12)`
                    : `rotate(${p.rot}deg)`,
                }}
              >
                <div
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute left-1/2 top-1/2 z-0 h-[210%] w-[210%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.55)_34%,transparent_66%)] transition-opacity duration-300",
                    open ? "opacity-100" : "opacity-0"
                  )}
                />
                <img
                  src={displayImage}
                  alt={displayName}
                  draggable={false}
                  className={cn(
                    "relative z-[1] h-auto w-full select-none object-contain transition-[filter] duration-300",
                    open && "[filter:drop-shadow(0_14px_26px_rgba(70,66,98,0.30))]"
                  )}
                />
              </div>

              {/* invisible hit-area — when open, keeps the piece active while the
                  cursor travels to the buttons (and 3mm past them) */}
              {open && (
                <div
                  aria-hidden
                  className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ width: hitR * 2, height: hitR * 2 }}
                />
              )}

              {/* action buttons on a circular arc, centred on the piece */}
              {actions.map(({ Icon, label, kind }, ai) => {
                const a = (angles[ai] * Math.PI) / 180;
                const dx = Math.cos(a) * R;
                const dy = Math.sin(a) * R;
                const pieceHandle = handle;
                const prod = byPieceHandle.get(pieceHandle);
                const filled =
                  kind === "wishlist" && prod && session
                    ? wishlist.has(prod.id)
                    : false;
                return (
                  <button
                    key={label}
                    aria-label={`${label} — ${displayName}`}
                    disabled={!prod}
                    onClick={(e) => {
                      e.stopPropagation();
                      doAction(kind, pieceHandle);
                    }}
                    style={{
                      left: `calc(50% + ${dx.toFixed(1)}px)`,
                      top: `calc(50% + ${dy.toFixed(1)}px)`,
                      transform: `translate(-50%, -50%) scale(${open ? 1 : 0.4})`,
                      transitionDelay: open ? `${ai * 50}ms` : "0ms",
                    }}
                    className={cn(
                      "absolute z-20 flex h-8 w-8 items-center justify-center rounded-full border border-ink/15 bg-white text-ink shadow-md transition-all duration-300 hover:bg-ink hover:text-white",
                      open ? "opacity-100" : "pointer-events-none opacity-0",
                      filled && "bg-ink text-white",
                      !prod && "cursor-not-allowed opacity-40 hover:bg-white hover:text-ink"
                    )}
                  >
                    <Icon
                      size={14}
                      strokeWidth={1.6}
                      fill={filled ? "currentColor" : "none"}
                    />
                  </button>
                );
              })}
            </div>

            <p
              className="mt-3 text-center font-display text-[12px] tracking-[0.06em] text-ink"
            >
              {formatINR(displayPrice)}
            </p>
          </div>
        );
      })}

      {/* scene-wide living film grain — over everything for that 90s feel */}
      <div
        aria-hidden
        className="grain-anim pointer-events-none absolute -inset-[60%] z-[40]"
        style={{
          backgroundImage: GRAIN,
          backgroundSize: "150px 150px",
          opacity: 0.2,
          mixBlendMode: "overlay",
        }}
      />
    </div>
  );
}
