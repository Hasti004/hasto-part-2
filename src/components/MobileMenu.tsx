import { useEffect, useRef, useState } from "react";
import { X, User, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { menus } from "./MegaMenu";
import { cn } from "../lib/cn";
import { useAuth } from "../lib/auth";

const tabs = ["women", "men"] as const;
type Tab = (typeof tabs)[number];

// Flatten a tab's menu into a single category list.
const catsFor = (t: Tab) =>
  menus[t].flatMap((c) => [...(c.seasons ?? []), ...c.links]);

export function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("women");
  const navigate = useNavigate();
  const { session } = useAuth();
  const startX = useRef(0);

  const goTo = (path: string) => {
    onClose();
    navigate(path);
  };

  // animated underline indicator
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({
    women: null,
    men: null,
  });
  const [ind, setInd] = useState({ left: 0, width: 0 });
  useEffect(() => {
    const el = tabRefs.current[tab];
    if (el) setInd({ left: el.offsetLeft, width: el.offsetWidth });
  }, [tab, open]);

  // reset to women each open
  useEffect(() => {
    if (open) setTab("women");
  }, [open]);

  const go = (cat: string) => {
    onClose();
    if (cat === "view all") {
      navigate("/");
      return;
    }
    navigate(`/shop/${encodeURIComponent(cat.replace(/\s+/g, "-"))}`);
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[80] flex flex-col bg-paper transition-[opacity,transform] duration-300 lg:hidden",
        open
          ? "translate-x-0 opacity-100"
          : "pointer-events-none translate-x-6 opacity-0"
      )}
    >
      {/* top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <span className="font-serif text-xl italic text-ink">hasto</span>
        <button onClick={onClose} aria-label="Close menu" className="text-ink">
          <X size={22} strokeWidth={1.5} />
        </button>
      </div>

      {/* tabs */}
      <div className="px-6">
        <div className="relative flex gap-9">
          {tabs.map((t) => (
            <button
              key={t}
              ref={(el) => {
                tabRefs.current[t] = el;
              }}
              onClick={() => setTab(t)}
              className={cn(
                "pb-3 text-[15px] uppercase tracking-[0.16em] transition-colors duration-300",
                tab === t ? "text-ink" : "text-ink/40 hover:text-ink"
              )}
            >
              {t}
            </button>
          ))}
          {/* animated underline */}
          <span
            className="absolute bottom-0 h-[2px] bg-ink transition-all duration-300 ease-out"
            style={{ left: ind.left, width: ind.width }}
          />
        </div>
        <div className="h-px w-full bg-ink/10" />
      </div>

      {/* swipeable panels */}
      <div
        className="flex-1 overflow-hidden"
        onTouchStart={(e) => {
          startX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - startX.current;
          if (dx < -45 && tab === "women") setTab("men");
          if (dx > 45 && tab === "men") setTab("women");
        }}
      >
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{
            width: "200%",
            transform: tab === "women" ? "translateX(0%)" : "translateX(-50%)",
          }}
        >
          {tabs.map((t) => (
            <div key={t} className="h-full w-1/2 overflow-y-auto px-6 py-8">
              <ul className="space-y-6">
                {catsFor(t).map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => go(cat)}
                      className="text-[16px] uppercase tracking-[0.08em] text-ink/45 transition-colors duration-200 hover:text-ink"
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* account footer */}
      <div className="flex items-center gap-6 border-t border-ink/10 px-6 py-5">
        <button
          onClick={() => goTo(session ? "/account" : "/account/login")}
          className="flex items-center gap-2 text-[13px] uppercase tracking-[0.1em] text-ink/70"
        >
          <User size={17} strokeWidth={1.6} />
          {session ? "account" : "sign in"}
        </button>
        <button
          onClick={() => goTo("/wishlist")}
          className="flex items-center gap-2 text-[13px] uppercase tracking-[0.1em] text-ink/70"
        >
          <Heart size={17} strokeWidth={1.6} />
          wishlist
        </button>
      </div>
    </div>
  );
}
