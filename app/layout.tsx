import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ClerkProviderWrapper } from "@/src/components/ClerkProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "human2.0 — The augmented operator's community",
  description:
    "human2.0 is the operator's community for shipping AI-powered businesses — from self-hosted infrastructure to autonomous agents to the latest video models.",
  openGraph: {
    title: "human2.0",
    description:
      "The next version of you runs on AI. Join the operator's community.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-ink text-ink-50 font-sans antialiased">
        <ClerkProviderWrapper>{children}</ClerkProviderWrapper>
      </body>
    </html>
  );
}