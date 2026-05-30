import { useEffect, useRef, useState } from "react";
import { Search, User, Heart, ShoppingBag, Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Logo } from "./Logo";
import { MegaMenu, menus } from "./MegaMenu";
import { MobileMenu } from "./MobileMenu";
import { cn } from "../lib/cn";
import { useCart } from "../lib/cart";
import { useWishlist } from "../lib/wishlist";
import { useAuth } from "../lib/auth";

const links = [
  { label: "women", menu: "women" },
  { label: "men", menu: "men" },
];

/** Reads the tone (dark/light) of the section actually sitting under the
 *  navbar, so the colour stays correct regardless of exact slide heights. */
function useNavTheme() {
  const { pathname } = useLocation();
  const [theme, setTheme] = useState({ onDark: pathname === "/", clear: false });

  useEffect(() => {
    const update = () => {
      const els = document.elementsFromPoint(window.innerWidth / 2, 90);
      for (const el of els) {
        const section = el.closest<HTMLElement>("[data-nav]");
        if (section) {
          setTheme({
            onDark: section.dataset.nav === "dark",
            clear: section.dataset.clear === "1",
          });
          return;
        }
      }
      setTheme({ onDark: false, clear: false });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  return theme;
}

export function Navbar() {
  const { onDark, clear } = useNavTheme();
  const { pathname } = useLocation();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count: cartCount, setOpen: setCartOpen } = useCart();
  const { count: wishCount } = useWishlist();
  const { session } = useAuth();

  // Close the mobile drawer on route change.
  useEffect(() => setMobileOpen(false), [pathname]);

  // Keep the last opened menu's data so it can fade out gracefully on close.
  const dataRef = useRef(menus.women);
  if (openMenu) dataRef.current = menus[openMenu];

  // Close the menu on route change, Escape, or scroll.
  useEffect(() => setOpenMenu(null), [pathname]);
  useEffect(() => {
    if (!openMenu) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenMenu(null);
    const onScroll = () => setOpenMenu(null);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, [openMenu]);

  // While the menu is open the navbar sits over a light panel.
  const effectiveDark = onDark && !openMenu;

  const fg = effectiveDark
    ? "text-white/90 hover:text-white"
    : "text-ink/75 hover:text-ink";

  // Border is always present; only its colour (and the background) fades, so it
  // dissolves cleanly instead of the width collapsing / glitching.
  const bar = openMenu
    ? "border-ink/[0.08] bg-paper"
    : effectiveDark || clear
    ? "border-transparent bg-transparent"
    : "border-ink/[0.08] bg-paper/80 backdrop-blur-md";

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[70] border-b transition-[background-color,border-color] duration-500",
          bar
        )}
      >
        <div className="grid grid-cols-3 items-center px-6 py-2.5 md:px-10">
          {/* left — hamburger (mobile) + categories/mega-menu (desktop) */}
          <div className="flex items-center justify-self-start">
            <button
              aria-label="Menu"
              onClick={() => setMobileOpen(true)}
              className={cn("transition-colors duration-300 lg:hidden", fg)}
            >
              <Menu size={22} strokeWidth={1.5} />
            </button>
            <nav className="hidden items-center gap-7 lg:flex">
              {links.map((l) => (
                <button
                  key={l.label}
                  onClick={() =>
                    setOpenMenu((prev) => (prev === l.menu ? null : l.menu))
                  }
                  className={cn(
                    "text-[12px] uppercase tracking-[0.14em] transition-colors duration-300",
                    openMenu === l.menu
                      ? "text-ink underline underline-offset-[6px]"
                      : fg
                  )}
                >
                  {l.label}
                </button>
              ))}
            </nav>
          </div>

          {/* center — logo */}
          <Link
            to="/"
            className="justify-self-center"
            aria-label="hasto by hasti — home"
          >
            <Logo onDark={effectiveDark} />
          </Link>

          {/* right — search · account · wishlist · cart */}
          <div className="flex items-center gap-5 justify-self-end">
            <button
              aria-label="Search"
              className={cn("transition-colors duration-300", fg)}
            >
              <Search size={18} strokeWidth={1.5} />
            </button>

            <Link
              to={session ? "/account" : "/account/login"}
              aria-label="Account"
              className={cn("hidden transition-colors duration-300 lg:block", fg)}
            >
              <User size={18} strokeWidth={1.5} />
            </Link>

            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className={cn("relative transition-colors duration-300", fg)}
            >
              <Heart size={18} strokeWidth={1.5} />
              {wishCount > 0 && <Badge>{wishCount}</Badge>}
            </Link>

            <button
              onClick={() => setCartOpen(true)}
              aria-label="Cart"
              className={cn("relative transition-colors duration-300", fg)}
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {cartCount > 0 && <Badge>{cartCount}</Badge>}
            </button>
          </div>
        </div>
      </header>

      <MegaMenu
        open={!!openMenu}
        columns={dataRef.current}
        onClose={() => setOpenMenu(null)}
      />

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[9px] font-medium tabular-nums text-paper ring-2 ring-paper">
      {children}
    </span>
  );
}
