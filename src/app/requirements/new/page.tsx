"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProtectedPage } from "@/components/layout/protected-page";
import { RequirementForm } from "@/components/requirements/requirement-form";
import { createClient } from "@/lib/supabase/client";
import type { Product, UserRole } from "@/types/database";

export default function NewRequirementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isPM, setIsPM] = useState(false);
  const [defaultProductId, setDefaultProductId] = useState<string | undefined>();
  const [lockedProductName, setLockedProductName] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: profile }, { data: productList }] = await Promise.all([
        supabase
          .from("profiles")
          .select("product_id, role, products(name)")
          .eq("id", user.id)
          .single(),
        supabase.from("products").select("*").order("name"),
      ]);

      type ProfileRow = {
        product_id: string | null;
        role: UserRole;
        products: { name: string } | null;
      };
      const prof = profile as ProfileRow | null;

      const pm = prof?.role === "project_manager";
      setIsPM(pm);
      setProducts(productList || []);
      if (!pm && prof?.product_id) {
        setDefaultProductId(prof.product_id);
        setLockedProductName(prof.products?.name);
      }
      setLoading(false);
    }

    load();
  }, []);

  return (
    <ProtectedPage>
      <div className="space-y-5 w-full">
        <Link
          href="/requirements"
          className="inline-flex items-center gap-1.5 text-sm text-[#7a96ae] hover:text-[#5ba4d4] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回需求池
        </Link>
        <h1 className="text-xl font-bold text-[#1a2332]">新建需求</h1>

        <div
          className="bg-white rounded-2xl p-6"
          style={{
            boxShadow:
              "0 2px 12px 0 rgb(90 140 180 / 0.10), 0 1px 3px 0 rgb(90 140 180 / 0.06)",
          }}
        >
          {loading ? (
            <p className="text-sm text-[#7a96ae]">加载中...</p>
          ) : (
            <RequirementForm
              products={products}
              defaultProductId={defaultProductId}
              isProjectManager={isPM}
              lockedProductName={lockedProductName}
            />
          )}
        </div>
      </div>
    </ProtectedPage>
  );
}
