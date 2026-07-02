"use client";

import { useEffect, useState } from "react";
import { ProtectedPage } from "@/components/layout/protected-page";
import { createClient } from "@/lib/supabase/client";
import { REQUIREMENT_STATUS_LABELS } from "@/types/database";

type RequirementStats = {
  status: string;
  priority: string;
};

export default function DashboardPage() {
  const [requirements, setRequirements] = useState<RequirementStats[]>([]);
  const [subtitle, setSubtitle] = useState("数据汇总");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: profile }, { data: reqs }] = await Promise.all([
        supabase
          .from("profiles")
          .select("role, products(name)")
          .eq("id", user.id)
          .single(),
        supabase.from("requirements").select("status, priority"),
      ]);

      type ProfileRow = { role: string; products: { name: string } | null };
      const p = profile as ProfileRow | null;

      const productName = p?.products?.name ?? null;

      setSubtitle(
        p?.role === "project_manager"
          ? "全部产品数据汇总"
          : `${productName || "我的产品"} 数据汇总`
      );
      setRequirements(reqs || []);
      setLoading(false);
    }

    load();
  }, []);

  const total = requirements.length;
  const notStarted = requirements.filter((r) => r.status === "not_started").length;
  const inProgress = requirements.filter((r) => r.status === "in_progress").length;
  const p0Count = requirements.filter((r) => r.priority === "P0").length;

  return (
    <ProtectedPage>
      {loading ? (
        <p className="text-sm text-[#7a96ae]">加载中...</p>
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-bold text-[#1a2332]">概览</h1>
            <p className="text-sm text-[#7a96ae] mt-0.5">{subtitle}</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="需求总数" value={total} color="#5ba4d4" bg="#e8f3fb" icon="📋" />
            <StatCard label="未启动" value={notStarted} color="#7a96ae" bg="#edf3f8" icon="⏳" />
            <StatCard label="进行中" value={inProgress} color="#e8a43c" bg="#fef5e4" icon="🚀" />
            <StatCard label="P0 需求" value={p0Count} color="#e06060" bg="#fdeaea" icon="🔥" />
          </div>

          <div
            className="bg-white rounded-2xl p-6"
            style={{
              boxShadow:
                "0 2px 12px 0 rgb(90 140 180 / 0.10), 0 1px 3px 0 rgb(90 140 180 / 0.06)",
            }}
          >
            <h2 className="font-semibold text-[#1a2332] mb-5">状态分布</h2>
            <div className="space-y-3.5">
              {Object.entries(REQUIREMENT_STATUS_LABELS).map(([key, label]) => {
                const count = requirements.filter((r) => r.status === key).length;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                const barColors: Record<string, string> = {
                  not_started: "#a0b4c4",
                  in_progress: "#5ba4d4",
                  reviewed: "#7c6cc8",
                  pending_schedule: "#8aa4b8",
                  scheduled: "#e8a43c",
                  in_development: "#5ba4d4",
                  testing: "#6b9fd4",
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
                    <span className="w-8 text-right text-[#a0b4c4] text-xs tabular-nums">
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </ProtectedPage>
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
      style={{
        boxShadow:
          "0 2px 12px 0 rgb(90 140 180 / 0.10), 0 1px 3px 0 rgb(90 140 180 / 0.06)",
      }}
    >
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
