import { LogoMark } from "./LogoMark";

/**
 * Persistent brand mark inside the (fixed) nav row. Crossfades between the
 * true-colour (dark) mark and a white version depending on the section
 * underneath — driven by the navbar so the logo and links stay in sync.
 */
export function Logo({ onDark }: { onDark: boolean }) {
  return (
    <div className="relative w-[56px] md:w-[72px]">
      {/* true-colour (dark) mark — for light sections */}
      <div
        className={`transition-opacity duration-500 ease-out ${
          onDark ? "opacity-0" : "opacity-100"
        }`}
      >
        <LogoMark />
      </div>
      {/* white mark — for dark sections */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ease-out [&_img]:[filter:brightness(0)_invert(1)] ${
          onDark ? "opacity-100" : "opacity-0"
        }`}
      >
        <LogoMark tone="paper" />
      </div>
    </div>
  );
}
