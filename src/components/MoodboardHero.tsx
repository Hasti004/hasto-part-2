import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

/** pt-2 home hero: a scrapbook moodboard taped to the wall. */
export function MoodboardHero() {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-paper px-6 pb-10 pt-24 md:px-10 md:pt-28">
      {/* eyebrow */}
      <motion.p
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease }}
        className="pt-eyebrow uppercase"
      >
        moodboard — vol 01
      </motion.p>

      {/* big title */}
      <motion.h1
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.1, delay: 0.05, ease }}
        className="mt-2 font-display text-[14vw] font-extrabold leading-[0.92] tracking-[-0.02em] text-espresso md:text-[10vw] lg:text-[8.5vw]"
      >
        summer,{" "}
        <em className="font-serif font-medium italic text-espresso-600">
          in stones.
        </em>
      </motion.h1>

      {/* handwritten subtitle */}
      <motion.span
        initial={{ x: -8, opacity: 0, rotate: -2 }}
        animate={{ x: 0, opacity: 1, rotate: -2 }}
        transition={{ duration: 0.9, delay: 0.4, ease }}
        className="pt-hand mt-3 inline-block self-start text-[22px] text-toast md:text-[26px]"
      >
        ~ a feeling, taped to the wall
      </motion.span>

      {/* collage canvas */}
      <div className="relative mt-6 flex-1">
        {/* tape pieces */}
        <Tape className="left-[14%] top-[3%] rotate-[-22deg]" />
        <Tape className="left-[26%] top-[2%] rotate-[14deg] bg-sage" />
        <Tape className="left-[38%] top-[57%] w-[64px] rotate-[-12deg] bg-toast-300" />

        {/* big polaroid — ring */}
        <Polaroid
          className="left-[6%] top-[8%] w-[34%] max-w-[260px] -rotate-[3deg]"
          caption="the one — ring 03"
          delay={0.5}
        >
          <svg viewBox="0 0 156 156" className="h-full w-full" aria-hidden>
            <rect width="156" height="156" fill="#E8DCC2" />
            <circle cx="78" cy="86" r="44" fill="none" stroke="#3D2A1C" strokeWidth="2.5" />
            <circle cx="78" cy="42" r="9" fill="none" stroke="#3D2A1C" strokeWidth="2" />
            <circle cx="78" cy="42" r="3.5" fill="#8FAEB6" />
          </svg>
        </Polaroid>

        {/* stones cluster */}
        <motion.svg
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1, delay: 0.6, ease }}
          className="absolute left-[42%] top-[10%] w-[40%] max-w-[280px]"
          viewBox="0 0 220 130"
          aria-hidden
        >
          <ellipse cx="44" cy="44" rx="36" ry="24" fill="#8FAEB6" transform="rotate(-10 44 44)" />
          <ellipse cx="36" cy="38" rx="10" ry="5" fill="#C5D5DA" transform="rotate(-10 36 38)" />
          <path d="M132 26 L168 36 L176 72 L148 90 L114 72 Z" fill="#8A6A4A" />
          <path d="M132 26 L148 90 L168 36 Z" fill="#B98860" opacity="0.9" />
          <ellipse cx="68" cy="98" rx="30" ry="18" fill="#8A9871" transform="rotate(12 68 98)" />
          <ellipse cx="62" cy="93" rx="6" ry="3" fill="#B7C29D" transform="rotate(12 62 93)" />
          <circle cx="74" cy="100" r="1.5" fill="#D8DEC5" />
          <circle cx="68" cy="92" r="1.2" fill="#D8DEC5" />
        </motion.svg>

        {/* handwritten captions */}
        <motion.span
          initial={{ y: -6, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.85, ease }}
          className="pt-hand absolute left-[42%] top-[5%] -rotate-[5deg] text-[20px] text-espresso"
        >
          stones to think about ↓
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 1.05, ease }}
          className="pt-hand absolute left-[50%] top-[55%] -rotate-[3deg] text-[18px] text-powder-700"
        >
          aquamarine = june, by the sea
        </motion.span>

        {/* arrow doodle */}
        <svg
          className="absolute left-[36%] top-[40%] w-[60px]"
          viewBox="0 0 60 42"
          aria-hidden
        >
          <path
            d="M3 38 Q 18 6, 48 12 L 40 6 M 48 12 L 42 22"
            fill="none"
            stroke="#3D2A1C"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* small polaroid — hand */}
        <Polaroid
          className="left-[14%] top-[58%] w-[26%] max-w-[200px] rotate-[4deg]"
          caption="~ tuesday hands"
          delay={0.75}
        >
          <svg viewBox="0 0 122 90" className="h-full w-full" aria-hidden>
            <rect width="122" height="90" fill="#D8DEC5" />
            <path
              d="M14 90 Q 14 50, 36 40 Q 58 30, 64 22 Q 70 14, 78 14 Q 86 14, 88 24 L 94 46 L 94 90 Z"
              fill="#C9A78B"
            />
            <ellipse cx="74" cy="36" rx="14" ry="5" fill="#3D2A1C" />
            <ellipse cx="74" cy="35" rx="5" ry="2" fill="#C5D5DA" />
          </svg>
        </Polaroid>

        {/* paint swatch top-right */}
        <svg
          className="absolute right-[3%] top-[2%] w-[68px]"
          viewBox="0 0 68 68"
          aria-hidden
        >
          <path d="M6 6 L62 14 Q 66 32, 58 58 L 14 62 Q 6 32, 6 6" fill="#B7C29D" />
          <path
            d="M16 16 L48 18 Q 52 30, 46 50 L 22 52"
            fill="#8A9871"
            opacity="0.55"
          />
        </svg>

        {/* stamp + sticker */}
        <motion.div
          initial={{ scale: 0, rotate: 8 }}
          whileInView={{ scale: 1, rotate: 8 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 1.2, ease }}
          className="pt-stamp absolute bottom-[18%] right-[5%] h-[74px] w-[74px]"
        >
          the
          <br />
          june
          <br />
          dump
        </motion.div>
        <motion.span
          initial={{ y: 10, opacity: 0, rotate: -8 }}
          whileInView={{ y: 0, opacity: 1, rotate: -8 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 1.35, ease }}
          className="pt-sticker absolute bottom-[6%] right-[5%]"
        >
          vol 01 · summer
        </motion.span>
      </div>

      {/* scroll cue */}
      <div className="mt-auto flex items-center justify-between gap-4 border-t border-espresso/15 pt-4">
        <span className="pt-hand text-[19px] text-espresso">
          scroll for the june dump ↓
        </span>
        <span className="text-[11px] tracking-[0.14em] text-espresso/55">
          04 of 12
        </span>
      </div>
    </div>
  );
}

function Tape({ className }: { className?: string }) {
  return <span className={`pt-tape ${className ?? ""}`} />;
}

function Polaroid({
  children,
  caption,
  className,
  delay = 0.4,
}: {
  children: React.ReactNode;
  caption: string;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ y: 16, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.9, delay, ease }}
      className={`pt-polaroid absolute ${className ?? ""}`}
    >
      <div className="aspect-square w-full overflow-hidden">{children}</div>
      <p className="pt-poly-cap">{caption}</p>
    </motion.div>
  );
}
