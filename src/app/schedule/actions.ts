"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SchedulePhase, ScheduleType } from "@/types/database";

export interface ScheduleTaskInput {
  phase: SchedulePhase;
  start_date: string;
  end_date: string;
  milestone_notes: string;
}

export async function saveScheduleTasks(
  requirementId: string,
  scheduleType: ScheduleType,
  tasks: ScheduleTaskInput[]
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "未登录" };

  const rows = tasks.map((task) => ({
    requirement_id: requirementId,
    phase: task.phase,
    schedule_type: scheduleType,
    start_date: task.start_date || null,
    end_date: task.end_date || null,
    milestone_notes: task.milestone_notes || "",
  }));

  const { error } = await supabase
    .from("schedule_tasks")
    .upsert(rows, { onConflict: "requirement_id,phase" });

  if (error) return { error: error.message };

  revalidatePath(`/schedule/${requirementId}`);
  revalidatePath("/schedule");
  return { success: true };
}
