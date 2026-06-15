"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Users, MapPin, DollarSign } from "lucide-react";

import { dashboardApi, usersApi } from "@/lib/api";
import { formatMoney } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/dashboard/stat-card";
import { UserStatusChart } from "@/components/dashboard/user-status-chart";
import { JoiningReportChart } from "@/components/dashboard/joining-report-chart";
import { UsersTable } from "@/components/users/users-table";

export default function DashboardPage() {
  const [, setPeriod] = useState("month");

  const statsQuery = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: dashboardApi.stats,
  });
  const joinQuery = useQuery({
    queryKey: ["dashboard-join"],
    queryFn: dashboardApi.joinComparison,
  });
  const usersQuery = useQuery({
    queryKey: ["admin-users", { page: 1, limit: 5, search: "" }],
    queryFn: () => usersApi.list({ page: 1, limit: 5 }),
  });

  const stats = statsQuery.data;

  return (
    <div className="space-y-6">
      {/* Period filter */}
      <Tabs defaultValue="month" onValueChange={setPeriod}>
        <TabsList>
          <TabsTrigger value="month">This month</TabsTrigger>
          <TabsTrigger value="3month">3 Month</TabsTrigger>
          <TabsTrigger value="6month">6 Month</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Users"
          value={stats ? stats.totalUsers.toLocaleString() : "0"}
          delta={stats ? `+${stats.usersGrowthPct}%` : undefined}
          icon={Users}
          loading={statsQuery.isLoading}
        />
        <StatCard
          label="Total Visited Place"
          value={stats ? stats.totalPlaces.toLocaleString() : "0"}
          icon={MapPin}
          loading={statsQuery.isLoading}
        />
        <StatCard
          label="Total Earnings"
          value={stats ? formatMoney(stats.totalEarnings) : "$0"}
          icon={DollarSign}
          loading={statsQuery.isLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-xl">User Status</CardTitle>
          </CardHeader>
          <CardContent>
            <UserStatusChart
              paidUsers={stats?.paidUsers ?? 0}
              freeUsers={stats?.freeUsers ?? 0}
              loading={statsQuery.isLoading}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">Users Joining Report</CardTitle>
          </CardHeader>
          <CardContent>
            <JoiningReportChart data={joinQuery.data ?? []} loading={joinQuery.isLoading} />
          </CardContent>
        </Card>
      </div>

      {/* New joined users */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-xl">New Joined User</CardTitle>
          <Link href="/users" className="text-sm font-medium text-primary hover:underline">
            See all users
          </Link>
        </CardHeader>
        <CardContent>
          <UsersTable
            users={usersQuery.data?.users ?? []}
            isLoading={usersQuery.isLoading}
            rows={3}
          />
        </CardContent>
      </Card>
    </div>
  );
}
