"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { RequirementFormData } from "@/types/database";

export async function createRequirement(data: RequirementFormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "未登录" };

  const { error } = await supabase.from("requirements").insert({
    title: data.title,
    description: data.description,
    product_id: data.product_id,
    priority: data.priority,
    target_delivery_month: data.target_delivery_month || null,
    supplementary_notes: data.supplementary_notes,
    needs_data_analysis: data.needs_data_analysis,
    sr_number: data.sr_number || null,
    created_by: user.id,
    product_manager_id: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/requirements");
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
  const supabase = await createClient();

  const { error } = await supabase
    .from("requirements")
    .update(data)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/requirements");
  revalidatePath(`/requirements/${id}`);
  return { success: true };
}

export async function deleteRequirement(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("requirements").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/requirements");
  return { success: true };
}
