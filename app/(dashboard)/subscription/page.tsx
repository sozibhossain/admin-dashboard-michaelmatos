"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { subscriptionsApi } from "@/lib/api";
import type { Subscription } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlanFormDialog } from "@/components/subscription/plan-form-dialog";

export default function SubscriptionPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [toDelete, setToDelete] = useState<Subscription | null>(null);

  const { data: plans, isLoading } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: subscriptionsApi.list,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => subscriptionsApi.remove(id),
    onSuccess: () => {
      toast.success("Plan deleted.");
      setToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (plan: Subscription) => {
    setEditing(plan);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Subscription Plan</h1>
        <Button onClick={openCreate}>
          <Plus className="size-4" /> Add New
        </Button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="gap-4 border-primary/40 p-6">
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-11 w-full" />
            </Card>
          ))
        ) : plans && plans.length > 0 ? (
          plans.map((plan) => (
            <Card key={plan._id} className="gap-4 border-primary/50 p-6">
              <div className="flex items-start justify-between">
                <h2 className="text-2xl font-bold">{plan.name}</h2>
                <button
                  type="button"
                  onClick={() => setToDelete(plan)}
                  aria-label="Delete plan"
                  className="text-primary transition-colors hover:text-destructive cursor-pointer"
                >
                  <Trash2 className="size-5" />
                </button>
              </div>

              <p className="text-sm text-muted-foreground">{plan.description}</p>

              <p className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold">
                  {plan.currency}
                  {plan.price}
                </span>
                <span className="text-sm text-muted-foreground">/ {plan.interval}</span>
              </p>

              <p className="flex items-center gap-2 text-sm font-medium text-primary">
                <Search className="size-4" /> + {plan.searchLimit} Search
              </p>

              <Button className="mt-2 w-full" onClick={() => openEdit(plan)}>
                Edit
              </Button>
            </Card>
          ))
        ) : (
          <div className="col-span-full rounded-xl border border-dashed py-16 text-center text-muted-foreground">
            No subscription plans yet. Click <span className="font-medium text-foreground">Add New</span> to create one.
          </div>
        )}
      </div>

      <PlanFormDialog open={formOpen} onOpenChange={setFormOpen} plan={editing} />

      <Dialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete plan?</DialogTitle>
            <DialogDescription>
              This will permanently delete the{" "}
              <span className="font-medium text-foreground">{toDelete?.name}</span> plan.
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
    </div>
  );
}
