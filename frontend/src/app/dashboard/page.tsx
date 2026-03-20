"use client";

import ProtectedRoute from "@/components/layout/protected-route";
import { useAuth } from "@/store/auth-context";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Dashboard
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Welcome, {user?.first_name} {user?.last_name}
              </p>
            </div>

            <button
              onClick={logout}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
