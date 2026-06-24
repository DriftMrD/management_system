import { AppShell } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/server";
import { REQUIREMENT_STATUS_LABELS } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, products(name)")
    .eq("id", user!.id)
    .single();

  const { data: requirements } = await supabase
    .from("requirements")
    .select("status, rat_status, priority");

  const total = requirements?.length || 0;
  const notStarted =
    requirements?.filter((r) => r.status === "not_started").length || 0;
  const ratPending =
    requirements?.filter((r) => r.rat_status === "not_reviewed").length || 0;
  const p0Count =
    requirements?.filter((r) => r.priority === "P0").length || 0;

  const productName =
    profile && "products" in profile && profile.products
      ? (profile.products as { name: string }).name
      : null;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div>
          <h1 className="text-xl font-bold text-[#1a2332]">概览</h1>
          <p className="text-sm text-[#7a96ae] mt-0.5">
            {profile?.role === "project_manager"
              ? "全部产品数据汇总"
              : `${productName || "我的产品"} 数据汇总`}
          </p>
        </div>

        {/* 数据卡片组 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="需求总数"
            value={total}
            color="#5ba4d4"
            bg="#e8f3fb"
            icon="📋"
          />
          <StatCard
            label="未启动"
            value={notStarted}
            color="#7a96ae"
            bg="#edf3f8"
            icon="⏳"
          />
          <StatCard
            label="待 RAT 评审"
            value={ratPending}
            color="#e8a43c"
            bg="#fef5e4"
            icon="🔍"
          />
          <StatCard
            label="P0 需求"
            value={p0Count}
            color="#e06060"
            bg="#fdeaea"
            icon="🔥"
          />
        </div>

        {/* 状态分布 */}
        <div
          className="bg-white rounded-2xl p-6"
          style={{ boxShadow: "0 2px 12px 0 rgb(90 140 180 / 0.10), 0 1px 3px 0 rgb(90 140 180 / 0.06)" }}
        >
          <h2 className="font-semibold text-[#1a2332] mb-5">状态分布</h2>
          <div className="space-y-3.5">
            {Object.entries(REQUIREMENT_STATUS_LABELS).map(([key, label]) => {
              const count =
                requirements?.filter((r) => r.status === key).length || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const barColors: Record<string, string> = {
                not_started: "#a0b4c4",
                in_progress: "#5ba4d4",
                scheduled: "#e8a43c",
                completed: "#4db896",
                cancelled: "#e06060",
              };
              const barColor = barColors[key] || "#5ba4d4";
              return (
                <div key={key} className="flex items-center gap-3 text-sm">
                  <span className="w-20 text-[#7a96ae] shrink-0">{label}</span>
                  <div className="flex-1 h-2 bg-[#f0f4f8] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: barColor }}
                    />
                  </div>
                  <span className="w-8 text-right text-[#7a96ae] tabular-nums">{count}</span>
                  <span className="w-8 text-right text-[#a0b4c4] text-xs tabular-nums">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  color,
  bg,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  bg: string;
  icon: string;
}) {
  return (
    <div
      className="bg-white rounded-2xl p-5"
      style={{ boxShadow: "0 2px 12px 0 rgb(90 140 180 / 0.10), 0 1px 3px 0 rgb(90 140 180 / 0.06)" }}
    >
      {/* 图标标签 */}
      <div
        className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-lg mb-3"
        style={{ background: bg }}
      >
        {icon}
      </div>
      <p className="text-[28px] font-bold leading-none" style={{ color }}>
        {value}
      </p>
      <p className="text-xs text-[#7a96ae] mt-1.5 font-medium">{label}</p>
    </div>
  );
}
