import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import {
  FileText,
  Handshake,
  Receipt,
  Users,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DEMO_USER, isDemoMode } from "@/lib/demo";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/proposals", label: "Proposals", icon: FileText },
  { href: "/agreements", label: "Agreements", icon: Handshake },
  { href: "/invoices", label: "Invoices", icon: Receipt },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ currentPath }: { currentPath: string }) {
  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="text-xl font-bold text-primary">
          Sealed
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentPath === item.href ||
            (item.href !== "/" && currentPath.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        {isDemoMode() ? (
          <div className="space-y-1 text-sm">
            <p className="font-medium">{DEMO_USER.name}</p>
            <p className="text-muted-foreground">{DEMO_USER.email}</p>
            <p className="text-xs text-amber-600">Demo mode</p>
          </div>
        ) : (
          <UserButton afterSignOutUrl="/sign-in" />
        )}
      </div>
    </aside>
  );
}
