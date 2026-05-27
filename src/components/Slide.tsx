import type { ReactNode } from "react";
import { cn } from "../lib/cn";

/**
 * One full-screen panel in the stacking scroll. Every slide is `sticky top-0`,
 * so as you scroll the next slide rises up and covers the previous one. Each
 * needs an opaque background and a rising z-index to fully mask what's beneath.
 */
export function Slide({
  children,
  className,
  z,
  id,
  pinned = true,
  tone = "light",
}: {
  children: ReactNode;
  className?: string;
  z: number;
  id?: string;
  /**
   * Pinned slides stick and get covered by the next slide (the stacking
   * effect). The final slide should flow at its natural height instead, so
   * taller content (like the footer) is fully visible.
   */
  pinned?: boolean;
  /** Background tone under the navbar — drives the nav's adaptive colour. */
  tone?: "dark" | "light";
}) {
  return (
    <section
      id={id}
      data-nav={tone}
      style={{ zIndex: z }}
      className={cn(
        pinned
          ? "sticky top-0 h-[100svh] w-full overflow-hidden"
          : "relative min-h-[100svh] w-full",
        className
      )}
    >
      {children}
    </section>
  );
}
