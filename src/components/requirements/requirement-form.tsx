"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createRequirement } from "@/lib/requirements-api";
import { PRODUCT_OPTIONS } from "@/lib/products";
import { createClient } from "@/lib/supabase/client";
import type { Product, PriorityLevel } from "@/types/database";
import { PRIORITY_LABELS, SCHEDULE_TYPE_LABELS } from "@/types/database";

const MONTHS = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

interface RequirementFormProps {
  products: Product[];
  defaultProductId?: string;
  isProjectManager?: boolean;
  lockedProductName?: string;
}

export function RequirementForm({
  products: initialProducts,
  defaultProductId,
  isProjectManager = false,
  lockedProductName,
}: RequirementFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [productId, setProductId] = useState(defaultProductId || "");
  const [priority, setPriority] = useState<PriorityLevel>("P0");
  const [targetMonth, setTargetMonth] = useState("");
  const [supplementaryNotes, setSupplementaryNotes] = useState("");
  const [needsDataAnalysis, setNeedsDataAnalysis] = useState(true);
  const [srNumber, setSrNumber] = useState("");
  const [expectedDelivery, setExpectedDelivery] = useState<"" | "tos" | "agile">("");

  useEffect(() => {
    if (initialProducts.length > 0) {
      setProducts(initialProducts);
      return;
    }

    async function loadProducts() {
      const supabase = createClient();
      const { data } = await supabase.from("products").select("*").order("name");
      if (data && data.length > 0) {
        setProducts(data);
        return;
      }

      const { data: byCode } = await supabase
        .from("products")
        .select("*")
        .in(
          "code",
          PRODUCT_OPTIONS.map((p) => p.code)
        );
      if (byCode) setProducts(byCode);
    }

    loadProducts();
  }, [initialProducts]);

  useEffect(() => {
    if (defaultProductId) setProductId(defaultProductId);
  }, [defaultProductId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!productId) {
      setError("请选择所属产品");
      return;
    }

    setLoading(true);

    const notes = [
      supplementaryNotes,
      expectedDelivery
        ? `预期落地：${SCHEDULE_TYPE_LABELS[expectedDelivery]}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    const result = await createRequirement({
      title,
      description,
      product_id: productId,
      priority,
      target_delivery_month: targetMonth,
      supplementary_notes: notes,
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

  const productOptions =
    products.length > 0
      ? products.map((p) => ({ value: p.id, label: p.name }))
      : PRODUCT_OPTIONS.map((p) => ({ value: p.code, label: p.name }));

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

      {/* 产品 + 优先级 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isProjectManager ? (
          <Select
            label="所属产品"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            required
            options={[
              { value: "", label: "请选择产品" },
              ...productOptions,
            ]}
          />
        ) : (
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#1a2332]">
              所属产品
            </label>
            <div className="w-full rounded-xl border border-[#dde6ef] bg-[#f8fbfd] px-3.5 py-2.5 text-sm text-[#1a2332]">
              {lockedProductName || products.find((p) => p.id === productId)?.name || "—"}
            </div>
          </div>
        )}
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

      {/* 目标交付月 + 预期落地 */}
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
        <Select
          label="预期落地"
          value={expectedDelivery}
          onChange={(e) =>
            setExpectedDelivery(e.target.value as "" | "tos" | "agile")
          }
          options={[
            { value: "", label: "未设定" },
            ...Object.entries(SCHEDULE_TYPE_LABELS).map(([v, l]) => ({
              value: v,
              label: l,
            })),
          ]}
        />
      </div>

      <Input
        label="需求编号（选填）"
        value={srNumber}
        onChange={(e) => setSrNumber(e.target.value)}
        placeholder="SR-202603-003697"
      />
      <Textarea
        label="补充说明"
        value={supplementaryNotes}
        onChange={(e) => setSupplementaryNotes(e.target.value)}
        placeholder="已过RAT、相关背景等"
      />

      {/* 数分 checkbox */}
      <label className="flex items-center gap-2.5 cursor-pointer group">
        <div className="relative">
          <input
            type="checkbox"
            checked={needsDataAnalysis}
            onChange={(e) => setNeedsDataAnalysis(e.target.checked)}
            className="w-4 h-4 rounded border-[#dde6ef] text-[#5ba4d4] accent-[#5ba4d4] cursor-pointer"
          />
        </div>
        <span className="text-sm text-[#1a2332] group-hover:text-[#5ba4d4] transition-colors">
          需要进行数分
        </span>
      </label>

      {error && (
        <div className="flex items-start gap-2 text-sm text-[#e06060] bg-[#fdeaea] rounded-xl px-3.5 py-2.5">
          <span className="mt-0.5 shrink-0">⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-3 pt-1">
        <Button type="submit" disabled={loading || !productId}>
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
