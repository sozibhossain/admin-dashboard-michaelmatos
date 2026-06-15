"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreVertical, Ban, ShieldCheck, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { daysSince, formatMoney, getInitials } from "@/lib/utils";
import { usersApi } from "@/lib/api";
import type { User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function UsersTable({
  users,
  isLoading,
  rows = 5,
  showActions = true,
}: {
  users: User[];
  isLoading: boolean;
  rows?: number;
  showActions?: boolean;
}) {
  const queryClient = useQueryClient();
  const [toDelete, setToDelete] = useState<User | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
  };

  const banMutation = useMutation({
    mutationFn: (id: string) => usersApi.toggleBan(id),
    onSuccess: (data) => {
      toast.success(data.isBanned ? "User banned." : "User unbanned.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => {
      toast.success("User deleted.");
      setToDelete(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-left">User Name</TableHead>
            <TableHead>Contact Information</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total Days</TableHead>
            <TableHead>Total Amount Spend</TableHead>
            {showActions && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: rows }).map((_, i) => (
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
                  <TableCell><Skeleton className="mx-auto h-6 w-16 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="mx-auto h-4 w-14" /></TableCell>
                  <TableCell><Skeleton className="mx-auto h-4 w-16" /></TableCell>
                  {showActions && <TableCell><Skeleton className="mx-auto h-6 w-6" /></TableCell>}
                </TableRow>
              ))
            : users.length === 0
            ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={showActions ? 6 : 5} className="py-12 text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            )
            : users.map((u) => (
                <TableRow key={u._id}>
                  <TableCell className="text-left">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 border">
                        <AvatarImage src={u.avatar || undefined} alt={u.name} />
                        <AvatarFallback>{getInitials(u.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold leading-tight">{u.name}</p>
                        <p className="text-xs text-muted-foreground">ID: {u._id.slice(-6)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{u.email}</p>
                    {u.location && <p className="text-xs text-muted-foreground">{u.location}</p>}
                  </TableCell>
                  <TableCell>
                    {u.subscriptionStatus === "paid" ? (
                      <Badge variant="success">Paid</Badge>
                    ) : (
                      <Badge variant="muted">Free</Badge>
                    )}
                    {u.isBanned && (
                      <Badge variant="destructive" className="ml-1">Banned</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{daysSince(u.createdAt)} days</TableCell>
                  <TableCell className="font-medium">{formatMoney(u.totalSpent)}</TableCell>
                  {showActions && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="mx-auto flex size-8 items-center justify-center rounded-md hover:bg-accent cursor-pointer">
                          <MoreVertical className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() => banMutation.mutate(u._id)}
                            disabled={banMutation.isPending}
                          >
                            {u.isBanned ? (
                              <>
                                <ShieldCheck className="size-4" /> Unban user
                              </>
                            ) : (
                              <>
                                <Ban className="size-4" /> Ban user
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onSelect={() => setToDelete(u)}>
                            <Trash2 className="size-4" /> Delete user
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
        </TableBody>
      </Table>

      {/* Delete confirmation */}
      <Dialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete user?</DialogTitle>
            <DialogDescription>
              This will permanently delete <span className="font-medium text-foreground">{toDelete?.name}</span> and
              all of their data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => toDelete && deleteMutation.mutate(toDelete._id)}
            >
              {deleteMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
