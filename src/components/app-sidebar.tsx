"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, Building2, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/services", label: "Services", icon: Boxes },
  { href: "/tenants", label: "Tenants", icon: Building2 },
];

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r bg-card">
      <div className="flex h-14 items-center gap-2 border-b px-5">
        <div className="h-6 w-6 rounded-md bg-primary" />
        <span className="text-sm font-semibold tracking-tight">Forge</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center justify-between border-t px-4 py-3">
        <span className="text-xs text-muted-foreground">Control plane</span>
        <ThemeToggle />
      </div>
    </aside>
  );
}
