export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-10 text-sm text-slate-600">
      {label}
    </div>
  );
}
