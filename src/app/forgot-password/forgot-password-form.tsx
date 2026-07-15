"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getAuthRedirectUrl } from "@/lib/auth-redirect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: getAuthRedirectUrl("/reset-password") }
    );

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-2 text-sm text-[#4db896] bg-[#e8f8f2] rounded-xl px-3.5 py-2.5">
          <span className="mt-0.5 shrink-0">✓</span>
          <span>
            重置邮件已发送至 <strong>{email.trim()}</strong>
            ，请查收邮箱并点击链接设置新密码。若未收到，请检查垃圾箱。
          </span>
        </div>
        <p className="text-center text-sm text-[#7a96ae]">
          <Link
            href="/login"
            className="text-[#5ba4d4] hover:text-[#4990c4] font-medium transition-colors"
          >
            返回登录
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-[#7a96ae]">
        输入注册邮箱，我们将发送密码重置链接。
      </p>
      <Input
        label="邮箱"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        autoComplete="email"
      />
      {error && (
        <div className="flex items-start gap-2 text-sm text-[#e06060] bg-[#fdeaea] rounded-xl px-3.5 py-2.5">
          <span className="mt-0.5 shrink-0">⚠</span>
          <span>{error}</span>
        </div>
      )}
      <Button type="submit" className="w-full mt-1" disabled={loading}>
        {loading ? "发送中..." : "发送重置邮件"}
      </Button>
      <p className="text-center text-sm text-[#7a96ae]">
        <Link
          href="/login"
          className="text-[#5ba4d4] hover:text-[#4990c4] font-medium transition-colors"
        >
          返回登录
        </Link>
      </p>
    </form>
  );
}
