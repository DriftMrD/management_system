import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge, requirementStatusVariant } from "@/components/ui/badge";
import { REQUIREMENT_STATUS_LABELS } from "@/types/database";
import { ChevronRight } from "lucide-react";

export default async function ScheduleOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, products(name)")
    .eq("id", user.id)
    .single();

  const isPM = profile?.role === "project_manager";
  const productName =
    profile && "products" in profile && profile.products
      ? (profile.products as { name: string }).name
      : null;

  const { data: requirements } = await supabase
    .from("requirements")
    .select("*, products(*)")
    .in("rat_status", ["passed"])
    .order("updated_at", { ascending: false });

  const tosReqs = requirements?.filter((r) => r.schedule_type === "tos") || [];
  const agileReqs =
    requirements?.filter((r) => r.schedule_type === "agile") || [];
  const unscheduled =
    requirements?.filter(
      (r) => r.status !== "scheduled" && r.rat_status === "passed"
    ) || [];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div>
          <h1 className="text-xl font-bold text-[#1a2332]">
            {isPM ? "全部排期" : "产品排期"}
          </h1>
          <p className="text-sm text-[#7a96ae] mt-0.5">
            {isPM
              ? "RAT 通过后的需求，按 TOS / 敏捷分类"
              : `${productName || "本产品"} RAT 通过后的排期`}
          </p>
        </div>

        {/* 待录入提示 */}
        {unscheduled.length > 0 && (
          <div className="flex items-center gap-3 bg-[#fef5e4] border border-[#f5d99a] rounded-2xl px-4 py-3.5">
            <span className="text-xl shrink-0">⏰</span>
            <p className="text-sm text-[#a06820] font-medium">
              {unscheduled.length} 条需求 RAT 已通过，待录入排期
            </p>
          </div>
        )}

        {/* 两栏排期 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ScheduleSection
            title="TOS 版本排期"
            count={tosReqs.length}
            requirements={tosReqs}
            emptyText="暂无 TOS 排期需求"
            accentColor="#5ba4d4"
            accentBg="#e8f3fb"
          />
          <ScheduleSection
            title="敏捷迭代排期"
            count={agileReqs.length}
            requirements={agileReqs}
            emptyText="暂无敏捷排期需求"
            accentColor="#4db896"
            accentBg="#e8f8f2"
          />
        </div>
      </div>
    </AppShell>
  );
}

function ScheduleSection({
  title,
  count,
  requirements,
  emptyText,
  accentColor,
  accentBg,
}: {
  title: string;
  count: number;
  requirements: {
    id: string;
    title: string;
    status: string;
    schedule_type: string | null;
    target_delivery_month: string | null;
    products: { name: string } | null;
  }[];
  emptyText: string;
  accentColor: string;
  accentBg: string;
}) {
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden"
      style={{
        boxShadow:
          "0 2px 12px 0 rgb(90 140 180 / 0.10), 0 1px 3px 0 rgb(90 140 180 / 0.06)",
      }}
    >
      {/* 卡片标题 */}
      <div className="px-5 py-4 border-b border-[#f0f4f8] flex items-center gap-3">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: accentColor }}
        />
        <div>
          <h2 className="font-semibold text-[#1a2332] text-sm">{title}</h2>
        </div>
        <span
          className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ color: accentColor, background: accentBg }}
        >
          {count} 条
        </span>
      </div>

      {requirements.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-[#a0b4c4] text-sm">{emptyText}</p>
        </div>
      ) : (
        <ul className="divide-y divide-[#f0f4f8]">
          {requirements.map((req) => (
            <li key={req.id}>
              <Link
                href={`/schedule/${req.id}`}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#f8fbfd] transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1a2332] group-hover:text-[#5ba4d4] transition-colors truncate">
                    {req.title}
                  </p>
                  <p className="text-xs text-[#a0b4c4] mt-0.5">
                    {req.products?.name}
                    {req.target_delivery_month &&
                      ` · ${req.target_delivery_month}`}
                  </p>
                </div>
                <Badge variant={requirementStatusVariant(req.status)}>
                  {
                    REQUIREMENT_STATUS_LABELS[
                      req.status as keyof typeof REQUIREMENT_STATUS_LABELS
                    ]
                  }
                </Badge>
                <ChevronRight className="w-4 h-4 text-[#c0cdd8] group-hover:text-[#5ba4d4] transition-colors shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
