import { useEffect, useRef, useState } from "react";
import { Search, User, Heart, ShoppingBag } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Logo } from "./Logo";
import { MegaMenu, menus } from "./MegaMenu";
import { cn } from "../lib/cn";

const links = [
  { label: "women", menu: "women" },
  { label: "men", menu: "men" },
];

const icons = [
  { Icon: Search, label: "Search" },
  { Icon: User, label: "Account" },
  { Icon: Heart, label: "Wishlist" },
  { Icon: ShoppingBag, label: "Cart" },
];

/** Reads the tone (dark/light) of the section actually sitting under the
 *  navbar, so the colour stays correct regardless of exact slide heights. */
function useNavTheme() {
  const { pathname } = useLocation();
  const [onDark, setOnDark] = useState(pathname === "/");

  useEffect(() => {
    const update = () => {
      const els = document.elementsFromPoint(window.innerWidth / 2, 90);
      for (const el of els) {
        const section = el.closest<HTMLElement>("[data-nav]");
        if (section) {
          setOnDark(section.dataset.nav === "dark");
          return;
        }
      }
      setOnDark(false);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  return { onDark };
}

export function Navbar() {
  const { onDark } = useNavTheme();
  const { pathname } = useLocation();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

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

  const bar = openMenu
    ? "border-b border-ink/[0.08] bg-paper"
    : effectiveDark
    ? "bg-transparent"
    : "border-b border-ink/[0.08] bg-paper/80 backdrop-blur-md";

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[70] transition-all duration-500",
          bar
        )}
      >
        <div className="grid grid-cols-3 items-center px-6 py-2.5 md:px-10">
          {/* left — categories (open the mega menu) */}
          <nav className="flex items-center gap-7 justify-self-start">
            {links.map((l) => (
              <button
                key={l.label}
                onClick={() =>
                  setOpenMenu((prev) => (prev === l.menu ? null : l.menu))
                }
                className={cn(
                  "text-[12px] uppercase tracking-[0.14em] transition-colors duration-300",
                  openMenu === l.menu ? "text-ink underline underline-offset-[6px]" : fg
                )}
              >
                {l.label}
              </button>
            ))}
          </nav>

          {/* center — logo */}
          <Link
            to="/"
            className="justify-self-center"
            aria-label="hasto by hasti — home"
          >
            <Logo onDark={effectiveDark} />
          </Link>

          {/* right — utility icons */}
          <div className="flex items-center gap-5 justify-self-end">
            {icons.map(({ Icon, label }) => (
              <button
                key={label}
                aria-label={label}
                className={cn("transition-colors duration-300", fg)}
              >
                <Icon size={18} strokeWidth={1.5} />
              </button>
            ))}
          </div>
        </div>
      </header>

      <MegaMenu
        open={!!openMenu}
        columns={dataRef.current}
        onClose={() => setOpenMenu(null)}
      />
    </>
  );
}
