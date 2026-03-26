import type { Metadata } from "next";
import { Fraunces, Space_Grotesk } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "Wrap'n Bowl Stock",
  description: "Simple, fast stock tracking for Wrap'n Bowl"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${fraunces.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen font-[var(--font-body)] text-ink-900">
        {children}
      </body>
    </html>
  );
}
