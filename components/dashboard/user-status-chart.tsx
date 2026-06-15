"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  paidUsers: number;
  freeUsers: number;
  loading?: boolean;
}

const COLORS = ["#C2410C", "#F97316"]; // premium (rust), free (orange)

export function UserStatusChart({ paidUsers, freeUsers, loading }: Props) {
  const total = paidUsers + freeUsers || 1;
  const premiumPct = Math.round((paidUsers / total) * 100);
  const freePct = 100 - premiumPct;

  const data = [
    { name: "Premium Users", value: paidUsers || 0 },
    { name: "Free Users", value: freeUsers || 0 },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-6 py-4">
        <Skeleton className="size-48 rounded-full" />
        <Skeleton className="h-4 w-48" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={90}
              paddingAngle={3}
              cornerRadius={6}
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex items-center gap-6 text-sm">
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full" style={{ background: COLORS[1] }} />
          Free Users ({freePct}%)
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full" style={{ background: COLORS[0] }} />
          Premium Users ({premiumPct}%)
        </span>
      </div>
    </div>
  );
}
