import { Button } from "@/components/ui/button";

interface PageHeaderAction {
  label: string;
  onClick?: () => void;
}

export default function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: PageHeaderAction;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        ) : null}
      </div>

      {action ? <Button onClick={action.onClick}>{action.label}</Button> : null}
    </div>
  );
}
