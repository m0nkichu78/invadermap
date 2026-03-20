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
  description: "Track Space Invaders street art around the world",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={jetbrainsMono.variable}>
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
