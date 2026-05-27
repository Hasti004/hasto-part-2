import { motion } from "framer-motion";

export function Story() {
  return (
    <section id="story" className="relative overflow-hidden bg-paper">
      <div className="mx-auto max-w-[1600px] px-6 py-24 md:px-10 md:py-32">
        <div className="grid grid-cols-12 gap-8">
          <p className="col-span-12 text-[11px] lowercase tracking-[0.2em] text-ink/50 md:col-span-3">
            (the house)
          </p>

          <motion.h2
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="col-span-12 font-display font-light leading-[0.95] tracking-[-0.04em] text-ink md:col-span-9"
            style={{ fontSize: "clamp(2.25rem, 5.5vw, 5.5rem)" }}
          >
            jewellery that doesn't <em className="font-serif italic font-light text-lavender-700">ask for attention</em>
            — it earns it, slowly, through being worn.
          </motion.h2>
        </div>

        <div className="mt-16 grid grid-cols-12 gap-8">
          <motion.div
            initial={{ scale: 1.04, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="col-span-12 aspect-[4/5] overflow-hidden rounded-[4px] bg-lavender-100 md:col-span-5"
          >
            <img
              src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=1200&q=85"
              alt="hasti, the maker"
              className="h-full w-full object-cover mix-blend-multiply"
            />
          </motion.div>

          <div className="col-span-12 flex flex-col justify-between gap-10 md:col-span-6 md:col-start-7">
            <div className="space-y-6 text-base leading-relaxed text-ink/75">
              <p>
                hasto began on a kitchen table in ahmedabad. one pair of pliers,
                one stubborn belief — that good jewellery shouldn't need a heavy
                price tag to feel heavy.
              </p>
              <p>
                every piece is plated by hand, polished twice, and packed in
                cloth. small runs. small team. no fast-fashion, no filler.
              </p>
            </div>

            <dl className="grid grid-cols-3 gap-6 border-t border-ink/10 pt-8 text-ink">
              <Stat k="128" l="pieces, this year" />
              <Stat k="06" l="collections" />
              <Stat k="01" l="pair of hands" />
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ k, l }: { k: string; l: string }) {
  return (
    <div>
      <dt className="font-display text-5xl font-medium tracking-[-0.04em] md:text-6xl">
        {k}
      </dt>
      <dd className="mt-2 text-[11px] lowercase tracking-[0.2em] text-ink/50">
        {l}
      </dd>
    </div>
  );
}
