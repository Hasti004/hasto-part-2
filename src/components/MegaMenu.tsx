import { cn } from "../lib/cn";

export type MenuColumn = {
  title?: string;
  seasons?: string[];
  links: string[];
};

export const menus: Record<string, MenuColumn[]> = {
  women: [
    {
      seasons: ["summer 01"],
      links: ["earrings", "bracelets", "necklaces", "rings", "view all"],
    },
  ],
  men: [
    {
      links: ["bracelets", "cuffs", "view all"],
    },
  ],
};

export function MegaMenu({
  open,
  columns,
  onClose,
}: {
  open: boolean;
  columns: MenuColumn[];
  onClose: () => void;
}) {
  return (
    <>
      {/* backdrop — click to dismiss, fades the page behind */}
      <div
        onClick={onClose}
        aria-hidden
        className={cn(
          "fixed inset-0 z-[55] bg-paper/40 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      {/* panel — drops from under the navbar */}
      <div
        className={cn(
          "fixed inset-x-0 top-0 z-[60] bg-paper transition-[opacity,transform] duration-300 ease-out",
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-3 opacity-0"
        )}
      >
        <div className="mx-auto max-h-[100svh] w-full max-w-[1500px] overflow-auto px-6 pb-14 pt-24 md:px-10">
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-3 lg:grid-cols-6">
            {columns.map((col, i) => (
              <div key={i}>
                {col.title && (
                  <h3 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-ink">
                    {col.title}
                  </h3>
                )}

                {col.seasons && (
                  <ul className={cn("space-y-2", col.title && "mt-4")}>
                    {col.seasons.map((s) => (
                      <li key={s}>
                        <a
                          href="#"
                          onClick={onClose}
                          className="block text-[12px] uppercase leading-5 tracking-[0.04em] text-ink transition hover:text-lavender-700"
                        >
                          {s}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}

                <ul
                  className={cn(
                    "space-y-2",
                    col.seasons ? "mt-8" : col.title ? "mt-4" : ""
                  )}
                >
                  {col.links.map((l) => (
                    <li key={l}>
                      <a
                        href="#"
                        onClick={onClose}
                        className="block text-[12px] uppercase leading-5 tracking-[0.04em] text-ink/65 transition hover:text-ink"
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
