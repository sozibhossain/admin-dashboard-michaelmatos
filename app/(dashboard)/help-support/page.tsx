"use client";

import { useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { helpApi } from "@/lib/api";
import { formatDate, formatTime, getInitials } from "@/lib/utils";
import type { HelpTicket } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/pagination";

const LIMIT = 10;

const STATUS_VARIANT: Record<HelpTicket["status"], "warning" | "muted" | "success"> = {
  open: "warning",
  "in-progress": "muted",
  resolved: "success",
};

export default function HelpSupportPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["help-tickets", { page, limit: LIMIT, status }],
    queryFn: () => helpApi.list({ page, limit: LIMIT, status }),
    placeholderData: keepPreviousData,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: HelpTicket["status"] }) =>
      helpApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success("Ticket status updated.");
      queryClient.invalidateQueries({ queryKey: ["help-tickets"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const loading = isLoading || (isFetching && !data);
  const tickets = data?.tickets ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">All Help &amp; Support List</h1>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-11 w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-2 pt-2 sm:p-4">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-left">User Name</TableHead>
                <TableHead>Contact Information</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: LIMIT }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-left">
                      <div className="flex items-center gap-3">
                        <Skeleton className="size-10 rounded-full" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-3.5 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="mx-auto h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="mx-auto h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="mx-auto h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="mx-auto h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="mx-auto h-6 w-20 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : tickets.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="py-12 text-muted-foreground">
                    No support tickets found.
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((t) => (
                  <TableRow key={t._id}>
                    <TableCell className="text-left">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10 border">
                          <AvatarFallback>{getInitials(t.userId?.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold leading-tight">{t.userId?.name ?? "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">
                            ID: {(t.userId?._id ?? t._id).slice(-6)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{t.userId?.email ?? "—"}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{formatDate(t.createdAt)}</p>
                      <p className="text-xs text-muted-foreground">{formatTime(t.createdAt)}</p>
                    </TableCell>
                    <TableCell className="font-medium">{t.subject}</TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm text-muted-foreground">{t.description}</p>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={t.status}
                        onValueChange={(v) =>
                          statusMutation.mutate({ id: t._id, status: v as HelpTicket["status"] })
                        }
                      >
                        <SelectTrigger className="mx-auto h-8 w-auto gap-1.5 border-0 bg-transparent p-0 shadow-none [&>svg]:size-3.5">
                          <Badge variant={STATUS_VARIANT[t.status]} className="capitalize">
                            {t.status.replace("-", " ")}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Pagination page={page} total={data?.total ?? 0} limit={LIMIT} onPageChange={setPage} />
    </div>
  );
}
