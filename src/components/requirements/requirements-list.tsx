"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, Pencil, Eye } from "lucide-react";
import { Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateRequirement } from "@/lib/requirements-api";
import { BadgeSelect } from "@/components/ui/badge-select";
import {
  Badge,
  priorityVariant,
  requirementSourceVariant,
  requirementStatusVariant,
  scheduleTypeVariant,
} from "@/components/ui/badge";
import type {
  Product,
  PriorityLevel,
  Requirement,
  RequirementSource,
  RequirementStatus,
  ScheduleType,
} from "@/types/database";
import {
  REQUIREMENT_STATUS_LABELS,
  REQUIREMENT_SOURCE_LABELS,
  PRIORITY_LABELS,
  SCHEDULE_TYPE_LABELS,
} from "@/types/database";

interface RequirementsListProps {
  requirements: (Requirement & { products: Product | null })[];
  products: Product[];
  isProjectManager: boolean;
}

export function RequirementsList({
  requirements,
  products,
  isProjectManager,
}: RequirementsListProps) {
  const router = useRouter();
  const [items, setItems] = useState(requirements);
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [savingCell, setSavingCell] = useState<string | null>(null);

  useEffect(() => {
    setItems(requirements);
  }, [requirements]);

  const filtered = items.filter((req) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      req.title.toLowerCase().includes(q) ||
      (req.description || "").toLowerCase().includes(q) ||
      (req.sr_number || "").toLowerCase().includes(q) ||
      (req.supplementary_notes || "").toLowerCase().includes(q);
    const matchProduct = !productFilter || req.product_id === productFilter;
    const matchStatus = !statusFilter || req.status === statusFilter;
    const matchPriority = !priorityFilter || req.priority === priorityFilter;
    return matchSearch && matchProduct && matchStatus && matchPriority;
  });

  async function handleFieldChange(
    id: string,
    field: "priority" | "status" | "schedule_type" | "source",
    value:
      | PriorityLevel
      | RequirementStatus
      | ScheduleType
      | RequirementSource
      | null
  ) {
    setSavingCell(`${id}:${field}`);
    const payload =
      field === "schedule_type" || field === "source"
        ? { [field]: value || null }
        : { [field]: value };
    const result = await updateRequirement(id, payload);
    setSavingCell(null);

    if (result.error) {
      alert(result.error);
      return;
    }

    setItems((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value || null } : r))
    );
    router.refresh();
  }

  function isSaving(id: string, field: string) {
    return savingCell === `${id}:${field}`;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1a2332]">需求池</h1>
          <p className="text-sm text-[#7a96ae] mt-0.5">
            共 {filtered.length} 条需求
            {isProjectManager && " · 项管视图（全部产品）"}
          </p>
        </div>
        <Link href="/requirements/new">
          <Button>
            <Plus className="w-4 h-4" />
            新建需求
          </Button>
        </Link>
      </div>

      <div
        className="bg-white rounded-2xl p-4 space-y-3"
        style={{ boxShadow: "0 2px 12px 0 rgb(90 140 180 / 0.08), 0 1px 3px 0 rgb(90 140 180 / 0.05)" }}
      >
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0b4c4]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索需求描述、编号、补充说明..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[#dde6ef] bg-[#f8fbfd] text-[#1a2332] placeholder:text-[#a0b4c4] focus:border-[#5ba4d4] focus:outline-none focus:ring-3 focus:ring-[#5ba4d4]/12 transition-all"
          />
        </div>

        <div
          className={`grid gap-3 ${
            isProjectManager
              ? "grid-cols-2 sm:grid-cols-3"
              : "grid-cols-2 sm:grid-cols-2"
          }`}
        >
          {isProjectManager && (
            <Select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              options={[
                { value: "", label: "全部产品" },
                ...products.map((p) => ({ value: p.id, label: p.name })),
              ]}
            />
          )}
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: "", label: "全部状态" },
              ...Object.entries(REQUIREMENT_STATUS_LABELS).map(([v, l]) => ({
                value: v,
                label: l,
              })),
            ]}
          />
          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            options={[
              { value: "", label: "全部优先级" },
              ...Object.entries(PRIORITY_LABELS).map(([v, l]) => ({
                value: v,
                label: l,
              })),
            ]}
          />
        </div>
      </div>

      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 2px 12px 0 rgb(90 140 180 / 0.08), 0 1px 3px 0 rgb(90 140 180 / 0.05)" }}
      >
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-[#7a96ae] font-medium">暂无需求</p>
            <Link
              href="/requirements/new"
              className="inline-block mt-2 text-sm text-[#5ba4d4] hover:text-[#4990c4] font-medium transition-colors"
            >
              创建第一条需求 →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#edf3f8] bg-[#f8fbfd]">
                  <th className="px-5 py-3.5 font-medium text-[#7a96ae] text-left">需求描述</th>
                  {isProjectManager && (
                    <th className="px-5 py-3.5 font-medium text-[#7a96ae] text-left">产品</th>
                  )}
                  <th className="px-5 py-3.5 font-medium text-[#7a96ae] text-left">优先级</th>
                  <th className="px-5 py-3.5 font-medium text-[#7a96ae] text-left">进展</th>
                  <th className="px-5 py-3.5 font-medium text-[#7a96ae] text-left min-w-[100px]">
                    预期落地
                  </th>
                  <th className="px-5 py-3.5 font-medium text-[#7a96ae] text-left min-w-[100px]">
                    需求来源
                  </th>
                  <th className="px-5 py-3.5 font-medium text-[#7a96ae] text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f4f8]">
                {filtered.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-[#f8fbfd] transition-colors group"
                  >
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/requirements/detail?id=${req.id}`}
                        className="font-medium text-[#1a2332] hover:text-[#5ba4d4] transition-colors"
                      >
                        {req.title}
                      </Link>
                      {req.sr_number && (
                        <p className="text-xs text-[#a0b4c4] mt-0.5 font-mono">
                          {req.sr_number}
                        </p>
                      )}
                    </td>
                    {isProjectManager && (
                      <td className="px-5 py-3.5">
                        <Badge variant="primary">{req.products?.name}</Badge>
                      </td>
                    )}
                    <td className="px-5 py-3.5">
                      <BadgeSelect
                        value={req.priority}
                        disabled={isSaving(req.id, "priority")}
                        variant={priorityVariant(req.priority)}
                        options={Object.entries(PRIORITY_LABELS).map(([v, l]) => ({
                          value: v as PriorityLevel,
                          label: l,
                        }))}
                        onChange={(priority) =>
                          handleFieldChange(req.id, "priority", priority)
                        }
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <BadgeSelect
                        value={req.status}
                        disabled={isSaving(req.id, "status")}
                        variant={requirementStatusVariant(req.status)}
                        options={Object.entries(REQUIREMENT_STATUS_LABELS).map(
                          ([v, l]) => ({
                            value: v as RequirementStatus,
                            label: l,
                          })
                        )}
                        onChange={(status) =>
                          handleFieldChange(req.id, "status", status)
                        }
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <BadgeSelect
                        value={req.schedule_type || ""}
                        disabled={isSaving(req.id, "schedule_type")}
                        variant={scheduleTypeVariant(req.schedule_type)}
                        options={[
                          { value: "", label: "未设定" },
                          ...Object.entries(SCHEDULE_TYPE_LABELS).map(([v, l]) => ({
                            value: v as ScheduleType,
                            label: l,
                          })),
                        ]}
                        onChange={(scheduleType) =>
                          handleFieldChange(
                            req.id,
                            "schedule_type",
                            scheduleType || null
                          )
                        }
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <BadgeSelect
                        value={req.source || ""}
                        disabled={isSaving(req.id, "source")}
                        variant={requirementSourceVariant(req.source)}
                        options={[
                          { value: "", label: "未设定" },
                          ...Object.entries(REQUIREMENT_SOURCE_LABELS).map(
                            ([v, l]) => ({
                              value: v as RequirementSource,
                              label: l,
                            })
                          ),
                        ]}
                        onChange={(source) =>
                          handleFieldChange(req.id, "source", source || null)
                        }
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/requirements/detail?id=${req.id}`}
                          title="查看"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#7a96ae] hover:text-[#5ba4d4] hover:bg-[#e8f3fb] transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/requirements/edit?id=${req.id}&from=list`}
                          title="编辑"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#7a96ae] hover:text-[#5ba4d4] hover:bg-[#e8f3fb] transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
