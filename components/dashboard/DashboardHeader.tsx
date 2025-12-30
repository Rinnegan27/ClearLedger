"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, User, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { cn } from "@/lib/utils";

export function DashboardHeader() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/attribution", label: "Attribution" },
    { href: "/dashboard/funnel", label: "Funnel" },
    { href: "/dashboard/calls", label: "Calls" },
    { href: "/dashboard/optimizer", label: "Optimizer" },
    { href: "/dashboard/integrations", label: "Integrations" },
    { href: "/dashboard/insights", label: "Insights" },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="group flex items-center gap-2">
              <svg className="w-7 h-7" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="dashboardLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6B2737" stopOpacity={1} />
                    <stop offset="100%" stopColor="#E07A5F" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="38" stroke="url(#dashboardLogoGradient)" strokeWidth="2.5" fill="none"/>
                <circle cx="50" cy="50" r="6" fill="#6B2737"/>
                <ellipse cx="50" cy="50" rx="32" ry="14" stroke="#6B2737" strokeWidth="2.5" fill="none" opacity="0.9"/>
                <ellipse cx="50" cy="50" rx="32" ry="14" stroke="#E07A5F" strokeWidth="2.5" fill="none" transform="rotate(60 50 50)" opacity="0.8"/>
                <ellipse cx="50" cy="50" rx="32" ry="14" stroke="#6B2737" strokeWidth="2.5" fill="none" transform="rotate(120 50 50)" opacity="0.7"/>
              </svg>
              <span className="font-heading text-base font-bold text-gray-900">
                clear<span className="text-burgundy-600">m</span>.ai
              </span>
            </Link>

            {/* Navigation */}
            <nav className="flex space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-burgundy-600 text-white"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5">
            <NotificationBell />

            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/settings">
                <Settings className="w-4 h-4" />
              </Link>
            </Button>

            <div className="w-px h-5 bg-gray-200 mx-1.5"></div>

            <Button variant="ghost" size="icon" asChild>
              <Link href="/profile">
                <User className="w-4 h-4" />
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="gap-1.5 text-gray-600 hover:text-danger-600 hover:bg-danger-50"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
