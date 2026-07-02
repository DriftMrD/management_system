"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, Pencil, Eye, ChevronUp, ChevronDown, ChevronRight } from "lucide-react";
import { FilterSelect } from "@/components/ui/filter-select";
import { Button } from "@/components/ui/button";
import { updateRequirement } from "@/lib/requirements-api";
import { BadgeSelect } from "@/components/ui/badge-select";
import {
  Badge,
  priorityVariant,
  requirementStatusVariant,
  scheduleTypeVariant,
} from "@/components/ui/badge";
import type {
  Product,
  PriorityLevel,
  Requirement,
  RequirementStatus,
  ScheduleType,
} from "@/types/database";
import {
  PRIORITY_LABELS,
  REQUIREMENT_STATUS_LABELS,
  SCHEDULE_TYPE_LABELS,
} from "@/types/database";

const DELIVERY_MONTHS = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

const UNSET_FILTER = "__unset__";

type SortKey =
  | "product"
  | "priority"
  | "status"
  | "schedule_type"
  | "target_delivery_month"
  | "landing_version";

type SortDir = "asc" | "desc";

const PRIORITY_ORDER: Record<PriorityLevel, number> = { P0: 0, P1: 1, P2: 2 };
const STATUS_ORDER = Object.keys(
  REQUIREMENT_STATUS_LABELS
) as RequirementStatus[];

type StatusCompareOp = "" | "gt" | "lt";

function statusIndex(status: RequirementStatus): number {
  return STATUS_ORDER.indexOf(status);
}

function matchStatusCompare(
  status: RequirementStatus,
  op: StatusCompareOp,
  value: string
) {
  if (!op || !value) return true;
  const reqIdx = statusIndex(status);
  const valIdx = statusIndex(value as RequirementStatus);
  if (reqIdx === -1 || valIdx === -1) return true;
  if (op === "gt") return reqIdx > valIdx;
  if (op === "lt") return reqIdx < valIdx;
  return true;
}
const SCHEDULE_ORDER: Record<string, number> = { agile: 0, tos: 1 };

function monthOrder(value: string | null): number {
  if (!value) return 99;
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? 99 : n;
}

function compareScheduleType(
  a: Requirement & { products: Product | null },
  b: Requirement & { products: Product | null }
) {
  return (
    (SCHEDULE_ORDER[a.schedule_type || ""] ?? 9) -
    (SCHEDULE_ORDER[b.schedule_type || ""] ?? 9)
  );
}

function compareTargetMonth(
  a: Requirement & { products: Product | null },
  b: Requirement & { products: Product | null }
) {
  return (
    monthOrder(a.target_delivery_month) - monthOrder(b.target_delivery_month)
  );
}

