"use client";

import ProtectedRoute from "@/components/layout/protected-route";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

/*
The AppShell component serves as the main layout for the application. It wraps its children with a ProtectedRoute to ensure that only authenticated users can access the content. The layout consists of a Sidebar for navigation and a Topbar for user information and actions. The main content area is where the child components will be rendered.
*/
