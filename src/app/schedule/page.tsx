import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge, requirementStatusVariant } from "@/components/ui/badge";
import {
  REQUIREMENT_STATUS_LABELS,
} from "@/types/database";

export default async function ScheduleOverviewPage() {
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

  const { data: requirements } = await supabase
    .from("requirements")
    .select("*, products(*)")
    .in("rat_status", ["passed"])
    .order("updated_at", { ascending: false });

  const tosReqs = requirements?.filter((r) => r.schedule_type === "tos") || [];
  const agileReqs = requirements?.filter((r) => r.schedule_type === "agile") || [];
  const unscheduled =
    requirements?.filter((r) => r.status !== "scheduled" && r.rat_status === "passed") || [];

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold">全部排期</h1>
          <p className="text-sm text-muted mt-0.5">
            RAT 通过后的需求，按 TOS / 敏捷分类
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ScheduleSection
            title="TOS 版本排期"
            requirements={tosReqs}
            emptyText="暂无 TOS 排期需求"
          />
          <ScheduleSection
            title="敏捷迭代排期"
            requirements={agileReqs}
            emptyText="暂无敏捷排期需求"
          />
        </div>

        {unscheduled.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800 font-medium">
              {unscheduled.length} 条需求 RAT 已通过，待录入排期
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function ScheduleSection({
  title,
  requirements,
  emptyText,
}: {
  title: string;
  requirements: {
    id: string;
    title: string;
    status: string;
    schedule_type: string | null;
    target_delivery_month: string | null;
    products: { name: string } | null;
  }[];
  emptyText: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-border">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="font-medium">{title}</h2>
        <p className="text-xs text-muted">{requirements.length} 条</p>
      </div>
      {requirements.length === 0 ? (
        <p className="text-sm text-muted text-center py-8">{emptyText}</p>
      ) : (
        <ul className="divide-y divide-border">
          {requirements.map((req) => (
            <li key={req.id} className="px-4 py-3 hover:bg-slate-50">
              <Link href={`/schedule/${req.id}`} className="block">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium hover:text-primary">
                    {req.title}
                  </span>
                  <Badge variant={requirementStatusVariant(req.status)}>
                    {REQUIREMENT_STATUS_LABELS[req.status as keyof typeof REQUIREMENT_STATUS_LABELS]}
                  </Badge>
                </div>
                <p className="text-xs text-muted mt-1">
                  {req.products?.name}
                  {req.target_delivery_month && ` · ${req.target_delivery_month}`}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
