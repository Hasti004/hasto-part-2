import "./App.css";
import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Home } from "./pages/Home";
import { About } from "./pages/About";

function App() {
  const { pathname } = useLocation();

  // Reset to the top on every route change.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // One-slide-per-gesture snap on the home stacking slides. Each wheel/swipe
  // advances to exactly the next/previous slide (no over-sliding past it). The
  // footer (taller than the viewport, last section) is left free to scroll
  // natively, up and down.
  useEffect(() => {
    if (pathname !== "/") return;

    let animating = false;
    let timer: number | undefined;

    const sections = () =>
      Array.from(document.querySelectorAll<HTMLElement>("main > section"));

    // True flow position of each section = cumulative height of those before it.
    // (section.offsetTop is unreliable here because sticky slides report their
    // *stuck* offset once scrolled past.)
    const tops = () => {
      const arr: number[] = [];
      let acc = 0;
      for (const s of sections()) {
        arr.push(acc);
        acc += s.offsetHeight;
      }
      return arr;
    };

    const footerTop = () => {
      const t = tops();
      return t.length ? t[t.length - 1] : Infinity;
    };

    // Are we inside the last section (the free-scrolling footer)?
    const inFooter = () => window.scrollY >= footerTop() - 4;

    const goto = (i: number) => {
      const t = tops();
      if (!t.length) return;
      const top = t[Math.max(0, Math.min(t.length - 1, i))];
      if (Math.abs(window.scrollY - top) < 4) return; // already there — don't re-lock
      animating = true;
      window.scrollTo({ top, behavior: "smooth" });
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        animating = false;
      }, 650);
    };

    // Move to the nearest slide boundary in the scroll direction (based on the
    // live scroll position, so a half-scrolled position never skips a slide).
    const step = (dir: number) => {
      if (animating) return;
      const t = tops();
      const y = window.scrollY;
      let target = -1;
      if (dir > 0) {
        target = t.findIndex((top) => top > y + 2); // first boundary below
      } else {
        for (let i = 0; i < t.length; i++) if (t[i] < y - 2) target = i; // last above
      }
      if (target === -1) return; // nothing further in that direction
      goto(target);
    };

    // Snap in the slide zone; let the footer scroll natively. The one exception:
    // when sitting exactly at the footer's top and pulling up, snap to the last
    // slide.
    const handle = (dir: number, prevent: () => void) => {
      if (!dir) return;
      if (inFooter()) {
        if (dir < 0 && window.scrollY <= footerTop() + 4) {
          prevent();
          step(-1);
        }
        return; // otherwise native scroll handles the footer
      }
      prevent();
      step(dir);
    };

    const onWheel = (e: WheelEvent) =>
      handle(Math.sign(e.deltaY), () => e.preventDefault());

    let startY = 0;
    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      // Only hijack touch in the slide zone; footer scrolls natively.
      if (!inFooter() && Math.sign(startY - e.touches[0].clientY))
        e.preventDefault();
    };
    const onTouchEnd = (e: TouchEvent) => {
      const dy = startY - e.changedTouches[0].clientY;
      if (Math.abs(dy) < 40) return;
      handle(Math.sign(dy), () => {});
    };

    const onKey = (e: KeyboardEvent) => {
      let dir = 0;
      if (["ArrowDown", "PageDown", " "].includes(e.key)) dir = 1;
      else if (["ArrowUp", "PageUp"].includes(e.key)) dir = -1;
      else return;
      handle(dir, () => e.preventDefault());
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
    };
  }, [pathname]);

  return (
    <div className="relative bg-paper text-ink">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  );
}

export default App;
