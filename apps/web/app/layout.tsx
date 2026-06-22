import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import { shouldInitializeClerk } from "@/lib/demo";
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
  return (
    <html lang="en">
      <body className={inter.className}>
        {shouldInitializeClerk() ? (
          <ClerkProvider appearance={{ theme: shadcn }}>{children}</ClerkProvider>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
