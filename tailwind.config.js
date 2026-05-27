/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0B0B",
        paper: "#FAF8F5",
        periwinkle: {
          DEFAULT: "#A9B6F5",
          50: "#EEF0FE",
          100: "#DEE3FC",
          200: "#C4CCF9",
          300: "#A9B6F5",
          400: "#8B9BEF",
          500: "#6E80E6",
        },
        lavender: {
          50: "#F6F2FB",
          100: "#EDE5F7",
          200: "#DCC9EE",
          300: "#C6A9E2",
          400: "#AE86D3",
          500: "#9566C2",
          600: "#7A4DA8",
          700: "#5E3B82",
          800: "#422A5B",
          900: "#2A1B3A",
        },
      },
      fontFamily: {
        display: ['"Bodoni Moda"', 'ui-serif', 'Georgia', 'serif'],
        serif: ['"Bodoni Moda"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'Consolas', 'monospace'],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      boxShadow: {
        soft: "0 10px 40px -20px rgba(11,11,11,0.25)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
