"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, Textarea } from "@/components/ui/input";
import {
  Badge,
  priorityVariant,
  ratStatusVariant,
  requirementStatusVariant,
} from "@/components/ui/badge";
import { updateRequirement, deleteRequirement } from "@/app/requirements/actions";
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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/requirements">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
            返回
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-border p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">{requirement.title}</h1>
            {requirement.sr_number && (
              <p className="text-sm text-muted mt-1">{requirement.sr_number}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
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

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted">所属产品</dt>
            <dd className="font-medium mt-0.5">{requirement.products?.name}</dd>
          </div>
          <div>
            <dt className="text-muted">目标交付月</dt>
            <dd className="font-medium mt-0.5">
              {requirement.target_delivery_month || "未设定"}
            </dd>
          </div>
          <div>
            <dt className="text-muted">数分</dt>
            <dd className="font-medium mt-0.5">
              {requirement.needs_data_analysis ? "需要" : "不需要"}
            </dd>
          </div>
          <div>
            <dt className="text-muted">创建时间</dt>
            <dd className="font-medium mt-0.5">
              {new Date(requirement.created_at).toLocaleDateString("zh-CN")}
            </dd>
          </div>
        </dl>

        {requirement.description && (
          <div>
            <h3 className="text-sm text-muted mb-1">详细说明</h3>
            <p className="text-sm whitespace-pre-wrap">{requirement.description}</p>
          </div>
        )}

        {requirement.supplementary_notes && (
          <div>
            <h3 className="text-sm text-muted mb-1">补充说明</h3>
            <p className="text-sm whitespace-pre-wrap">
              {requirement.supplementary_notes}
            </p>
          </div>
        )}
      </div>

      {isProjectManager && (
        <div className="bg-white rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-semibold">RAT 评审（项管）</h2>
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
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <div className="flex gap-3">
            <Button onClick={handleRatUpdate} disabled={loading}>
              {loading ? "保存中..." : "保存评审结果"}
            </Button>
            {ratStatus === "passed" && scheduleType && (
              <Link href={`/schedule/${requirement.id}`}>
                <Button variant="secondary">去排期</Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {isProjectManager && (
        <div className="flex justify-end">
          <Button variant="danger" size="sm" onClick={handleDelete}>
            删除需求
          </Button>
        </div>
      )}
    </div>
  );
}
