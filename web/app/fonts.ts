import localFont from "next/font/local";
import { Montserrat } from "next/font/google";

export const clashDisplay = localFont({
  src: "./fonts/ClashDisplay-Variable.ttf",
  variable: "--font-clash-display",
  weight: "200 700",
  display: "swap",
});

export const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});
