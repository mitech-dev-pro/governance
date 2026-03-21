"use client";

import ProtectedRoute from "@/components/layout/protected-route";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { useUI } from "@/store/ui-store";
import { cn } from "@/utils/utils";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isSidebarCollapsed } = useUI();

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />

        <div
          className={cn(
            "flex min-h-screen flex-1 flex-col transition-all duration-300",
            isSidebarCollapsed ? "lg:ml-0" : "lg:ml-0",
          )}
        >
          <Topbar />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
/*
The AppShell component is the main layout wrapper for the protected areas of the application. It includes the Sidebar and Topbar components, and wraps the content in a ProtectedRoute to ensure that only authenticated users can access it. The layout is responsive, with a collapsible sidebar and a top navigation bar. The children prop represents the main content that will be rendered within this layout.
*/
