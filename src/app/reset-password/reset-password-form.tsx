"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ResetPasswordForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let settled = false;

    function markReady() {
      if (settled) return;
      settled = true;
      setReady(true);
    }

    function markInvalid(message: string) {
      if (settled) return;
      settled = true;
      setLinkError(message);
      setReady(true);
    }

    async function bootstrap() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const hashError = new URLSearchParams(
        window.location.hash.replace(/^#/, "")
      ).get("error_description");

      if (hashError) {
        markInvalid(decodeURIComponent(hashError.replace(/\+/g, " ")));
        return;
      }

      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          markInvalid(exchangeError.message || "重置链接无效或已过期");
          return;
        }
        markReady();
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        markReady();
        return;
      }

      // 等待 hash token / PASSWORD_RECOVERY
      window.setTimeout(() => {
        if (!settled) {
          markInvalid("重置链接无效或已过期，请重新申请。");
        }
      }, 4000);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (session && event === "SIGNED_IN")) {
        markReady();
      }
    });

    bootstrap();

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("新密码至少 6 位");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("两次输入的新密码不一致");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setLoading(false);
      setError(updateError.message);
      return;
    }

    await supabase.auth.signOut();
    setLoading(false);
    router.replace("/login?reset=1");
  }

  if (!ready) {
    return (
      <p className="text-sm text-[#7a96ae] text-center py-4">正在验证重置链接…</p>
    );
  }

  if (linkError) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-2 text-sm text-[#e06060] bg-[#fdeaea] rounded-xl px-3.5 py-2.5">
          <span className="mt-0.5 shrink-0">⚠</span>
          <span>{linkError}</span>
        </div>
        <p className="text-center text-sm text-[#7a96ae]">
          <Link
            href="/forgot-password"
            className="text-[#5ba4d4] hover:text-[#4990c4] font-medium transition-colors"
          >
            重新申请重置
          </Link>
          {" · "}
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
      <p className="text-sm text-[#7a96ae]">请设置新的登录密码。</p>
      <Input
        label="新密码"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="至少 6 位"
        required
        minLength={6}
        autoComplete="new-password"
      />
      <Input
        label="确认新密码"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="再次输入新密码"
        required
        minLength={6}
        autoComplete="new-password"
      />
      {error && (
        <div className="flex items-start gap-2 text-sm text-[#e06060] bg-[#fdeaea] rounded-xl px-3.5 py-2.5">
          <span className="mt-0.5 shrink-0">⚠</span>
          <span>{error}</span>
        </div>
      )}
      <Button type="submit" className="w-full mt-1" disabled={loading}>
        {loading ? "保存中..." : "设置新密码"}
      </Button>
    </form>
  );
}
