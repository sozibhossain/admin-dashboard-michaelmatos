import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  icon: LucideIcon;
  loading?: boolean;
}

export function StatCard({ label, value, delta, icon: Icon, loading }: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <Icon className="size-5 text-muted-foreground" />
      </div>

      {loading ? (
        <Skeleton className="mt-3 h-9 w-28" />
      ) : (
        <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
      )}

      {loading ? (
        <Skeleton className="mt-3 h-4 w-40" />
      ) : (
        delta && (
          <p className="mt-2 text-xs text-muted-foreground">
            <span className={cn("font-medium", delta.startsWith("-") ? "text-red-500" : "text-emerald-600")}>
              {delta}
            </span>{" "}
            from last month
          </p>
        )
      )}
    </Card>
  );
}
