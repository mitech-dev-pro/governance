import { Card, CardContent } from "@/components/ui/card";

export default function DataTableShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">{children}</div>
      </CardContent>
    </Card>
  );
}
