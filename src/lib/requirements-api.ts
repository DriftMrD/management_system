import { createClient } from "@/lib/supabase/client";
import type { RequirementFormData } from "@/types/database";

export async function createRequirement(data: RequirementFormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "未登录" };

  let productId = data.product_id;

  if (!productId.includes("-")) {
    const { data: product } = await supabase
      .from("products")
      .select("id")
      .eq("code", productId)
      .single();
    if (product) productId = product.id;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, product_id")
    .eq("id", user.id)
    .single();

  if (
    profile?.role === "product" &&
    profile.product_id &&
    productId !== profile.product_id
  ) {
    return { error: "只能为自己所属产品创建需求" };
  }

  const { error } = await supabase.from("requirements").insert({
    title: data.title,
    description: data.description,
    product_id: productId,
    priority: data.priority,
    target_delivery_month: data.target_delivery_month || null,
    supplementary_notes: data.supplementary_notes,
    needs_data_analysis: data.needs_data_analysis,
    sr_number: data.sr_number || null,
    created_by: user.id,
    product_manager_id: user.id,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function updateRequirement(
  id: string,
  data: Partial<RequirementFormData> & {
    rat_status?: string;
    rat_notes?: string;
    status?: string;
    schedule_type?: string | null;
  }
) {
  const supabase = createClient();

  const { error } = await supabase
    .from("requirements")
    .update(data)
    .eq("id", id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteRequirement(id: string) {
  const supabase = createClient();

  const { error } = await supabase.from("requirements").delete().eq("id", id);

  if (error) return { error: error.message };
  return { success: true };
}
