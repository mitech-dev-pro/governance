"use client";

import { Menu } from "lucide-react";
import { useAuth } from "@/store/auth-context";
import { useUI } from "@/store/ui-store";

export default function Topbar() {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useUI();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="inline-flex rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <p className="text-sm font-medium text-slate-900">
            Information Security Management System
          </p>
          <p className="text-xs text-slate-500">
            ISO 27001 Governance Dashboard
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-slate-900">
            {user?.first_name} {user?.last_name ?? ""}
          </p>
          <p className="text-xs text-slate-500">{user?.email}</p>
        </div>

        <button
          onClick={logout}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
