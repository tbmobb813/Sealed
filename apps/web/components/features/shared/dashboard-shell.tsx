"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Sidebar } from "@/components/features/shared/sidebar";
import { isDemoMode } from "@/lib/demo";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Safety net: always close the drawer after navigation.
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen]);

  return (
    <div className="flex min-h-screen flex-col">
      {isDemoMode() && (
        <div className="border-b bg-amber-50 px-4 py-2 text-center text-sm text-amber-900">
          Demo mode — Clerk keys not required. Run{" "}
          <code className="rounded bg-amber-100 px-1">pnpm db:seed</code> if
          data is missing.
        </div>
      )}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card px-4 md:hidden">
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setSidebarOpen(true)}
          className="-ml-2 flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/dashboard" className="text-xl font-bold text-primary">
          Sealed
        </Link>
      </header>
      {sidebarOpen && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 z-40 bg-black/50"
            aria-hidden="true"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 flex">
            <Sidebar
              currentPath={pathname}
              onNavigate={() => setSidebarOpen(false)}
            />
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setSidebarOpen(false)}
              className="mt-3 ml-2 flex h-9 w-9 items-center justify-center self-start rounded-md bg-card text-muted-foreground shadow"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-1">
        <div className="sticky top-0 hidden h-screen md:block">
          <Sidebar currentPath={pathname} />
        </div>
        <main className="flex-1 overflow-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
