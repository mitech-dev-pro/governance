import AppShell from "@/components/layout/app-shell";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}

/*
The ProtectedLayout component serves as a wrapper for routes that require authentication. It uses the AppShell component to provide a consistent layout with a sidebar and topbar. The children prop represents the content that will be rendered within the protected layout.
*/
