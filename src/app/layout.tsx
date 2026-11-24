import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Noto_Sans_KR } from "next/font/google";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import "./globals.css";

const noto = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  title: "땅땅! | AI 일상 재판소",
  description: "그래서, 누가 더 잘못했는데?! 내 말도, 네 말도. AI가 들어봅니다.",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${noto.variable} min-h-screen antialiased`}>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
