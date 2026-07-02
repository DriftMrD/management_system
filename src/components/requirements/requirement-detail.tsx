"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, Pencil, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Badge,
  priorityVariant,
  requirementStatusVariant,
} from "@/components/ui/badge";
import { GanttChart } from "@/components/schedule/gantt-chart";
import { ScheduleForm } from "@/components/schedule/schedule-form";
import { deleteRequirement } from "@/lib/requirements-api";
import { createClient } from "@/lib/supabase/client";
import type { Product, Profile, Requirement } from "@/types/database";
import {
  REQUIREMENT_STATUS_LABELS,
  REQUIREMENT_SOURCE_LABELS,
  SCHEDULE_TYPE_LABELS,
  type SchedulePhase,
} from "@/types/database";

type ScheduleTaskRow = {
  phase: string;
  start_date: string | null;
  end_date: string | null;
  milestone_notes: string;
};

interface RequirementDetailProps {
  requirement: Requirement & { products: Product | null };
  isProjectManager: boolean;
  profile: Profile | null;
}

export function RequirementDetail({
  requirement,
  isProjectManager,
}: RequirementDetailProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<ScheduleTaskRow[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  const canSchedule = Boolean(requirement.schedule_type);
  const hasSchedule = tasks.some((t) => t.start_date && t.end_date);
  const supplementaryNotes = displaySupplementaryNotes(
    requirement.supplementary_notes
  );

  const loadTasks = useCallback(async () => {
    setTasksLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("schedule_tasks")
      .select("phase, start_date, end_date, milestone_notes")
      .eq("requirement_id", requirement.id)
      .order("phase");
    setTasks(data || []);
    setTasksLoading(false);
  }, [requirement.id]);

  useEffect(() => {
    if (canSchedule) loadTasks();
  }, [canSchedule, loadTasks]);

  async function handleDelete() {
    if (!confirm("确定删除这条需求？")) return;
    const result = await deleteRequirement(requirement.id);
    if (result.error) {
      alert(result.error);
      return;
    }
    router.push("/requirements");
  }

  return (
    <div className="space-y-5 w-full">
      <Link
        href="/requirements"
        className="inline-flex items-center gap-1.5 text-sm text-[#7a96ae] hover:text-[#5ba4d4] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回需求池
      </Link>

      <div
        className="bg-white rounded-2xl p-6 space-y-5"
        style={{ boxShadow: "0 2px 12px 0 rgb(90 140 180 / 0.10), 0 1px 3px 0 rgb(90 140 180 / 0.06)" }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-[#1a2332] leading-snug">
              {requirement.title}
            </h1>
            {requirement.sr_number && (
              <p className="text-xs text-[#a0b4c4] font-mono mt-1">
                {requirement.sr_number}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Badge variant={priorityVariant(requirement.priority)}>
              {requirement.priority}
            </Badge>
            <Badge variant={requirementStatusVariant(requirement.status)}>
              {REQUIREMENT_STATUS_LABELS[requirement.status]}
            </Badge>
            {requirement.schedule_type && (
              <Badge variant="warning">
                {SCHEDULE_TYPE_LABELS[requirement.schedule_type]}
              </Badge>
            )}
            <Link
              href={`/requirements/edit?id=${requirement.id}&from=detail`}
              title="编辑"
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#7a96ae] hover:text-[#5ba4d4] hover:bg-[#e8f3fb] transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          <MetaItem label="所属产品" value={requirement.products?.name || "—"} />
          <MetaItem
            label="来源"
            value={
              requirement.source
                ? REQUIREMENT_SOURCE_LABELS[requirement.source]
                : "未设定"
            }
          />
          <MetaItem
            label="目标交付月"
            value={requirement.target_delivery_month || "未设定"}
          />
          <MetaItem
            label="落地版本"
            value={requirement.landing_version || "未设定"}
          />
          <MetaItem
            label="数分需求"
            value={requirement.needs_data_analysis ? "需要" : "不需要"}
            highlight={requirement.needs_data_analysis}
          />
          <MetaItem
            label="创建时间"
            value={new Date(requirement.created_at).toLocaleDateString("zh-CN")}
          />
        </dl>

        {(requirement.ai_prd_url ||
          requirement.ai_tracking_url ||
          requirement.ai_demo_url) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <LinkItem label="AI PRD" url={requirement.ai_prd_url} />
            <LinkItem label="AI 埋点" url={requirement.ai_tracking_url} />
            <LinkItem label="AI Demo" url={requirement.ai_demo_url} />
          </div>
        )}

        {(requirement.description || supplementaryNotes) && (
          <div className="border-t border-[#f0f4f8]" />
        )}

        {requirement.description && (
          <div>
            <h3 className="text-xs font-semibold text-[#a0b4c4] uppercase tracking-wider mb-2">
              详细说明
            </h3>
            <p className="text-sm text-[#3a4f60] whitespace-pre-wrap leading-relaxed bg-[#f8fbfd] rounded-xl px-4 py-3 border border-[#edf3f8]">
              {requirement.description}
            </p>
          </div>
        )}

        {supplementaryNotes && (
          <div>
            <h3 className="text-xs font-semibold text-[#a0b4c4] uppercase tracking-wider mb-2">
              补充说明
            </h3>
            <p className="text-sm text-[#3a4f60] whitespace-pre-wrap leading-relaxed bg-[#f8fbfd] rounded-xl px-4 py-3 border border-[#edf3f8]">
              {supplementaryNotes}
            </p>
          </div>
        )}
      </div>

      {canSchedule && requirement.schedule_type && (
        <div
          className="bg-white rounded-2xl p-6 space-y-5"
          style={{
            boxShadow:
              "0 2px 12px 0 rgb(90 140 180 / 0.10), 0 1px 3px 0 rgb(90 140 180 / 0.06)",
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-[#5ba4d4]" />
              <h2 className="font-semibold text-[#1a2332]">项目排期</h2>
            </div>
            {hasSchedule && (
              <Link href={`/schedule/detail?id=${requirement.id}`}>
                <Button variant="secondary" size="sm">
                  编辑排期
                </Button>
              </Link>
            )}
          </div>

          {tasksLoading ? (
            <p className="text-sm text-[#7a96ae]">加载排期中...</p>
          ) : hasSchedule ? (
            <GanttChart
              expandPhases
              rows={[
                {
                  id: requirement.id,
                  label: requirement.title,
                  bars: tasks
                    .filter((t) => t.start_date && t.end_date)
                    .map((t) => ({
                      id: t.phase,
                      phase: t.phase as SchedulePhase,
                      start: t.start_date!,
                      end: t.end_date!,
                      tooltip: t.milestone_notes || undefined,
                    })),
                },
              ]}
            />
          ) : (
            <ScheduleForm
              requirementId={requirement.id}
              scheduleType={requirement.schedule_type}
              initialTasks={tasks.map((t) => ({
                phase: t.phase as SchedulePhase,
                start_date: t.start_date ?? "",
                end_date: t.end_date ?? "",
                milestone_notes: t.milestone_notes,
              }))}
              onSaved={() => {
                loadTasks();
                router.refresh();
              }}
            />
          )}
        </div>
      )}

      {!canSchedule && (
        <div
          className="bg-white rounded-2xl p-6"
          style={{
            boxShadow:
              "0 2px 12px 0 rgb(90 140 180 / 0.10), 0 1px 3px 0 rgb(90 140 180 / 0.06)",
          }}
        >
          <p className="text-sm text-[#7a96ae]">
            请先在需求池中设置「预期落地」类型（TOS 版本 / 敏捷迭代）后再录入排期。
          </p>
        </div>
      )}

      {isProjectManager && (
        <div className="flex justify-end">
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 text-sm text-[#a0b4c4] hover:text-[#e06060] transition-colors py-1.5 px-3 rounded-xl hover:bg-[#fdeaea]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            删除需求
          </button>
        </div>
      )}
    </div>
  );
}

function displaySupplementaryNotes(notes: string): string {
  return notes
    .split("\n")
    .filter((line) => !line.startsWith("预期落地："))
    .join("\n")
    .trim();
}

function LinkItem({ label, url }: { label: string; url: string }) {
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 bg-[#f8fbfd] rounded-xl px-3.5 py-3 border border-[#edf3f8] hover:border-[#5ba4d4]/40 hover:bg-[#e8f3fb] transition-colors group"
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[#a0b4c4] font-medium mb-0.5">{label}</p>
        <p className="text-sm font-medium text-[#5ba4d4] truncate group-hover:underline">
          {url}
        </p>
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-[#a0b4c4] group-hover:text-[#5ba4d4] shrink-0" />
    </a>
  );
}

function MetaItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-[#f8fbfd] rounded-xl px-3.5 py-3 border border-[#edf3f8]">
      <dt className="text-xs text-[#a0b4c4] font-medium mb-1">{label}</dt>
      <dd
        className={`text-sm font-semibold ${
          highlight ? "text-[#4db896]" : "text-[#1a2332]"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
