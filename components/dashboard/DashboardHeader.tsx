"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Settings,
  User,
  LogOut,
  ChevronDown,
  Plug,
  BarChart3,
  GitBranch,
  PhoneCall,
  Trophy,
  Lightbulb,
  Bell,
  Target,
  TrendingUp,
  PhoneMissed,
  LayoutDashboard
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: any;
  description?: string;
}

interface NavTab {
  id: string;
  label: string;
  items: NavItem[];
}

export function DashboardHeader() {
  const pathname = usePathname();
  const [openTab, setOpenTab] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navTabs: NavTab[] = [
    {
      id: "connect",
      label: "Connect",
      items: [
        {
          href: "/dashboard/integrations",
          label: "Integrations",
          icon: Plug,
          description: "Connect your data sources"
        },
      ],
    },
    {
      id: "analyze",
      label: "Analyze",
      items: [
        {
          href: "/dashboard",
          label: "Overview",
          icon: LayoutDashboard,
          description: "Key metrics at a glance"
        },
        {
          href: "/dashboard/attribution",
          label: "Attribution",
          icon: GitBranch,
          description: "Multi-touch attribution"
        },
        {
          href: "/dashboard/funnel",
          label: "Funnel",
          icon: BarChart3,
          description: "Conversion funnel analysis"
        },
        {
          href: "/dashboard/calls",
          label: "Calls",
          icon: PhoneCall,
          description: "Call tracking & quality"
        },
        {
          href: "/dashboard/campaigns",
          label: "Campaigns",
          icon: Trophy,
          description: "Campaign performance scores"
        },
        {
          href: "/dashboard/insights",
          label: "Insights",
          icon: Lightbulb,
          description: "AI-powered reports"
        },
        {
          href: "/dashboard/alerts",
          label: "Alerts",
          icon: Bell,
          description: "Smart anomaly detection"
        },
      ],
    },
    {
      id: "action",
      label: "Action",
      items: [
        {
          href: "/dashboard/action",
          label: "Recommendations",
          icon: Target,
          description: "Next best actions"
        },
        {
          href: "/dashboard/optimizer",
          label: "Optimizer",
          icon: TrendingUp,
          description: "Budget optimization"
        },
        {
          href: "/dashboard/recovery",
          label: "Recovery",
          icon: PhoneMissed,
          description: "Missed call recovery"
        },
      ],
    },
  ];

  // Determine which tab is currently active based on pathname
  const getActiveTab = () => {
    for (const tab of navTabs) {
      if (tab.items.some(item => item.href === pathname)) {
        return tab.id;
      }
    }
    return null;
  };

  const activeTab = getActiveTab();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenTab(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTab = (tabId: string) => {
    setOpenTab(openTab === tabId ? null : tabId);
  };

  const handleMouseEnter = (tabId: string) => {
    setOpenTab(tabId);
  };

  const handleMouseLeave = () => {
    // Slight delay before closing to prevent accidental closes
    setTimeout(() => {
      if (dropdownRef.current && !dropdownRef.current.matches(':hover')) {
        setOpenTab(null);
      }
    }, 100);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="group flex items-center gap-2.5">
              <svg className="w-8 h-8 transition-transform group-hover:scale-110 duration-200" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              <span className="font-heading text-lg font-bold text-gray-900">
                clear<span className="text-burgundy-600">M</span>.ai
              </span>
            </Link>

            {/* Navigation - 3 Main Tabs */}
            <nav className="flex space-x-2 relative" ref={dropdownRef}>
              {navTabs.map((tab) => {
                const isTabActive = activeTab === tab.id;
                const isOpen = openTab === tab.id;

                return (
                  <div
                    key={tab.id}
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(tab.id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      onClick={() => toggleTab(tab.id)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-1.5",
                        isTabActive
                          ? "bg-burgundy-600 text-white shadow-md"
                          : "text-gray-700 hover:bg-burgundy-50 hover:text-burgundy-700"
                      )}
                    >
                      {tab.label}
                      <ChevronDown className={cn(
                        "w-4 h-4 transition-transform duration-300",
                        isOpen && "rotate-180"
                      )} />
                    </button>

                    {/* Dropdown Menu - Enhanced with Icons & Descriptions */}
                    {isOpen && (
                      <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        {tab.items.map((item) => {
                          const isItemActive = pathname === item.href;
                          const Icon = item.icon;

                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setOpenTab(null)}
                              className={cn(
                                "flex items-start gap-3 px-4 py-3 transition-all duration-150 group",
                                isItemActive
                                  ? "bg-burgundy-50 border-l-4 border-burgundy-600"
                                  : "hover:bg-gray-50 border-l-4 border-transparent"
                              )}
                            >
                              <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                                isItemActive
                                  ? "bg-burgundy-100 text-burgundy-600"
                                  : "bg-gray-100 text-gray-600 group-hover:bg-burgundy-100 group-hover:text-burgundy-600"
                              )}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className={cn(
                                  "text-sm font-semibold mb-0.5",
                                  isItemActive ? "text-burgundy-900" : "text-gray-900"
                                )}>
                                  {item.label}
                                </div>
                                <div className="text-xs text-gray-500 line-clamp-1">
                                  {item.description}
                                </div>
                              </div>
                              {isItemActive && (
                                <div className="w-2 h-2 rounded-full bg-burgundy-600 mt-2"></div>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
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
