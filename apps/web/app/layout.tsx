import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import { Instrument_Sans, Lora } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { canInitializeClerk } from "@/lib/demo";
import "./globals.css";

const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});
const serif = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
});

const ClerkRootLayout = dynamic(
  () =>
    import("./clerk-root-layout").then((module) => module.ClerkRootLayout),
  { ssr: true },
);

export const metadata: Metadata = {
  title: "Sealed",
  description: "Proposal-to-payment platform",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${serif.variable} font-sans`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
        >
          Skip to content
        </a>
        {canInitializeClerk() ? (
          <ClerkRootLayout>{children}</ClerkRootLayout>
        ) : (
          children
        )}
        <Analytics />
      </body>
    </html>
  );
}
