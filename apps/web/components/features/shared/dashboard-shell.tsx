"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/features/shared/sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <Sidebar currentPath={pathname} />
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
