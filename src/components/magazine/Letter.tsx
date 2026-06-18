import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

/** The letter from the editor — the warmth that makes the magazine human. */
export function Letter() {
  return (
    <div className="relative flex h-full w-full flex-col bg-paper px-6 pb-12 pt-24 text-espresso md:px-10 md:pt-28">
      <div className="flex items-baseline justify-between border-b border-espresso/20 pb-3">
        <span className="mag-kicker">letter · 01</span>
        <span className="mag-folio">from the editor · p.04</span>
      </div>

      <div className="mt-10 grid flex-1 grid-cols-12 gap-x-6 gap-y-10 md:gap-x-12">
        {/* left: title block */}
        <div className="col-span-12 lg:col-span-5">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 1.1, ease }}
            className="font-display text-[10vw] font-medium leading-[0.9] tracking-[-0.04em] lg:text-[6vw]"
          >
            a tuesday
            <br />
            <em className="font-light italic text-espresso/65 wonk">note,</em>
            <br />
            from <em className="font-light italic text-espresso/65 wonk">hasti.</em>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.4, ease }}
            className="mt-8 mag-byline"
          >
            words — hasti · photograph — kunal · ahmedabad, may 2026
          </motion.p>
        </div>

        {/* right: body copy with drop cap + pull quote */}
        <div className="col-span-12 lg:col-span-7">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 1.1, delay: 0.2, ease }}
            className="mag-dropcap font-serif text-[18px] leading-[1.55] text-espresso/85 md:text-[19px]"
          >
            Most of what I make starts on a tuesday. Not for any romantic reason
            — it's the day the post arrives, and stones travel slowly. This
            summer's parcel held a piece of lapis, wrapped in newspaper from
            1973, that someone's grandmother carried out of Kabul. It sat on my
            table for two weeks before I knew what to do with it.
          </motion.p>

          {/* pull quote */}
          <motion.blockquote
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.6, ease }}
            className="my-10 border-l-2 border-espresso/40 pl-6"
          >
            <p className="mag-pullquote text-[28px] leading-[1.15] md:text-[34px]">
              "the stones know what they want to become long before we do —
              we just have to listen long enough."
            </p>
          </motion.blockquote>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.7, ease }}
            className="font-serif text-[17px] leading-[1.6] text-espresso/80"
          >
            This issue is a small love letter to that kind of waiting. Twelve
            pieces. One pair of hands. A few stories about how each one came to
            be. You can hold them, you can keep them, you can pass them on. None
            of it is in a hurry.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.95, ease }}
            className="mt-10 font-serif text-[22px] italic text-espresso wonk"
          >
            — h.
          </motion.p>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-espresso/20 pt-3">
        <span className="mag-folio">letter ends here.</span>
        <span className="mag-folio">turn the page ↓</span>
      </div>
    </div>
  );
}
