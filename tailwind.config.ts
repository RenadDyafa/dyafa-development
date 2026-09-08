import type { Config } from "tailwindcss";

function withOpacity(rgbVar: string) {
  return `rgb(var(${rgbVar}) / <alpha-value>)`;
}

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: withOpacity("--navy-900-rgb"),
          800: withOpacity("--navy-800-rgb"),
          700: withOpacity("--navy-700-rgb"),
        },
        slate: withOpacity("--slate-rgb"),
        teal: {
          600: withOpacity("--teal-600-rgb"),
          500: withOpacity("--teal-500-rgb"),
          300: withOpacity("--teal-300-rgb"),
          100: withOpacity("--teal-100-rgb"),
          // Both "50" and "050" keys registered — the codebase uses the
          // zero-padded form (bg-teal-050) to match the token name in
          // tokens.css; Tailwind only generates whichever suffix is a key
          // here, so without this alias `bg-teal-050`/`bg-stone-050` would
          // silently produce no utility at all (invisible, not an error).
          50: withOpacity("--teal-050-rgb"),
          "050": withOpacity("--teal-050-rgb"),
        },
        bronze: withOpacity("--bronze-rgb"),
        alert: withOpacity("--alert-rgb"),
        stone: {
          50: withOpacity("--stone-050-rgb"),
          "050": withOpacity("--stone-050-rgb"),
          100: withOpacity("--stone-100-rgb"),
        },
        grey: {
          100: withOpacity("--grey-100-rgb"),
          200: withOpacity("--grey-200-rgb"),
          400: withOpacity("--grey-400-rgb"),
          500: withOpacity("--grey-500-rgb"),
          600: withOpacity("--grey-600-rgb"),
        },
      },
      fontFamily: {
        en: ["var(--font-en)"],
        ar: ["var(--font-ar)"],
      },
    },
  },
  plugins: [],
};

export default config;
