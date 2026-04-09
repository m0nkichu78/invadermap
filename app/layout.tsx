import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/nav/BottomNav";
import { AuthInitializer } from "@/components/auth/AuthInitializer";
import { PageTransition } from "@/components/PageTransition";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "InvaderMap",
  description: "Discover and track Space Invaders mosaics worldwide",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={jetbrainsMono.variable}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="InvaderMap" />
        <meta name="theme-color" content="#07070f" />
      </head>
      <body style={{ fontFamily: "var(--font-mono), monospace" }}>
        <div className="relative min-h-screen">
          <AuthInitializer />
          <PageTransition>{children}</PageTransition>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
