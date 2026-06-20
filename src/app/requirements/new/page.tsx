import { AppShell } from "@/components/layout/app-shell";
import { RequirementForm } from "@/components/requirements/requirement-form";
import { createClient } from "@/lib/supabase/server";

export default async function NewRequirementPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("product_id, role")
    .eq("id", user!.id)
    .single();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("name");

  const defaultProductId =
    profile?.role === "product" ? profile.product_id || undefined : undefined;

  return (
    <AppShell>
      <div className="max-w-2xl">
        <h1 className="text-xl font-semibold mb-6">新建需求</h1>
        <div className="bg-white rounded-xl border border-border p-6">
          <RequirementForm
            products={products || []}
            defaultProductId={defaultProductId}
          />
        </div>
      </div>
    </AppShell>
  );
}
