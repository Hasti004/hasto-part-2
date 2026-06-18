/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // pt-2 palette — sun-faded, 70s, quiet luxury
        paper: "#F2EBDE",        // warm cream page bg
        cream: "#FBF6EC",        // lighter cream for polaroid fronts
        espresso: {
          DEFAULT: "#3D2A1C",    // deep ink, headlines, primary text
          800: "#5A422F",
          600: "#8A6A4A",        // mid espresso, secondary accents
        },
        toast: {
          DEFAULT: "#B98860",    // warm midtone
          300: "#D9B486",        // pale toast for tape
          200: "#E8CBA8",
        },
        powder: {
          DEFAULT: "#C5D5DA",    // powder blue — tape, polaroid bg
          400: "#8FAEB6",        // deeper blue-gray — aquamarine stone
          700: "#3F5B65",        // text accent
        },
        sage: {
          DEFAULT: "#B7C29D",    // sage olive pastel — tape, swatches
          200: "#D8DEC5",        // pale sage — polaroid bg variant
          600: "#8A9871",        // deeper olive — jade stone
        },
        // ink/paper kept for any code that still references the old names
        ink: "#3D2A1C",
        // legacy palettes kept so non-home pages (About, footer) still compile
        periwinkle: {
          DEFAULT: "#A9B6F5",
          50: "#EEF0FE", 100: "#DEE3FC", 200: "#C4CCF9",
          300: "#A9B6F5", 400: "#8B9BEF", 500: "#6E80E6",
        },
        lavender: {
          50: "#F6F2FB", 100: "#EDE5F7", 200: "#DCC9EE", 300: "#C6A9E2",
          400: "#AE86D3", 500: "#9566C2", 600: "#7A4DA8", 700: "#5E3B82",
          800: "#422A5B", 900: "#2A1B3A",
        },
      },
      fontFamily: {
        // Bodoni kept for editorial italic; Bricolage for big bold display;
        // Caveat for handwritten marker; Inter for UI chrome.
        display: ['"Bricolage Grotesque"', '"Inter"', 'ui-sans-serif', 'sans-serif'],
        serif: ['"Bodoni Moda"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        hand: ['"Caveat"', 'cursive'],
        mono: ['ui-monospace', 'Consolas', 'monospace'],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      boxShadow: {
        soft: "0 10px 40px -20px rgba(61,42,28,0.25)",
        tape: "0 1px 0 rgba(61,42,28,0.06)",
      },
      rotate: {
        "1.5": "1.5deg",
        "2.5": "2.5deg",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
