import { AppShell } from "@/components/layout/app-shell";
import { RequirementForm } from "@/components/requirements/requirement-form";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewRequirementPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("product_id, role, products(name)")
    .eq("id", user!.id)
    .single();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("name");

  const isPM = profile?.role === "project_manager";
  const defaultProductId =
    !isPM && profile?.product_id ? profile.product_id : undefined;
  const lockedProductName =
    profile && "products" in profile && profile.products
      ? (profile.products as { name: string }).name
      : undefined;

  return (
    <AppShell>
      <div className="max-w-2xl space-y-5">
        {/* 返回 + 标题 */}
        <div className="flex items-center gap-3">
          <Link
            href="/requirements"
            className="inline-flex items-center gap-1.5 text-sm text-[#7a96ae] hover:text-[#5ba4d4] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回需求池
          </Link>
        </div>
        <h1 className="text-xl font-bold text-[#1a2332]">新建需求</h1>

        {/* 表单卡片 */}
        <div
          className="bg-white rounded-2xl p-6"
          style={{ boxShadow: "0 2px 12px 0 rgb(90 140 180 / 0.10), 0 1px 3px 0 rgb(90 140 180 / 0.06)" }}
        >
          <RequirementForm
            products={products || []}
            defaultProductId={defaultProductId}
            isProjectManager={isPM}
            lockedProductName={lockedProductName}
          />
        </div>
      </div>
    </AppShell>
  );
}
