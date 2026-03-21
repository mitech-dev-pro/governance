import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SectionToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  children?: React.ReactNode;
}

export default function SectionToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  actionLabel,
  onActionClick,
  children,
}: SectionToolbarProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex w-full flex-col gap-3 md:flex-row md:items-center">
        {onSearchChange ? (
          <div className="w-full md:max-w-sm">
            <Input
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
            />
          </div>
        ) : null}

        {children}
      </div>

      {actionLabel ? (
        <Button onClick={onActionClick}>{actionLabel}</Button>
      ) : null}
    </div>
  );
}
