"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { ProtectedPage } from "@/components/layout/protected-page";
import { ScheduleForm } from "@/components/schedule/schedule-form";
import { createClient } from "@/lib/supabase/client";
import { SCHEDULE_TYPE_LABELS, type ScheduleType } from "@/types/database";

type RequirementRow = {
  id: string;
  title: string;
  schedule_type: ScheduleType | null;
  target_delivery_month: string | null;
  products: { name: string } | null;
};

type TaskRow = {
  phase: string;
  start_date: string | null;
  end_date: string | null;
  milestone_notes: string;
};

function ScheduleDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [requirement, setRequirement] = useState<RequirementRow | null>(null);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    async function load() {
      const requirementId = id;
      if (!requirementId) return;

      const supabase = createClient();
      const [{ data: req }, { data: taskList }] = await Promise.all([
        supabase
          .from("requirements")
          .select("*, products(*)")
          .eq("id", requirementId)
          .single(),
        supabase
          .from("schedule_tasks")
          .select("*")
          .eq("requirement_id", requirementId)
          .order("phase"),
      ]);

      if (!req) {
        setNotFound(true);
      } else {
        setRequirement(req);
        setTasks(taskList || []);
      }
      setLoading(false);
    }

    load();
  }, [id]);

  if (loading) {
    return <p className="text-sm text-[#7a96ae]">加载中...</p>;
  }

  if (notFound || !requirement) {
    return <p className="text-sm text-[#7a96ae]">需求不存在或无权访问</p>;
  }

  const scheduleTypeColor =
    requirement.schedule_type === "tos" ? "#5ba4d4" : "#4db896";
  const scheduleTypeBg =
    requirement.schedule_type === "tos" ? "#e8f3fb" : "#e8f8f2";

  return (
    <div className="space-y-5 max-w-4xl">
      <Link
        href="/schedule"
        className="inline-flex items-center gap-1.5 text-sm text-[#7a96ae] hover:text-[#5ba4d4] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回排期列表
      </Link>

      <div
        className="bg-white rounded-2xl p-6"
        style={{
          boxShadow:
            "0 2px 12px 0 rgb(90 140 180 / 0.10), 0 1px 3px 0 rgb(90 140 180 / 0.06)",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1a2332] leading-snug">
              {requirement.title}
            </h1>
            <p className="text-sm text-[#7a96ae] mt-1">
              {requirement.products?.name}
              {requirement.schedule_type &&
                ` · ${SCHEDULE_TYPE_LABELS[requirement.schedule_type]}`}
            </p>
          </div>
          {requirement.schedule_type && (
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shrink-0"
              style={{ color: scheduleTypeColor, background: scheduleTypeBg }}
            >
              {SCHEDULE_TYPE_LABELS[requirement.schedule_type]}
            </span>
          )}
        </div>

        {requirement.target_delivery_month && (
          <div className="mt-4 flex items-center gap-2 text-sm text-[#7a96ae]">
            <CalendarDays className="w-4 h-4" />
            <span>目标交付：{requirement.target_delivery_month}</span>
          </div>
        )}
      </div>

      <div
        className="bg-white rounded-2xl p-6"
        style={{
          boxShadow:
            "0 2px 12px 0 rgb(90 140 180 / 0.10), 0 1px 3px 0 rgb(90 140 180 / 0.06)",
        }}
      >
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-5 rounded-full bg-[#5ba4d4]" />
          <h2 className="font-semibold text-[#1a2332]">阶段排期</h2>
        </div>

        {requirement.schedule_type ? (
          <ScheduleForm
            requirementId={requirement.id}
            scheduleType={requirement.schedule_type}
            initialTasks={tasks.map((t) => ({
              phase: t.phase as import("@/types/database").SchedulePhase,
              start_date: t.start_date ?? "",
              end_date: t.end_date ?? "",
              milestone_notes: t.milestone_notes,
            }))}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-4xl mb-3">📅</div>
            <p className="text-[#7a96ae] font-medium text-sm">尚未设置排期类型</p>
            <p className="text-[#a0b4c4] text-xs mt-1">
              请等待项管完成 RAT 评审并选择 TOS 或敏捷排期类型
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ScheduleDetailPage() {
  return (
    <ProtectedPage>
      <Suspense fallback={<p className="text-sm text-[#7a96ae]">加载中...</p>}>
        <ScheduleDetailContent />
      </Suspense>
    </ProtectedPage>
  );
}
