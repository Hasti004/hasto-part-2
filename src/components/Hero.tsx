import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-paper pt-28">
      <div className="mx-auto flex min-h-[90vh] max-w-[1600px] flex-col justify-between px-6 pb-10 md:px-10">
        <div className="flex items-center justify-between pt-6">
          <p className="text-[11px] lowercase tracking-[0.2em] text-ink/50">
            spring edit — 2026
          </p>
          <p className="text-[11px] lowercase tracking-[0.2em] text-ink/50">
            handmade · ahmedabad
          </p>
        </div>

        <div className="relative mt-auto flex items-end">
          <div className="flex-1">
            <motion.h1
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="condensed font-display font-medium leading-[0.82] tracking-[-0.06em] text-ink"
              style={{ fontSize: "clamp(5rem, 22vw, 22rem)" }}
            >
              hasto
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 max-w-md text-sm leading-relaxed text-ink/70 md:text-base"
            >
              everyday jewellery, made in small runs. kinder materials, softer
              prices, pieces that look like they've always been yours.
            </motion.p>
          </div>

          <motion.div
            initial={{ scale: 1.06, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="hidden aspect-[3/4] w-[320px] shrink-0 overflow-hidden rounded-[3px] bg-lavender-200 md:block lg:w-[420px]"
          >
            <img
              src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=85"
              alt="lilac drop earrings"
              className="h-full w-full object-cover"
            />
          </motion.div>
        </div>

        <div className="mt-10 flex flex-wrap items-end justify-between gap-6 border-t border-ink/10 pt-6 text-[11px] lowercase tracking-[0.2em] text-ink/60">
          <span>№ 001 — the collection</span>
          <div className="flex items-center gap-3">
            <a
              href="#collection"
              className="rounded-full bg-ink px-5 py-2.5 text-[12px] normal-case tracking-normal text-paper transition hover:bg-lavender-700"
            >
              shop the edit →
            </a>
          </div>
          <span>scroll ↓</span>
        </div>
      </div>
    </section>
  );
}
