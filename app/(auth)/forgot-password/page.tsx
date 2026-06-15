"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email.");
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      toast.success("We've sent a reset code to your email.");
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <Logo size={64} />
      <h1 className="mt-6 text-3xl font-bold text-primary">Forgot Password</h1>
      <p className="mt-1 text-sm text-foreground/80">Enter your email to recover your password</p>

      <form onSubmit={handleSubmit} className="mt-8 w-full space-y-6">
        <div className="relative">
          <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="email"
            placeholder="Enter your email"
            className="pl-10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <Button type="submit" size="lg" className="w-full text-base font-semibold" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          Send OTP
        </Button>
      </form>
    </div>
  );
}
