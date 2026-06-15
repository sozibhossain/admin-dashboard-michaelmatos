"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/otp-input";
import { authApi } from "@/lib/api";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [resending, setResending] = useState(false);

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) return toast.error("Please enter the full 6-digit code.");
    // The backend validates the code at the reset step, so we carry it forward.
    router.push(`/reset-password?email=${encodeURIComponent(email)}&code=${code}`);
  }

  async function handleResend() {
    if (!email) return toast.error("Missing email. Please start over.");
    setResending(true);
    try {
      await authApi.forgotPassword(email);
      toast.success("A new code has been sent.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not resend code.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <Logo size={64} />
      <h1 className="mt-6 text-3xl font-bold text-primary">Verify Email</h1>
      <p className="mt-1 text-sm text-foreground/80">Enter the OTP to verify your email</p>

      <form onSubmit={handleVerify} className="mt-8 w-full space-y-6">
        <OtpInput value={code} onChange={setCode} />

        <p className="text-center text-sm text-foreground/80">
          Don&apos;t get a code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="font-semibold text-primary hover:underline disabled:opacity-60 cursor-pointer"
          >
            Resend
          </button>
        </p>

        <Button type="submit" size="lg" className="w-full text-base font-semibold">
          Verify
        </Button>
      </form>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Loader2 className="mx-auto size-6 animate-spin text-primary" />}>
      <VerifyForm />
    </Suspense>
  );
}
