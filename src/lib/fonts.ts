import { Montserrat, Almarai } from "next/font/google";

// next/font downloads and self-hosts these at build time (no runtime request
// to Google Fonts), which is what FEATURES.md §3 means by "self-hosted".
export const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-en",
  display: "swap",
});

export const almarai = Almarai({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-ar",
  display: "swap",
});
