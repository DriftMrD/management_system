"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createRequirement } from "./actions";
import type { Product, PriorityLevel } from "@/types/database";
import { PRIORITY_LABELS } from "@/types/database";

const MONTHS = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

interface RequirementFormProps {
  products: Product[];
  defaultProductId?: string;
}

export function RequirementForm({ products, defaultProductId }: RequirementFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [productId, setProductId] = useState(defaultProductId || "");
  const [priority, setPriority] = useState<PriorityLevel>("P0");
  const [targetMonth, setTargetMonth] = useState("");
  const [supplementaryNotes, setSupplementaryNotes] = useState("");
  const [needsDataAnalysis, setNeedsDataAnalysis] = useState(true);
  const [srNumber, setSrNumber] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await createRequirement({
      title,
      description,
      product_id: productId,
      priority,
      target_delivery_month: targetMonth,
      supplementary_notes: supplementaryNotes,
      needs_data_analysis: needsDataAnalysis,
      sr_number: srNumber,
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/requirements");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="需求描述"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="例如：日历反馈入口服务端需求"
        required
      />
      <Textarea
        label="详细说明"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="需求的详细背景和目标..."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="所属产品"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          required
          options={[
            { value: "", label: "请选择产品" },
            ...products.map((p) => ({ value: p.id, label: p.name })),
          ]}
        />
        <Select
          label="优先级"
          value={priority}
          onChange={(e) => setPriority(e.target.value as PriorityLevel)}
          options={Object.entries(PRIORITY_LABELS).map(([v, l]) => ({
            value: v,
            label: l,
          }))}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="目标交付月"
          value={targetMonth}
          onChange={(e) => setTargetMonth(e.target.value)}
          options={[
            { value: "", label: "未设定" },
            ...MONTHS.map((m) => ({ value: m, label: m })),
          ]}
        />
        <Input
          label="需求编号（选填）"
          value={srNumber}
          onChange={(e) => setSrNumber(e.target.value)}
          placeholder="SR-202603-003697"
        />
      </div>
      <Textarea
        label="补充说明"
        value={supplementaryNotes}
        onChange={(e) => setSupplementaryNotes(e.target.value)}
        placeholder="已过RAT、相关背景等"
      />
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={needsDataAnalysis}
          onChange={(e) => setNeedsDataAnalysis(e.target.checked)}
          className="rounded border-border"
        />
        需要进行数分
      </label>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? "提交中..." : "提交需求"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          取消
        </Button>
      </div>
    </form>
  );
}
