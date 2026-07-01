"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedPage } from "@/components/layout/protected-page";
import { GanttChart, type GanttRow } from "@/components/schedule/gantt-chart";
import { createClient } from "@/lib/supabase/client";
import { SCHEDULE_TYPE_LABELS, type SchedulePhase } from "@/types/database";
import { ArrowLeft } from "lucide-react";

type RequirementWithTasks = {
  id: string;
  title: string;
  schedule_type: string | null;
  products: { name: string } | null;
  schedule_tasks: {
    phase: string;
    start_date: string | null;
    end_date: string | null;
  }[];
};

export default function ScheduleGanttPage() {
  const [rows, setRows] = useState<(GanttRow & { _scheduleType: string | null })[]>([]);
  const [isPM, setIsPM] = useState(false);
  const [productName, setProductName] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "tos" | "agile">("all");
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
        supabase
          .from("requirements")
          .select("id, title, schedule_type, products(name), schedule_tasks(phase, start_date, end_date)")
          .not("schedule_type", "is", null)
          .order("updated_at", { ascending: false }),
      ]);

      type ProfileRow = { role: string; products: { name: string } | null };
      const prof = profile as ProfileRow | null;
      setIsPM(prof?.role === "project_manager");
      setProductName(prof?.products?.name ?? null);

      const ganttRows = ((reqs as unknown as RequirementWithTasks[]) || [])
        .map((req) => {
          const bars = req.schedule_tasks
            .filter((t) => t.start_date && t.end_date)
            .map((t) => ({
              id: `${req.id}-${t.phase}`,
              phase: t.phase as SchedulePhase,
              start: t.start_date!,
              end: t.end_date!,
            }));

          const typeLabel = req.schedule_type
            ? SCHEDULE_TYPE_LABELS[req.schedule_type as keyof typeof SCHEDULE_TYPE_LABELS]
            : "";

          return {
            id: req.id,
            label: req.title,
            sublabel: [req.products?.name, typeLabel].filter(Boolean).join(" · "),
            bars,
            _scheduleType: req.schedule_type,
          };
        })
        .filter((r) => r.bars.length > 0);

      setRows(ganttRows);
      setLoading(false);
    }

    load();
  }, []);

  const filteredRows =
    filter === "all"
      ? rows
      : rows.filter((r) => r._scheduleType === filter);

  return (
    <ProtectedPage>
      {loading ? (
        <p className="text-sm text-[#7a96ae]">加载中...</p>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <Link
                href="/requirements"
                className="inline-flex items-center gap-1.5 text-sm text-[#7a96ae] hover:text-[#5ba4d4] transition-colors mb-3"
              >
                <ArrowLeft className="w-4 h-4" />
                返回需求池
              </Link>
              <h1 className="text-xl font-bold text-[#1a2332]">甘特图</h1>
              <p className="text-sm text-[#7a96ae] mt-0.5">
                {isPM
                  ? "全部已排期需求的阶段时间线"
                  : `${productName || "本产品"} 已排期需求时间线`}
              </p>
            </div>

            <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-[#edf3f8] shrink-0">
              <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
                全部
              </FilterButton>
              <FilterButton active={filter === "tos"} onClick={() => setFilter("tos")}>
                TOS
              </FilterButton>
              <FilterButton active={filter === "agile"} onClick={() => setFilter("agile")}>
                敏捷
              </FilterButton>
            </div>
          </div>

          <GanttChart rows={filteredRows} />
        </div>
      )}
    </ProtectedPage>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
        active
          ? "bg-[#5ba4d4] text-white shadow-sm"
          : "text-[#7a96ae] hover:bg-[#f0f4f8]"
      }`}
    >
      {children}
    </button>
  );
}
