import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Torres del Paine Summit 2026 — Productora Calafate",
  description:
    "Un encuentro inusual en la Patagonia. Tres días de conversaciones reales, desconexión digital y paisaje indómito.",
  icons: {
    icon: "/montana.png",
    apple: "/montana.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full bg-canvas text-black">{children}</body>
    </html>
  );
}
