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
        <div>
          <h1 className="text-xl font-semibold">概览</h1>
          <p className="text-sm text-muted mt-0.5">
            {profile?.role === "project_manager"
              ? "全部产品数据汇总"
              : `${productName || "我的产品"} 数据汇总`}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="需求总数" value={total} />
          <StatCard label="未启动" value={notStarted} />
          <StatCard label="待 RAT 评审" value={ratPending} />
          <StatCard label="P0 需求" value={p0Count} />
        </div>

        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="font-medium mb-4">状态分布</h2>
          <div className="space-y-2">
            {Object.entries(REQUIREMENT_STATUS_LABELS).map(([key, label]) => {
              const count =
                requirements?.filter((r) => r.status === key).length || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={key} className="flex items-center gap-3 text-sm">
                  <span className="w-20 text-muted">{label}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-muted">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-border p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}
