import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";
import ThemeScript from "@/components/ThemeScript";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function getSiteName(): Promise<string> {
  try {
    const res = await fetch(`${BACKEND}/api/settings`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      return data.siteName || "LUXE";
    }
  } catch {}
  return "LUXE";
}

export async function generateMetadata(): Promise<Metadata> {
  const siteName = await getSiteName();
  return {
    title: `${siteName} | Premium Tech Atelier`,
    description: `Curated selection of the world's finest technology — smartphones, laptops, monitors, and PC components.`,
    icons: {
      icon: "/favicon.svg",
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300" suppressHydrationWarning>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
