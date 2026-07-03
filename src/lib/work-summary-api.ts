import { createClient } from "@/lib/supabase/client";

const WORK_SUMMARY_FUNCTION =
  process.env.NEXT_PUBLIC_WORK_SUMMARY_FUNCTION ?? "smart-function";

export async function generateWorkSummary(): Promise<{
  summary?: string;
  error?: string;
}> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { error: "未登录" };
  }

  const { data, error } = await supabase.functions.invoke<{
    summary?: string;
    error?: string;
  }>(WORK_SUMMARY_FUNCTION, { body: {} });

  if (error) {
    try {
      const ctx = await error.context?.json?.();
      if (ctx?.error && typeof ctx.error === "string") {
        return { error: ctx.error };
      }
    } catch {
      // ignore JSON parse errors
    }
    return { error: error.message || "生成失败" };
  }

  if (data?.error) {
    return { error: data.error };
  }

  if (!data?.summary) {
    return { error: "生成失败" };
  }

  return { summary: data.summary };
}
