import { cn } from "@/utils/utils";

type StatusVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "muted";

const statusClasses: Record<StatusVariant, string> = {
  default: "bg-slate-100 text-slate-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
  muted: "bg-slate-100 text-slate-500",
};

export function StatusBadge({
  label,
  variant = "default",
}: {
  label: string;
  variant?: StatusVariant;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        statusClasses[variant],
      )}
    >
      {label}
    </span>
  );
}
