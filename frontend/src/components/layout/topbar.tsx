"use client";

import { useAuth } from "@/store/auth-context";

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <p className="text-sm font-medium text-slate-900">
          Information Security Management System
        </p>
        <p className="text-xs text-slate-500">ISO 27001 Governance Dashboard</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
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
