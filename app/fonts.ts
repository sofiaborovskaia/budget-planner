import { Instrument_Serif, Nunito, Candal, Calistoga } from "next/font/google";

export const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument-serif",
});

export const nunito = Nunito({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-nunito",
});

export const candal = Candal({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-candal",
});

export const calistoga = Calistoga({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-calistoga",
});
