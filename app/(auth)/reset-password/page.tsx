"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/password-input";
import { authApi } from "@/lib/api";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const code = searchParams.get("code") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !code) {
      return toast.error("Reset session expired. Please start again.");
    }
    if (password.length < 8) {
      return toast.error("Password must be at least 8 characters.");
    }
    if (password !== confirm) {
      return toast.error("Passwords do not match.");
    }
    setLoading(true);
    try {
      await authApi.resetPassword({ email, code, newPassword: password });
      toast.success("Password changed successfully. Please log in.");
      router.push("/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <Logo size={64} />
      <h1 className="mt-6 text-3xl font-bold text-primary">Reset Password</h1>
      <p className="mt-1 text-sm text-foreground/80">Create a new password</p>

      <form onSubmit={handleSubmit} className="mt-8 w-full space-y-5">
        <PasswordInput
          withIcon
          placeholder="Create New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        <PasswordInput
          withIcon
          placeholder="Confirm New Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
        />

        <Button type="submit" size="lg" className="w-full text-base font-semibold" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          Change Password
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Loader2 className="mx-auto size-6 animate-spin text-primary" />}>
      <ResetForm />
    </Suspense>
  );
}
