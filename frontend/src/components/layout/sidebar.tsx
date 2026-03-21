"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { navigationItems } from "@/lib/navigation";
import { cn } from "@/utils/utils";
import { useUI } from "@/store/ui-store";

export default function Sidebar() {
  const pathname = usePathname();
  const {
    isSidebarOpen,
    closeSidebar,
    isSidebarCollapsed,
    toggleSidebarCollapse,
  } = useUI();

  return (
    <>
      {isSidebarOpen ? (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={closeSidebar}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white transition-all duration-300",
          "lg:static lg:z-auto",
          isSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0",
          isSidebarCollapsed ? "w-20" : "w-64",
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-5">
          <div
            className={cn("overflow-hidden", isSidebarCollapsed && "lg:hidden")}
          >
            <h1 className="text-lg font-semibold text-slate-900">ISMS</h1>
            <p className="mt-1 text-sm text-slate-500">ISO 27001 Dashboard</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSidebarCollapse}
              className="hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:inline-flex"
              aria-label="Toggle sidebar width"
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </button>

            <button
              onClick={closeSidebar}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition",
                  isSidebarCollapsed ? "justify-center" : "gap-3",
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
                )}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
