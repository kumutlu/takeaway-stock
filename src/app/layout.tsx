import type { Metadata, Viewport } from "next";
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
  title: "Wrap'n Bowl Orders",
  description: "Simple, fast order tracking for Wrap'n Bowl"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen font-[var(--font-body)] text-ink-900">
        {children}
      </body>
    </html>
  );
}
