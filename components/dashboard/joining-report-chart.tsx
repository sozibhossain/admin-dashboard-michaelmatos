"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Skeleton } from "@/components/ui/skeleton";
import type { JoinComparisonPoint } from "@/lib/types";

export function JoiningReportChart({
  data,
  loading,
}: {
  data: JoinComparisonPoint[];
  loading?: boolean;
}) {
  if (loading) {
    return <Skeleton className="h-72 w-full" />;
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-6 text-sm">
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-[#F97316]" /> This Month
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-[#C2410C]" /> Last Month
        </span>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#eee" vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              tickMargin={10}
              interval={3}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              width={40}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #eee",
                fontSize: 12,
              }}
              labelFormatter={(l) => `Day ${l}`}
            />
            <Line
              type="monotone"
              dataKey="thisMonth"
              name="This Month"
              stroke="#F97316"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#fff", stroke: "#F97316", strokeWidth: 2 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="lastMonth"
              name="Last Month"
              stroke="#C2410C"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#fff", stroke: "#C2410C", strokeWidth: 2 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
