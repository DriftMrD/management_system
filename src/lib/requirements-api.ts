import { createClient } from "@/lib/supabase/client";
import { isProductScopedRole } from "@/types/database";
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
    profile?.role &&
    isProductScopedRole(profile.role) &&
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
    schedule_type: data.schedule_type || null,
    target_delivery_month: data.target_delivery_month || null,
    landing_version: data.landing_version || null,
    supplementary_notes: data.supplementary_notes,
    needs_data_analysis: data.needs_data_analysis,
    sr_number: data.sr_number || null,
    ai_prd_url: data.ai_prd_url || "",
    ai_tracking_url: data.ai_tracking_url || "",
    ai_demo_url: data.ai_demo_url || "",
    source: data.source || null,
    created_by: user.id,
    product_manager_id: user.id,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function updateRequirement(
  id: string,
  data: Partial<RequirementFormData> & {
    status?: string;
    schedule_type?: string | null;
    landing_version?: string | null;
    target_delivery_month?: string | null;
    source?: string | null;
  }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "未登录" };

  if (data.product_id) {
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
      profile?.role &&
      isProductScopedRole(profile.role) &&
      profile.product_id &&
      productId !== profile.product_id
    ) {
      return { error: "只能修改自己所属产品的需求" };
    }

    data.product_id = productId;
  }

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
