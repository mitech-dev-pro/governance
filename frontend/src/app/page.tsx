"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth-context";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">ISMS Frontend</h1>
        <p className="mt-2 text-gray-600">
          Next.js frontend for the ISO 27001 Governance Dashboard
        </p>
        <p className="text-slate-600">Loading...</p>
      </div>
    </main>
  );
}
