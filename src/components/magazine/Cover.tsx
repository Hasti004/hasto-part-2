import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

/** Issue 01 cover — magazine front, runs as the home hero. */
export function Cover() {
  return (
    <div className="relative flex h-full w-full flex-col bg-paper text-espresso">
      {/* top folio + masthead row */}
      <div className="flex items-baseline justify-between border-b border-espresso/20 px-6 pt-24 pb-3 md:px-10">
        <span className="mag-folio">issue 01 · summer 2026</span>
        <span className="mag-folio">rs. 0 · twelve pieces · one story</span>
      </div>

      {/* main grid */}
      <div className="relative grid flex-1 grid-cols-12 gap-6 px-6 py-8 md:gap-8 md:px-10">
        {/* left rail: cover lines, like real magazines */}
        <aside className="col-span-12 lg:col-span-3 lg:pt-6">
          <motion.ul
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.12, delayChildren: 0.6 } },
            }}
            className="space-y-5"
          >
            {[
              { kicker: "no. 03", line: "a love letter to the lapis that survived fifty years." },
              { kicker: "no. 04", line: "twelve pieces, hand-finished, one pair of hands." },
              { kicker: "no. 07", line: "what the stones know before we do." },
            ].map((c) => (
              <motion.li
                key={c.kicker}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
                }}
                className="border-l border-espresso/30 pl-4"
              >
                <p className="mag-kicker">{c.kicker}</p>
                <p className="mt-1 font-serif text-[15px] leading-snug text-espresso/85">
                  {c.line}
                </p>
              </motion.li>
            ))}
          </motion.ul>
        </aside>

        {/* center: masthead + cover art */}
        <div className="col-span-12 flex flex-col lg:col-span-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease }}
            className="mag-masthead text-[18vw] leading-[0.78] tracking-[-0.06em] md:text-[12vw] lg:text-[10.5vw]"
          >
            hasto
          </motion.h1>

          {/* cover artwork — abstract editorial shape, placeholder for a real shoot */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.3, delay: 0.35, ease }}
            className="relative mt-4 flex flex-1 items-center justify-center"
          >
            <CoverArt />
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1.1, ease }}
              className="absolute bottom-2 left-2 max-w-[16ch] font-serif text-[12px] italic leading-snug text-espresso/55"
            >
              photographed at noon, on a tuesday — for the summer issue.
            </motion.span>
          </motion.div>
        </div>

        {/* right rail: issue line + barcode-ish folio */}
        <aside className="col-span-12 flex flex-col justify-between lg:col-span-3 lg:items-end lg:text-right">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5, ease }}
            className="lg:pt-6"
          >
            <p className="mag-kicker">the summer issue</p>
            <p className="mt-3 font-display text-[44px] font-medium leading-[0.88] tracking-[-0.02em] text-espresso md:text-[56px]">
              <em className="not-italic">stones</em>
              <br />
              <span className="font-serif italic font-light wonk text-espresso/70">
                & the
              </span>
              <br />
              <em className="not-italic">people</em>
              <br />
              <span className="font-serif italic font-light wonk text-espresso/70">
                who wear them.
              </span>
            </p>
          </motion.div>

          {/* fake barcode + price */}
          <div className="mt-8 flex items-end justify-between gap-4 lg:flex-col lg:items-end">
            <Barcode />
            <div className="text-right">
              <p className="mag-folio">vol 01</p>
              <p className="mag-folio mt-0.5">may 2026</p>
            </div>
          </div>
        </aside>
      </div>

      {/* bottom strip */}
      <div className="flex items-center justify-between border-t border-espresso/20 px-6 py-3 md:px-10">
        <span className="mag-folio">cover · p.01</span>
        <span className="mag-folio">scroll for contents ↓</span>
      </div>
    </div>
  );
}

/** Abstract editorial cover artwork — placeholder shape that reads as a piece
 *  of jewelry seen as a glyph. Replace with a real shoot when one lands. */
function CoverArt() {
  return (
    <svg viewBox="0 0 480 520" className="h-full max-h-[58vh] w-auto" aria-hidden>
      {/* warm-block ground */}
      <rect x="20" y="20" width="440" height="480" fill="#E8D8B8" />
      {/* big espresso ring glyph */}
      <circle
        cx="240"
        cy="260"
        r="148"
        fill="none"
        stroke="#3D2A1C"
        strokeWidth="22"
      />
      {/* hanging stone */}
      <circle cx="240" cy="156" r="20" fill="none" stroke="#3D2A1C" strokeWidth="6" />
      <circle cx="240" cy="156" r="8" fill="#8FAEB6" />
      {/* aura of small mineral marks */}
      <circle cx="120" cy="120" r="6" fill="#B98860" />
      <circle cx="380" cy="100" r="4" fill="#3D2A1C" />
      <circle cx="100" cy="420" r="5" fill="#8A9871" />
      <circle cx="400" cy="430" r="7" fill="#B98860" />
      <circle cx="60" cy="260" r="3" fill="#3D2A1C" />
      <circle cx="420" cy="260" r="3" fill="#3D2A1C" />
      {/* big rough number */}
      <text
        x="40"
        y="490"
        fontFamily="Fraunces, serif"
        fontSize="64"
        fontWeight="500"
        fill="#3D2A1C"
        fontStyle="italic"
      >
        01
      </text>
    </svg>
  );
}

function Barcode() {
  // Random-ish vertical lines for that "real magazine" feel.
  const widths = [2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2, 1, 3, 1, 2, 2, 1, 3, 1, 2];
  return (
    <div className="flex flex-col items-start">
      <div className="flex h-9 items-end gap-[2px]">
        {widths.map((w, i) => (
          <span
            key={i}
            style={{ width: w, height: i % 3 === 0 ? 32 : 36 }}
            className="bg-espresso"
          />
        ))}
      </div>
      <span className="mag-folio mt-1">0 71200 26104 1</span>
    </div>
  );
}