function sortRequirements(
  list: (Requirement & { products: Product | null })[],
  sortKey: SortKey | null,
  sortDir: SortDir
) {
  const dir = sortDir === "asc" ? 1 : -1;
  return [...list].sort((a, b) => {
    if (!sortKey) {
      const cmp = compareScheduleType(a, b);
      if (cmp !== 0) return cmp;
      return compareTargetMonth(a, b);
    }

    let cmp = 0;
    switch (sortKey) {
      case "product":
        cmp = (a.products?.name || "").localeCompare(
          b.products?.name || "",
          "zh-CN"
        );
        break;
      case "priority":
        cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        break;
      case "status":
        cmp = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
        break;
      case "schedule_type":
        cmp = compareScheduleType(a, b);
        break;
      case "target_delivery_month":
        cmp = compareTargetMonth(a, b);
        break;
      case "landing_version":
        cmp = (a.landing_version || "").localeCompare(
          b.landing_version || "",
          "zh-CN"
        );
        break;
    }
    return cmp * dir;
  });
}

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
  const [statusCompareOp, setStatusCompareOp] = useState<StatusCompareOp>("");
  const [statusCompareValue, setStatusCompareValue] = useState("");
  const [scheduleTypeFilter, setScheduleTypeFilter] = useState("");
  const [productFocus, setProductFocus] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [savingCell, setSavingCell] = useState<string | null>(null);
  const [completedExpanded, setCompletedExpanded] = useState(false);

  useEffect(() => {
    setItems(requirements);
  }, [requirements]);

  const hasActiveFilters = Boolean(
    search ||
      productFilter ||
      scheduleTypeFilter ||
      productFocus ||
      (statusCompareOp && statusCompareValue)
  );

  const effectiveStatusOp = productFocus ? "lt" : statusCompareOp;
  const effectiveStatusValue = productFocus ? "scheduled" : statusCompareValue;

  const filtered = items.filter((req) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      req.title.toLowerCase().includes(q) ||
      (req.description || "").toLowerCase().includes(q) ||
      (req.sr_number || "").toLowerCase().includes(q) ||
      (req.supplementary_notes || "").toLowerCase().includes(q) ||
      (req.landing_version || "").toLowerCase().includes(q);
    const matchProduct = !productFilter || req.product_id === productFilter;
    const matchStatus = matchStatusCompare(
      req.status,
      effectiveStatusOp,
      effectiveStatusValue
    );
    const matchScheduleType =
      !scheduleTypeFilter ||
      (scheduleTypeFilter === UNSET_FILTER
        ? !req.schedule_type
        : req.schedule_type === scheduleTypeFilter);

    return matchSearch && matchProduct && matchStatus && matchScheduleType;
  });

  const sorted = useMemo(
    () => sortRequirements(filtered, sortKey, sortDir),
    [filtered, sortKey, sortDir]
  );

  const activeRows = useMemo(
    () => sorted.filter((req) => req.status !== "completed"),
    [sorted]
  );
  const completedRows = useMemo(
    () => sorted.filter((req) => req.status === "completed"),
    [sorted]
  );

  const tableColSpan = isProjectManager ? 8 : 7;

  function handleSort(key: SortKey, dir: SortDir) {
    if (sortKey === key && sortDir === dir) {
      setSortKey(null);
      setSortDir("asc");
      return;
    }
    setSortKey(key);
    setSortDir(dir);
  }

  async function handleFieldChange(
    id: string,
    field:
      | "priority"
      | "status"
      | "target_delivery_month"
      | "schedule_type"
      | "landing_version",
    value: PriorityLevel | RequirementStatus | ScheduleType | string | null
  ) {
    setSavingCell(`${id}:${field}`);
    const payload =
      field === "target_delivery_month" ||
      field === "landing_version" ||
      field === "schedule_type"
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

  function clearFilters() {
    setSearch("");
    setProductFilter("");
    setStatusCompareOp("");
    setStatusCompareValue("");
    setScheduleTypeFilter("");
    setProductFocus(false);
  }

  function toggleProductFocus(checked: boolean) {
    setProductFocus(checked);
    if (checked) {
      setStatusCompareOp("lt");
      setStatusCompareValue("scheduled");
      return;
    }
    if (statusCompareOp === "lt" && statusCompareValue === "scheduled") {
      setStatusCompareOp("");
      setStatusCompareValue("");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1a2332]">需求池</h1>
          <p className="text-sm text-[#7a96ae] mt-0.5">
            共 {sorted.length} 条需求
            {hasActiveFilters && items.length !== sorted.length
              ? `（筛选自 ${items.length} 条）`
              : ""}
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
        className="bg-white rounded-2xl p-4 space-y-3 overflow-visible"
        style={{ boxShadow: "0 2px 12px 0 rgb(90 140 180 / 0.08), 0 1px 3px 0 rgb(90 140 180 / 0.05)" }}
      >
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0b4c4]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索需求描述、编号、落地版本..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[#dde6ef] bg-[#f8fbfd] text-[#1a2332] placeholder:text-[#a0b4c4] focus:border-[#5ba4d4] focus:outline-none focus:ring-3 focus:ring-[#5ba4d4]/12 transition-all"
          />
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div
            className={`grid flex-1 gap-3 ${
              isProjectManager ? "md:grid-cols-4" : "md:grid-cols-3"
            }`}
          >
            {isProjectManager && (
              <FilterSelect
                label="产品"
                value={productFilter}
                onChange={setProductFilter}
                options={[
                  { value: "", label: "全部产品" },
                  ...products.map((p) => ({ value: p.id, label: p.name })),
                ]}
              />
            )}
            <div className="min-w-0 space-y-1.5">
              <span className="block text-sm font-medium text-[#1a2332]">进展</span>
              <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-2">
                <FilterSelect
                  value={statusCompareOp}
                  onChange={(value) => {
                    const op = value as StatusCompareOp;
                    setStatusCompareOp(op);
                    if (!op) setStatusCompareValue("");
                    if (op !== "lt" || statusCompareValue !== "scheduled") {
                      setProductFocus(false);
                    }
                  }}
                  options={[
                    { value: "", label: "不限" },
                    { value: "gt", label: ">" },
                    { value: "lt", label: "<" },
                  ]}
                />
                <FilterSelect
                  value={statusCompareValue}
                  onChange={(value) => {
                    setStatusCompareValue(value);
                    if (statusCompareOp !== "lt" || value !== "scheduled") {
                      setProductFocus(false);
                    }
                  }}
                  disabled={!statusCompareOp}
                  options={[
                    { value: "", label: "选择进展" },
                    ...STATUS_ORDER.map((status) => ({
                      value: status,
                      label: REQUIREMENT_STATUS_LABELS[status],
                    })),
                  ]}
                />
              </div>
            </div>
            <FilterSelect
              label="预期落地"
              value={scheduleTypeFilter}
              onChange={setScheduleTypeFilter}
              options={[
                { value: "", label: "全部类型" },
                { value: UNSET_FILTER, label: "未设定" },
                ...Object.entries(SCHEDULE_TYPE_LABELS).map(([v, l]) => ({
                  value: v,
                  label: l,
                })),
              ]}
            />
          </div>

          <label
            className={`inline-flex shrink-0 cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all ${
              productFocus
                ? "border-[#5ba4d4] bg-[#e8f3fb] text-[#5ba4d4] shadow-[0_1px_3px_0_rgb(90_140_180/0.06)]"
                : "border-[#dde6ef] bg-white text-[#1a2332] hover:border-[#5ba4d4]/40 hover:bg-[#f8fbfd]"
            }`}
          >
            <input
              type="checkbox"
              checked={productFocus}
              onChange={(e) => toggleProductFocus(e.target.checked)}
              className="h-4 w-4 rounded border-[#dde6ef] text-[#5ba4d4] accent-[#5ba4d4] cursor-pointer"
            />
            产品关注
          </label>
        </div>

        {hasActiveFilters && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-medium text-[#7a96ae] hover:text-[#5ba4d4] transition-colors"
            >
              清除筛选
            </button>
          </div>
        )}
      </div>

      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 2px 12px 0 rgb(90 140 180 / 0.08), 0 1px 3px 0 rgb(90 140 180 / 0.05)" }}
      >
        {sorted.length === 0 ? (
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
                  <th className="px-5 py-3.5 font-medium text-[#7a96ae] text-left">
                    需求描述
                  </th>
                  {isProjectManager && (
                    <SortableHeader
                      label="产品"
                      sortKey="product"
                      activeKey={sortKey}
                      direction={sortDir}
                      onSort={handleSort}
                    />
                  )}
                  <SortableHeader
                    label="优先级"
                    sortKey="priority"
                    activeKey={sortKey}
                    direction={sortDir}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="进展"
                    sortKey="status"
                    activeKey={sortKey}
                    direction={sortDir}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="预期落地"
                    sortKey="schedule_type"
                    activeKey={sortKey}
                    direction={sortDir}
                    onSort={handleSort}
                    className="min-w-[100px]"
                  />
                  <SortableHeader
                    label="目标交付月"
                    sortKey="target_delivery_month"
                    activeKey={sortKey}
                    direction={sortDir}
                    onSort={handleSort}
                    className="min-w-[88px]"
                  />
                  <SortableHeader
                    label="落地版本"
                    sortKey="landing_version"
                    activeKey={sortKey}
                    direction={sortDir}
                    onSort={handleSort}
                    className="min-w-[120px]"
                  />
                  <th className="px-5 py-3.5 font-medium text-[#7a96ae] text-right">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f4f8]">
                {activeRows.map((req) => (
                  <RequirementTableRow
                    key={req.id}
                    req={req}
                    isProjectManager={isProjectManager}
                    isSaving={isSaving}
                    onFieldChange={handleFieldChange}
                  />
                ))}
                {completedRows.length > 0 && (
                  <>
                    <tr className="bg-[#f8fbfd]">
                      <td colSpan={tableColSpan} className="px-5 py-2.5">
                        <button
                          type="button"
                          onClick={() => setCompletedExpanded((open) => !open)}
                          className="inline-flex items-center gap-2 text-sm font-medium text-[#7a96ae] hover:text-[#5ba4d4] transition-colors"
                        >
                          {completedExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                          已完成
                          <span className="inline-flex items-center rounded-full bg-[#e8f8f2] px-2 py-0.5 text-xs font-semibold text-[#4db896]">
                            {completedRows.length}
                          </span>
                        </button>
                      </td>
                    </tr>
                    {completedExpanded &&
                      completedRows.map((req) => (
                        <RequirementTableRow
                          key={req.id}
                          req={req}
                          isProjectManager={isProjectManager}
                          isSaving={isSaving}
                          onFieldChange={handleFieldChange}
                          muted
                        />
                      ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function RequirementTableRow({
  req,
  isProjectManager,
  isSaving,
  onFieldChange,
  muted = false,
}: {
  req: Requirement & { products: Product | null };
  isProjectManager: boolean;
  isSaving: (id: string, field: string) => boolean;
  onFieldChange: (
    id: string,
    field:
      | "priority"
      | "status"
      | "target_delivery_month"
      | "schedule_type"
      | "landing_version",
    value: PriorityLevel | RequirementStatus | ScheduleType | string | null
  ) => void;
  muted?: boolean;
}) {
  return (
    <tr
      className={`transition-colors group ${
        muted
          ? "bg-[#fafcfb] hover:bg-[#f3f9f6]"
          : "hover:bg-[#f8fbfd]"
      }`}
    >
      <td className="px-5 py-3.5">
        <Link
          href={`/requirements/detail?id=${req.id}`}
          className={`font-medium hover:text-[#5ba4d4] transition-colors ${
            muted ? "text-[#5a6f80]" : "text-[#1a2332]"
          }`}
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
          onChange={(priority) => onFieldChange(req.id, "priority", priority)}
        />
      </td>
      <td className="px-5 py-3.5">
        <BadgeSelect
          value={req.status}
          disabled={isSaving(req.id, "status")}
          variant={requirementStatusVariant(req.status)}
          options={Object.entries(REQUIREMENT_STATUS_LABELS).map(([v, l]) => ({
            value: v as RequirementStatus,
            label: l,
          }))}
          onChange={(status) => onFieldChange(req.id, "status", status)}
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
            onFieldChange(req.id, "schedule_type", scheduleType || null)
          }
        />
      </td>
      <td className="px-5 py-3.5">
        <BadgeSelect
          value={req.target_delivery_month || ""}
          disabled={isSaving(req.id, "target_delivery_month")}
          variant="gray"
          options={[
            { value: "", label: "未设定" },
            ...DELIVERY_MONTHS.map((m) => ({ value: m, label: m })),
          ]}
          onChange={(month) =>
            onFieldChange(req.id, "target_delivery_month", month || null)
          }
        />
      </td>
      <td className="px-5 py-3.5">
        <LandingVersionCell
          value={req.landing_version || ""}
          disabled={isSaving(req.id, "landing_version")}
          onSave={(value) => onFieldChange(req.id, "landing_version", value)}
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
  );
}

function SortableHeader({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
  className = "",
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey | null;
  direction: SortDir;
  onSort: (key: SortKey, dir: SortDir) => void;
  className?: string;
}) {
  const isActive = activeKey === sortKey;

  return (
    <th
      className={`px-5 py-3.5 font-medium text-[#7a96ae] text-left ${className}`}
    >
      <div className="inline-flex items-center gap-1.5">
        <span>{label}</span>
        <span className="inline-flex flex-col">
          <button
            type="button"
            onClick={() => onSort(sortKey, "asc")}
            className="p-0 leading-none text-[#c5d5e0] hover:text-[#5ba4d4] transition-colors"
            aria-label={`${label}升序`}
          >
            <ChevronUp
              className={`w-3.5 h-3.5 ${
                isActive && direction === "asc" ? "text-[#5ba4d4]" : ""
              }`}
            />
          </button>
          <button
            type="button"
            onClick={() => onSort(sortKey, "desc")}
            className="p-0 leading-none text-[#c5d5e0] hover:text-[#5ba4d4] transition-colors -mt-1"
            aria-label={`${label}降序`}
          >
            <ChevronDown
              className={`w-3.5 h-3.5 ${
                isActive && direction === "desc" ? "text-[#5ba4d4]" : ""
              }`}
            />
          </button>
        </span>
      </div>
    </th>
  );
}

function LandingVersionCell({
  value,
  disabled,
  onSave,
}: {
  value: string;
  disabled?: boolean;
  onSave: (value: string | null) => void;
}) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  function commit() {
    const trimmed = draft.trim();
    if (trimmed === (value || "")) return;
    onSave(trimmed || null);
  }

  return (
    <input
      type="text"
      value={draft}
      disabled={disabled}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur();
        }
      }}
      placeholder="未设定"
      className="w-full min-w-[100px] max-w-[160px] rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm text-[#1a2332] placeholder:text-[#a0b4c4] hover:border-[#dde6ef] hover:bg-[#f8fbfd] focus:border-[#5ba4d4] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5ba4d4]/12 transition-all disabled:opacity-50"
    />
  );
}
