import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/shared/session-provider";
import { QueryProvider } from "@/components/shared/query-provider";
import { ThemeProvider } from "@/components/shared/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "2bleA — Desarrollo Web Premium",
    template: "%s | 2bleA",
  },
  description:
    "Creamos experiencias digitales que transforman tu negocio. Landing pages, sitios web, catálogos online y más.",
  keywords: [
    "desarrollo web",
    "landing page",
    "páginas web",
    "catálogo online",
    "2bleA",
  ],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "2bleA",
    title: "2bleA — Desarrollo Web Premium",
    description:
      "Creamos experiencias digitales que transforman tu negocio.",
  },
  twitter: {
    card: "summary_large_image",
    title: "2bleA — Desarrollo Web Premium",
    description:
      "Creamos experiencias digitales que transforman tu negocio.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider>
          <SessionProvider>
            <QueryProvider>{children}</QueryProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
