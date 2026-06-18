import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const features = [
  {
    no: "01",
    section: "letter",
    title: "a tuesday note from hasti.",
    page: "p.04",
  },
  {
    no: "02",
    section: "essay",
    title: "what the stones knew before we did.",
    page: "p.08",
  },
  {
    no: "03",
    section: "feature",
    title: "twelve pieces, one pair of hands.",
    page: "p.12",
  },
  {
    no: "04",
    section: "provenance",
    title: "where the lapis came from — afghanistan, 1973.",
    page: "p.22",
  },
  {
    no: "05",
    section: "edit",
    title: "the summer catalogue.",
    page: "p.26",
  },
  {
    no: "06",
    section: "back",
    title: "an invitation, signed.",
    page: "p.32",
  },
];

export function Contents() {
  return (
    <div className="relative flex h-full w-full flex-col bg-paper px-6 pb-12 pt-24 text-espresso md:px-10 md:pt-28">
      <div className="flex items-baseline justify-between border-b border-espresso/20 pb-3">
        <span className="mag-kicker">in this issue</span>
        <span className="mag-folio">contents · p.02</span>
      </div>

      <div className="mt-10 grid flex-1 grid-cols-12 gap-x-6 gap-y-12 md:gap-x-10">
        {/* big header */}
        <motion.h2
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 1.1, ease }}
          className="col-span-12 font-display text-[14vw] font-medium leading-[0.85] tracking-[-0.04em] lg:col-span-5 lg:text-[10vw]"
        >
          contents
          <span className="block text-[0.34em] font-light italic text-espresso/55 wonk">
            for the summer issue.
          </span>
        </motion.h2>

        {/* numbered features */}
        <ol className="col-span-12 lg:col-span-7">
          {features.map((f, i) => (
            <motion.li
              key={f.no}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.7, delay: i * 0.08, ease }}
              className="grid grid-cols-[44px_120px_1fr_70px] items-baseline gap-3 border-t border-espresso/15 py-4 last:border-b md:gap-5"
            >
              <span className="mag-folio">{f.no}</span>
              <span className="font-sans text-[11px] uppercase tracking-[0.18em] text-espresso/60">
                {f.section}
              </span>
              <span className="font-serif text-[20px] leading-snug text-espresso md:text-[24px]">
                {f.title}
              </span>
              <span className="mag-folio text-right">{f.page}</span>
            </motion.li>
          ))}
        </ol>
      </div>

      {/* bottom strip */}
      <div className="mt-10 flex items-center justify-between border-t border-espresso/20 pt-3">
        <span className="mag-folio">edited & made in ahmedabad.</span>
        <span className="mag-folio">turn the page ↓</span>
      </div>
    </div>
  );
}
