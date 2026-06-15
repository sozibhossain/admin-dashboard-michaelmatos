"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { subscriptionsApi } from "@/lib/api";
import type { Subscription, SubscriptionPayload } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EMPTY: SubscriptionPayload = {
  name: "",
  description: "",
  price: 0,
  currency: "£",
  interval: "Month",
  searchLimit: 0,
  features: [],
  isActive: true,
};

export function PlanFormDialog({
  open,
  onOpenChange,
  plan,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: Subscription | null;
}) {
  const queryClient = useQueryClient();
  const isEdit = !!plan;
  const [form, setForm] = useState<SubscriptionPayload>(EMPTY);

  // Reset the form whenever the dialog (re)opens — render-phase, no effect needed.
  const openKey = open ? plan?._id ?? "new" : "closed";
  const [syncedKey, setSyncedKey] = useState<string | null>(null);
  if (open && openKey !== syncedKey) {
    setSyncedKey(openKey);
    setForm(
      plan
        ? {
            name: plan.name,
            description: plan.description,
            price: plan.price,
            currency: plan.currency,
            interval: plan.interval,
            searchLimit: plan.searchLimit,
            features: plan.features ?? [],
            isActive: plan.isActive,
          }
        : EMPTY
    );
  } else if (!open && syncedKey !== null) {
    setSyncedKey(null);
  }

  const mutation = useMutation({
    mutationFn: (payload: SubscriptionPayload) =>
      isEdit ? subscriptionsApi.update(plan!._id, payload) : subscriptionsApi.create(payload),
    onSuccess: () => {
      toast.success(isEdit ? "Plan updated." : "Plan created.");
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Plan name is required.");
    mutation.mutate({ ...form, price: Number(form.price), searchLimit: Number(form.searchLimit) });
  };

  const set = <K extends keyof SubscriptionPayload>(key: K, value: SubscriptionPayload[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Plan" : "Add New Plan"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the subscription plan details." : "Create a new subscription plan."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Plan Name</Label>
            <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Premium" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Buy the plan and get AI agent suggestion."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => set("price", Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" value={form.currency} onChange={(e) => set("currency", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Billing Interval</Label>
              <Select value={form.interval} onValueChange={(v) => set("interval", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Month">Month</SelectItem>
                  <SelectItem value="Year">Year</SelectItem>
                  <SelectItem value="Unlimited">Unlimited</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="searchLimit">Search Limit</Label>
              <Input
                id="searchLimit"
                type="number"
                min="0"
                value={form.searchLimit}
                onChange={(e) => set("searchLimit", Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="features">Features (comma separated)</Label>
            <Input
              id="features"
              value={form.features.join(", ")}
              onChange={(e) =>
                set(
                  "features",
                  e.target.value.split(",").map((f) => f.trim()).filter(Boolean)
                )
              }
              placeholder="AI agent suggestion, Priority support"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
