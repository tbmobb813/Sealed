import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { isDemoMode } from "@/lib/demo";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sealed",
  description: "Proposal-to-payment platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const body = (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );

  if (isDemoMode()) {
    return body;
  }

  return <ClerkProvider>{body}</ClerkProvider>;
}
