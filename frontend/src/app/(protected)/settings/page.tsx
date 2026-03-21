import PageHeader from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage users, roles, permissions, departments, integrations, and workflow automation."
      />

      <Card>
        <CardContent>
          <p className="text-sm text-slate-600">
            Settings submodules will appear here next.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
