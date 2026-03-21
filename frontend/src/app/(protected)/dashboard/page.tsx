export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Overview of your ISMS environment
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Assets</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">0</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Open Risks</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">0</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Open Incidents</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">0</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pending Audits</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">0</p>
        </div>
      </div>
    </div>
  );
}
