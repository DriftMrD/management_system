"use client";

import { useEffect, useState } from "react";
import { ProtectedPage } from "@/components/layout/protected-page";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { createClient } from "@/lib/supabase/client";
import { USER_ROLE_LABELS, type UserRole } from "@/types/database";

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [roleLabel, setRoleLabel] = useState("");
  const [productName, setProductName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role, products(name)")
        .eq("id", user.id)
        .single();

      type ProfileRow = {
        full_name: string;
        role: UserRole;
        products: { name: string } | null;
      };
      const prof = profile as ProfileRow | null;

      setEmail(user.email || "");
      setFullName(prof?.full_name || "");
      setRoleLabel(prof?.role ? USER_ROLE_LABELS[prof.role] : "");
      setProductName(prof?.products?.name ?? null);
      setLoading(false);
    }

    load();
  }, []);

  return (
    <ProtectedPage>
      {loading ? (
        <p className="text-sm text-[#7a96ae]">加载中...</p>
      ) : (
        <div className="space-y-6 w-full">
          <div>
            <h1 className="text-xl font-bold text-[#1a2332]">账号设置</h1>
            <p className="text-sm text-[#7a96ae] mt-0.5">管理你的登录信息</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
          <div
            className="bg-white rounded-2xl p-6 space-y-4"
            style={{
              boxShadow:
                "0 2px 12px 0 rgb(90 140 180 / 0.10), 0 1px 3px 0 rgb(90 140 180 / 0.06)",
            }}
          >
            <h2 className="font-semibold text-[#1a2332]">基本信息</h2>
            <dl className="grid gap-3 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-[#a0b4c4] text-xs font-medium mb-1">姓名</dt>
                <dd className="text-[#1a2332] font-medium">{fullName || "—"}</dd>
              </div>
              <div>
                <dt className="text-[#a0b4c4] text-xs font-medium mb-1">邮箱</dt>
                <dd className="text-[#1a2332] font-medium">{email}</dd>
              </div>
              <div>
                <dt className="text-[#a0b4c4] text-xs font-medium mb-1">角色</dt>
                <dd className="text-[#1a2332] font-medium">{roleLabel}</dd>
              </div>
              {productName && (
                <div>
                  <dt className="text-[#a0b4c4] text-xs font-medium mb-1">所属产品</dt>
                  <dd className="text-[#1a2332] font-medium">{productName}</dd>
                </div>
              )}
            </dl>
          </div>

          <div
            className="bg-white rounded-2xl p-6 space-y-4"
            style={{
              boxShadow:
                "0 2px 12px 0 rgb(90 140 180 / 0.10), 0 1px 3px 0 rgb(90 140 180 / 0.06)",
            }}
          >
            <div>
              <h2 className="font-semibold text-[#1a2332]">修改密码</h2>
              <p className="text-sm text-[#7a96ae] mt-1">
                需要输入当前密码以确认身份
              </p>
            </div>
            <ChangePasswordForm />
          </div>
          </div>
        </div>
      )}
    </ProtectedPage>
  );
}
