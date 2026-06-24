"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus, ChevronRight } from "lucide-react";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Badge,
  priorityVariant,
  ratStatusVariant,
  requirementStatusVariant,
} from "@/components/ui/badge";
import type { Product, Requirement } from "@/types/database";
import {
  RAT_STATUS_LABELS,
  REQUIREMENT_STATUS_LABELS,
  PRIORITY_LABELS,
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
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [ratFilter, setRatFilter] = useState("");

  const filtered = requirements.filter((req) => {
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
    const matchRat = !ratFilter || req.rat_status === ratFilter;
    return matchSearch && matchProduct && matchStatus && matchPriority && matchRat;
  });

  return (
    <div className="space-y-4">
      {/* 页面标题 + 操作 */}
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

      {/* 搜索 + 筛选卡片 */}
      <div
        className="bg-white rounded-2xl p-4 space-y-3"
        style={{ boxShadow: "0 2px 12px 0 rgb(90 140 180 / 0.08), 0 1px 3px 0 rgb(90 140 180 / 0.05)" }}
      >
        {/* 搜索框 */}
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

        {/* 筛选器 */}
        <div
          className={`grid gap-3 ${
            isProjectManager
              ? "grid-cols-2 sm:grid-cols-4"
              : "grid-cols-2 sm:grid-cols-3"
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
          <Select
            value={ratFilter}
            onChange={(e) => setRatFilter(e.target.value)}
            options={[
              { value: "", label: "RAT 状态" },
              ...Object.entries(RAT_STATUS_LABELS).map(([v, l]) => ({
                value: v,
                label: l,
              })),
            ]}
          />
        </div>
      </div>

      {/* 需求列表卡片 */}
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
                  <th className="px-5 py-3.5 font-medium text-[#7a96ae] text-left">RAT</th>
                  <th className="px-5 py-3.5 font-medium text-[#7a96ae] text-left">目标交付</th>
                  <th className="px-5 py-3.5 font-medium text-[#7a96ae] text-left">数分</th>
                  <th className="px-2 py-3.5 w-8" />
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
                      <Badge variant={priorityVariant(req.priority)}>
                        {req.priority}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={requirementStatusVariant(req.status)}>
                        {REQUIREMENT_STATUS_LABELS[req.status]}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={ratStatusVariant(req.rat_status)}>
                        {RAT_STATUS_LABELS[req.rat_status]}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-[#7a96ae] text-sm">
                      {req.target_delivery_month || (
                        <span className="text-[#c0cdd8]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {req.needs_data_analysis ? (
                        <span className="text-[#4db896] text-xs font-medium">是</span>
                      ) : (
                        <span className="text-[#c0cdd8] text-xs">否</span>
                      )}
                    </td>
                    <td className="px-2 py-3.5">
                      <ChevronRight className="w-4 h-4 text-[#c0cdd8] group-hover:text-[#5ba4d4] transition-colors" />
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
