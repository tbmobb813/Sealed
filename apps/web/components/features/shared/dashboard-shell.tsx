"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/features/shared/sidebar";
import { isDemoMode } from "@/lib/demo";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col">
      {isDemoMode() && (
        <div className="border-b bg-amber-50 px-4 py-2 text-center text-sm text-amber-900">
          Demo mode — Clerk keys not required. Run{" "}
          <code className="rounded bg-amber-100 px-1">pnpm db:seed</code> if
          data is missing.
        </div>
      )}
      <div className="flex flex-1">
        <Sidebar currentPath={pathname} />
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
