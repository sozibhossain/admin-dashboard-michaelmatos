"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";

import { profileApi, authApi } from "@/lib/api";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/password-input";
import { Skeleton } from "@/components/ui/skeleton";

const fieldClass = "h-11 border-primary/30 bg-soft";

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: me, isLoading } = useQuery({ queryKey: ["me"], queryFn: profileApi.me });

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Sync the name fields from the loaded profile — render-phase, no effect needed.
  const [syncedId, setSyncedId] = useState<string | null>(null);
  if (me && !editing && syncedId !== me._id) {
    setSyncedId(me._id);
    const [first, ...rest] = (me.name ?? "").split(" ");
    setFirstName(first ?? "");
    setLastName(rest.join(" "));
  }

  const updateProfile = useMutation({
    mutationFn: (formData: FormData) => profileApi.update(formData),
    onSuccess: (data) => {
      toast.success("Profile updated.");
      queryClient.setQueryData(["me"], data);
      setEditing(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const changePassword = useMutation({
    mutationFn: () => authApi.changePassword({ currentPassword, newPassword }),
    onSuccess: () => {
      toast.success("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSaveProfile = () => {
    const fullName = `${firstName} ${lastName}`.trim();
    if (!fullName) return toast.error("Name cannot be empty.");
    const fd = new FormData();
    fd.append("name", fullName);
    updateProfile.mutate(fd);
  };

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("avatar", file);
    updateProfile.mutate(fd);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return toast.error("Please fill in all password fields.");
    if (newPassword.length < 8) return toast.error("New password must be at least 8 characters.");
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match.");
    changePassword.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <Card className="p-6">
        {isLoading ? (
          <div className="flex items-center gap-4">
            <Skeleton className="size-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-52" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="size-20 border-2 border-primary/30">
                  <AvatarImage src={me?.avatar || undefined} alt={me?.name} />
                  <AvatarFallback className="text-lg">{getInitials(me?.name)}</AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  aria-label="Change avatar"
                  className="absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 cursor-pointer"
                >
                  {updateProfile.isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Pencil className="size-3.5" />
                  )}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{me?.name}</h2>
                <p className="text-muted-foreground">{me?.email}</p>
              </div>
            </div>
            <Badge variant="outline" className="self-start bg-accent text-accent-foreground capitalize">
              {me?.accountType}
            </Badge>
          </div>
        )}
      </Card>

      {/* Contact information */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Contact Information</h3>
          {editing ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (me) {
                    const [first, ...rest] = (me.name ?? "").split(" ");
                    setFirstName(first ?? "");
                    setLastName(rest.join(" "));
                  }
                  setEditing(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveProfile} disabled={updateProfile.isPending}>
                {updateProfile.isPending && <Loader2 className="size-4 animate-spin" />}
                Save
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setEditing(true)} disabled={isLoading}>
              Edit Profile
            </Button>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>First Name</Label>
            <Input
              className={fieldClass}
              placeholder="First Name"
              value={firstName}
              disabled={!editing}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Last Name</Label>
            <Input
              className={fieldClass}
              placeholder="Last Name"
              value={lastName}
              disabled={!editing}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input className={fieldClass} placeholder="Email" value={me?.email ?? ""} disabled readOnly />
          </div>
        </div>
      </Card>

      {/* Change password */}
      <Card className="p-6">
        <form onSubmit={handleChangePassword}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Change Password</h3>
            <Button type="submit" disabled={changePassword.isPending}>
              {changePassword.isPending && <Loader2 className="size-4 animate-spin" />}
              Save Changes
            </Button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <PasswordInput
                className={fieldClass}
                placeholder="••••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <PasswordInput
                className={fieldClass}
                placeholder="••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <PasswordInput
                className={fieldClass}
                placeholder="••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
