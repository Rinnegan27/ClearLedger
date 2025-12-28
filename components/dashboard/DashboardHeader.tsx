"use client";

import Link from "next/link";
import { Bell, Settings, User, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export function DashboardHeader() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/integrations", label: "Integrations" },
    { href: "/dashboard/insights", label: "Insights" },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="group flex items-center gap-3">
              {/* DataCraft Labs Icon in Maroon */}
              <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 10 C30 10 10 30 10 50 C10 70 30 90 50 90 C70 90 90 70 90 50 C90 30 70 10 50 10 Z" stroke="#800020" strokeWidth="3" fill="none"/>
                <circle cx="50" cy="50" r="8" fill="#800020"/>
                <ellipse cx="50" cy="50" rx="35" ry="15" stroke="#800020" strokeWidth="3" fill="none" transform="rotate(0 50 50)"/>
                <ellipse cx="50" cy="50" rx="35" ry="15" stroke="#800020" strokeWidth="3" fill="none" transform="rotate(60 50 50)"/>
                <ellipse cx="50" cy="50" rx="35" ry="15" stroke="#800020" strokeWidth="3" fill="none" transform="rotate(120 50 50)"/>
              </svg>
              <span className="text-lg font-bold" style={{color: '#401D19'}}>
                clear<span style={{color: '#800020'}}>M</span>.ai
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
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      isActive
                        ? 'text-white'
                        : 'hover:bg-gray-50'
                    }`}
                    style={isActive ? {background: '#401D19', color: 'white'} : {color: '#6B5B52'}}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>

            <Link href="/dashboard/settings" className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all">
              <Settings className="w-5 h-5" />
            </Link>

            <div className="w-px h-6 bg-gray-200 mx-2"></div>

            <Link href="/profile" className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all">
              <User className="w-5 h-5" />
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-semibold">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
