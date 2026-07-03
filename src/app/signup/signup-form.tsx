"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { requiresProductSelection, type UserRole } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";

type ProductOption = { id: string; code: string; name: string };

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<UserRole>("product");
  const [productId, setProductId] = useState("");
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select("id, code, name")
        .order("name");
      setProducts(data || []);
    }

    loadProducts();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (requiresProductSelection(role) && !productId) {
      setError("需要选择所属产品");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          role,
          product_id: requiresProductSelection(role) ? productId : null,
        })
        .eq("id", authData.user.id);

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }
    }

    router.push("/requirements");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="姓名"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="张三"
        required
      />
      <Input
        label="邮箱"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        autoComplete="email"
      />
      <Input
        label="密码"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="至少 6 位"
        required
        minLength={6}
        autoComplete="new-password"
      />
      <Select
        label="角色"
        value={role}
        onChange={(e) => setRole(e.target.value as UserRole)}
        options={[
          { value: "product", label: "产品经理" },
          { value: "developer", label: "研发" },
          { value: "project_manager", label: "项管" },
        ]}
      />
      {requiresProductSelection(role) && (
        <Select
          label="所属产品"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          required
          options={[
            { value: "", label: "请选择产品" },
            ...products.map((p) => ({ value: p.id, label: p.name })),
          ]}
        />
      )}
      {error && (
        <div className="flex items-start gap-2 text-sm text-[#e06060] bg-[#fdeaea] rounded-xl px-3.5 py-2.5">
          <span className="mt-0.5 shrink-0">⚠</span>
          <span>{error}</span>
        </div>
      )}
      <Button type="submit" className="w-full mt-1" disabled={loading}>
        {loading ? "注册中..." : "注册"}
      </Button>
      <p className="text-center text-sm text-[#7a96ae]">
        已有账号？{" "}
        <Link href="/login" className="text-[#5ba4d4] hover:text-[#4990c4] font-medium transition-colors">
          登录
        </Link>
      </p>
    </form>
  );
}
