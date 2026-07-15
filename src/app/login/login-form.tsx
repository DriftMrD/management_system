"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const resetSuccess = searchParams.get("reset") === "1";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const loginEmail = email.trim() === "admin" ? "admin@transsion.com" : email.trim();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/requirements");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="邮箱"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        autoComplete="email"
      />
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-[#1a2332]">密码</label>
          <Link
            href="/forgot-password"
            className="text-xs text-[#5ba4d4] hover:text-[#4990c4] font-medium transition-colors"
          >
            忘记密码？
          </Link>
        </div>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />
      </div>
      {resetSuccess && (
        <div className="flex items-start gap-2 text-sm text-[#4db896] bg-[#e8f8f2] rounded-xl px-3.5 py-2.5">
          <span className="mt-0.5 shrink-0">✓</span>
          <span>密码已重置，请使用新密码登录</span>
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2 text-sm text-[#e06060] bg-[#fdeaea] rounded-xl px-3.5 py-2.5">
          <span className="mt-0.5 shrink-0">⚠</span>
          <span>{error}</span>
        </div>
      )}
      <Button type="submit" className="w-full mt-1" disabled={loading}>
        {loading ? "登录中..." : "登录"}
      </Button>
      <p className="text-center text-sm text-[#7a96ae]">
        还没有账号？{" "}
        <Link href="/signup" className="text-[#5ba4d4] hover:text-[#4990c4] font-medium transition-colors">
          注册
        </Link>
      </p>
    </form>
  );
}
