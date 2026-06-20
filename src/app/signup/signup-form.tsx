"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import type { Product } from "@/types/database";

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"product" | "project_manager">("product");
  const [productId, setProductId] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      const supabase = createClient();
      const { data } = await supabase.from("products").select("*").order("name");
      if (data) setProducts(data);
    }
    loadProducts();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (role === "product" && !productId) {
      setError("产品经理需要选择所属产品");
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
          product_id: role === "product" ? productId : null,
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
        onChange={(e) => setRole(e.target.value as "product" | "project_manager")}
        options={[
          { value: "product", label: "产品经理" },
          { value: "project_manager", label: "项管" },
        ]}
      />
      {role === "product" && (
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
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "注册中..." : "注册"}
      </Button>
      <p className="text-center text-sm text-muted">
        已有账号？{" "}
        <Link href="/login" className="text-primary hover:underline">
          登录
        </Link>
      </p>
    </form>
  );
}
