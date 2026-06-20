import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { SCHEDULE_TYPE_LABELS, SCHEDULE_PHASE_LABELS } from "@/types/database";

export default async function ScheduleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  if (profile?.role !== "project_manager") {
    redirect("/requirements");
  }

  const { data: requirement } = await supabase
    .from("requirements")
    .select("*, products(*)")
    .eq("id", id)
    .single();

  if (!requirement) notFound();

  const { data: tasks } = await supabase
    .from("schedule_tasks")
    .select("*")
    .eq("requirement_id", id)
    .order("phase");

  return (
    <AppShell>
      <div className="space-y-6">
        <Link href="/schedule">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
            返回排期列表
          </Button>
        </Link>

        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold">{requirement.title}</h1>
              <p className="text-sm text-muted mt-1">
                {requirement.products?.name}
                {requirement.schedule_type &&
                  ` · ${SCHEDULE_TYPE_LABELS[requirement.schedule_type]}`}
              </p>
            </div>
            {requirement.schedule_type && (
              <Badge variant="warning">
                {SCHEDULE_TYPE_LABELS[requirement.schedule_type]}
              </Badge>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="font-medium mb-4">阶段排期</h2>
          <p className="text-sm text-muted mb-4">
            甘特图视图将在下一阶段实现。当前可先在此查看各阶段任务。
          </p>
          {tasks && tasks.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 font-medium text-muted">阶段</th>
                  <th className="pb-2 font-medium text-muted">开始</th>
                  <th className="pb-2 font-medium text-muted">结束</th>
                  <th className="pb-2 font-medium text-muted">备注</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="py-2">{SCHEDULE_PHASE_LABELS[task.phase]}</td>
                    <td className="py-2 text-muted">{task.start_date || "—"}</td>
                    <td className="py-2 text-muted">{task.end_date || "—"}</td>
                    <td className="py-2 text-muted">{task.milestone_notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-muted text-sm border border-dashed border-border rounded-lg">
              尚未录入排期，甘特图录入功能即将上线
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
