import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-muted/40 p-4">
      <Link href="/" className="text-3xl font-bold text-primary">
        Sealed
      </Link>
      <div className="flex w-full justify-center">{children}</div>
      <Link
        href="/"
        className="text-base text-muted-foreground underline-offset-4 hover:underline"
      >
        &larr; Back to home
      </Link>
    </div>
  );
}
