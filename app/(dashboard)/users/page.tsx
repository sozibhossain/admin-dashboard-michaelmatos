"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

import { usersApi } from "@/lib/api";
import { useDebounce } from "@/hooks/use-debounce";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/pagination";
import { UsersTable } from "@/components/users/users-table";

const LIMIT = 10;

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "paid" | "free">("all");
  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["admin-users", { page, limit: LIMIT, search: debouncedSearch, status }],
    queryFn: () => usersApi.list({ page, limit: LIMIT, search: debouncedSearch, status }),
    placeholderData: keepPreviousData,
  });

  const onFilter = (value: "all" | "paid" | "free") => {
    setStatus(value);
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">All Users List</h1>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email"
              className="pl-10"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <Select value={status} onValueChange={(v) => onFilter(v as typeof status)}>
            <SelectTrigger className="h-11 w-32 border-0 bg-primary font-medium text-primary-foreground data-[placeholder]:text-primary-foreground [&_svg]:text-primary-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="free">Free</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-2 pt-2 sm:p-4">
          <UsersTable
            users={data?.users ?? []}
            isLoading={isLoading || (isFetching && !data)}
            rows={LIMIT}
          />
        </CardContent>
      </Card>

      <Pagination
        page={page}
        total={data?.total ?? 0}
        limit={LIMIT}
        onPageChange={setPage}
      />
    </div>
  );
}
