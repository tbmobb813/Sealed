import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Page not found</h2>
        <p className="text-muted-foreground text-sm">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>
      <Button asChild variant="outline">
        <Link href="/">Go to Dashboard</Link>
      </Button>
    </div>
  );
}