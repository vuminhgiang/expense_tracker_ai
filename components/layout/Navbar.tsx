"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, List, Plus, Wallet, BarChart2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: List },
  { href: "/insights", label: "Insights", icon: BarChart2 },
];

interface NavbarProps {
  onAddExpense: () => void;
}

export default function Navbar({ onAddExpense }: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center shadow-sm">
                <Wallet size={16} className="text-white" />
              </div>
              <span className="font-bold text-gray-900 text-lg tracking-tight">
                SpendWise
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    pathname === href
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onAddExpense}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Expense</span>
            </button>

            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className={cn("block h-0.5 bg-current transition-all", mobileOpen && "rotate-45 translate-y-1.5")} />
                <span className={cn("block h-0.5 bg-current transition-all", mobileOpen && "opacity-0")} />
                <span className={cn("block h-0.5 bg-current transition-all", mobileOpen && "-rotate-45 -translate-y-2")} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
