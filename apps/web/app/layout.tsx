import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import { Inter } from "next/font/google";
import { canInitializeClerk } from "@/lib/demo";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        {canInitializeClerk() ? (
          <ClerkRootLayout>{children}</ClerkRootLayout>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
