import type { Metadata } from "next";
import "./globals.css";

const baseUrl = process.env.NEXT_PUBLIC_CANOPY_URL?.trim() || "http://localhost:3002";

export const metadata: Metadata = {
  title: "Canopy — Privacy-first analytics for developers",
  description:
    "The safest, smallest (<2kb) privacy-first analytics. Cookieless by default, GDPR friendly, open source. From the makers of Winston.",
  metadataBase: new URL(baseUrl),
  openGraph: {
    title: "Canopy — Privacy-first analytics",
    description: "Clean, developer-friendly analytics without the surveillance. <2kb, cookieless, open source.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-white text-zinc-900">
        <div className="min-h-screen flex flex-col">{children}</div>
      </body>
    </html>
  );
}
