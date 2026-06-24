"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, Textarea } from "@/components/ui/input";
import {
  Badge,
  priorityVariant,
  ratStatusVariant,
  requirementStatusVariant,
} from "@/components/ui/badge";
import { updateRequirement, deleteRequirement } from "@/lib/requirements-api";
import type { Product, Profile, Requirement } from "@/types/database";
import {
  RAT_STATUS_LABELS,
  REQUIREMENT_STATUS_LABELS,
  SCHEDULE_TYPE_LABELS,
  type RatStatus,
  type ScheduleType,
} from "@/types/database";

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
  const [ratStatus, setRatStatus] = useState(requirement.rat_status);
  const [ratNotes, setRatNotes] = useState(requirement.rat_notes);
  const [scheduleType, setScheduleType] = useState<ScheduleType | "">(
    requirement.schedule_type || ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRatUpdate() {
    setLoading(true);
    setError("");

    const updates: Record<string, unknown> = {
      rat_status: ratStatus,
      rat_notes: ratNotes,
    };

    if (ratStatus === "passed" && scheduleType) {
      updates.schedule_type = scheduleType;
      updates.status = "scheduled";
    }

    const result = await updateRequirement(requirement.id, updates);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm("确定删除这条需求？")) return;
    const result = await deleteRequirement(requirement.id);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/requirements");
  }

  return (
    <div className="space-y-5 max-w-3xl">
      {/* 返回按钮 */}
      <Link
        href="/requirements"
        className="inline-flex items-center gap-1.5 text-sm text-[#7a96ae] hover:text-[#5ba4d4] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回需求池
      </Link>

      {/* 主信息卡片 */}
      <div
        className="bg-white rounded-2xl p-6 space-y-5"
        style={{ boxShadow: "0 2px 12px 0 rgb(90 140 180 / 0.10), 0 1px 3px 0 rgb(90 140 180 / 0.06)" }}
      >
        {/* 标题 + 徽章 */}
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
          <div className="flex flex-wrap gap-2 shrink-0">
            <Badge variant={priorityVariant(requirement.priority)}>
              {requirement.priority}
            </Badge>
            <Badge variant={requirementStatusVariant(requirement.status)}>
              {REQUIREMENT_STATUS_LABELS[requirement.status]}
            </Badge>
            <Badge variant={ratStatusVariant(requirement.rat_status)}>
              RAT: {RAT_STATUS_LABELS[requirement.rat_status]}
            </Badge>
            {requirement.schedule_type && (
              <Badge variant="warning">
                {SCHEDULE_TYPE_LABELS[requirement.schedule_type]}
              </Badge>
            )}
          </div>
        </div>

        {/* 元信息网格 */}
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetaItem label="所属产品" value={requirement.products?.name || "—"} />
          <MetaItem
            label="目标交付月"
            value={requirement.target_delivery_month || "未设定"}
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

        {/* 分割线 */}
        {(requirement.description || requirement.supplementary_notes) && (
          <div className="border-t border-[#f0f4f8]" />
        )}

        {/* 详细说明 */}
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

        {/* 补充说明 */}
        {requirement.supplementary_notes && (
          <div>
            <h3 className="text-xs font-semibold text-[#a0b4c4] uppercase tracking-wider mb-2">
              补充说明
            </h3>
            <p className="text-sm text-[#3a4f60] whitespace-pre-wrap leading-relaxed bg-[#f8fbfd] rounded-xl px-4 py-3 border border-[#edf3f8]">
              {requirement.supplementary_notes}
            </p>
          </div>
        )}
      </div>

      {/* 排期入口（产品经理，RAT 已通过且已设排期类型） */}
      {!isProjectManager &&
        requirement.rat_status === "passed" &&
        requirement.schedule_type && (
          <div
            className="bg-white rounded-2xl p-6"
            style={{
              boxShadow:
                "0 2px 12px 0 rgb(90 140 180 / 0.10), 0 1px 3px 0 rgb(90 140 180 / 0.06)",
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold text-[#1a2332]">项目排期</h2>
                <p className="text-sm text-[#7a96ae] mt-1">
                  RAT 已通过，可录入各阶段排期时间
                </p>
              </div>
              <Link href={`/schedule/detail?id=${requirement.id}`}>
                <Button>录入排期</Button>
              </Link>
            </div>
          </div>
        )}

      {/* RAT 评审卡片（仅项管） */}
      {isProjectManager && (
        <div
          className="bg-white rounded-2xl p-6 space-y-4"
          style={{ boxShadow: "0 2px 12px 0 rgb(90 140 180 / 0.10), 0 1px 3px 0 rgb(90 140 180 / 0.06)" }}
        >
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-[#5ba4d4]" />
            <h2 className="font-semibold text-[#1a2332]">RAT 评审（项管）</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="RAT 状态"
              value={ratStatus}
              onChange={(e) => setRatStatus(e.target.value as RatStatus)}
              options={Object.entries(RAT_STATUS_LABELS).map(([v, l]) => ({
                value: v,
                label: l,
              }))}
            />
            {ratStatus === "passed" && (
              <Select
                label="排期类型"
                value={scheduleType}
                onChange={(e) => setScheduleType(e.target.value as ScheduleType)}
                required
                options={[
                  { value: "", label: "请选择排期类型" },
                  ...Object.entries(SCHEDULE_TYPE_LABELS).map(([v, l]) => ({
                    value: v,
                    label: l,
                  })),
                ]}
              />
            )}
          </div>

          <Textarea
            label="RAT 备注"
            value={ratNotes}
            onChange={(e) => setRatNotes(e.target.value)}
            placeholder="评审意见、通过条件等"
          />

          {error && (
            <div className="flex items-start gap-2 text-sm text-[#e06060] bg-[#fdeaea] rounded-xl px-3.5 py-2.5">
              <span className="mt-0.5 shrink-0">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={handleRatUpdate} disabled={loading}>
              {loading ? "保存中..." : "保存评审结果"}
            </Button>
            {ratStatus === "passed" && scheduleType && (
              <Link href={`/schedule/detail?id=${requirement.id}`}>
                <Button variant="secondary">去排期</Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* 删除操作（仅项管） */}
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
