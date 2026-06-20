"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus } from "lucide-react";
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">需求池</h1>
          <p className="text-sm text-muted mt-0.5">
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

      <div className="bg-white rounded-xl border border-border p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索需求描述、编号、补充说明..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted">
            <p>暂无需求</p>
            <Link href="/requirements/new" className="text-primary text-sm hover:underline mt-2 inline-block">
              创建第一条需求
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50 text-left">
                  <th className="px-4 py-3 font-medium text-muted">需求描述</th>
                  {isProjectManager && (
                    <th className="px-4 py-3 font-medium text-muted">产品</th>
                  )}
                  <th className="px-4 py-3 font-medium text-muted">优先级</th>
                  <th className="px-4 py-3 font-medium text-muted">进展</th>
                  <th className="px-4 py-3 font-medium text-muted">RAT</th>
                  <th className="px-4 py-3 font-medium text-muted">目标交付</th>
                  <th className="px-4 py-3 font-medium text-muted">数分</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/requirements/${req.id}`}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {req.title}
                      </Link>
                      {req.sr_number && (
                        <p className="text-xs text-muted mt-0.5">{req.sr_number}</p>
                      )}
                    </td>
                    {isProjectManager && (
                      <td className="px-4 py-3">
                        <Badge variant="success">{req.products?.name}</Badge>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <Badge variant={priorityVariant(req.priority)}>
                        {req.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={requirementStatusVariant(req.status)}>
                        {REQUIREMENT_STATUS_LABELS[req.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={ratStatusVariant(req.rat_status)}>
                        {RAT_STATUS_LABELS[req.rat_status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {req.target_delivery_month || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {req.needs_data_analysis ? "是" : "否"}
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
