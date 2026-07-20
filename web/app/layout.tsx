import type { Metadata } from "next";
import { clashDisplay, montserrat } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stories Pricing Benchmark — Ru'ya 360",
  description: "Pricing positioning analysis prepared for Stories by Ru'ya 360.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${clashDisplay.variable} ${montserrat.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
