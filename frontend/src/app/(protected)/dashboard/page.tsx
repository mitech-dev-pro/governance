import PageHeader from "@/components/layout/page-header";
import StatCard from "@/components/cards/stat-card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your ISMS environment"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Assets" value={0} />
        <StatCard label="Open Risks" value={0} />
        <StatCard label="Open Incidents" value={0} />
        <StatCard label="Pending Audits" value={0} />
      </div>
    </div>
  );
}
