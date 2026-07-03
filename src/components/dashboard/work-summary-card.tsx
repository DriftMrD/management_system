"use client";

import { useState } from "react";
import { Copy, Check, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateWorkSummary } from "@/lib/work-summary-api";

export function WorkSummaryCard() {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setError("");
    setCopied(false);

    const result = await generateWorkSummary();
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSummary(result.summary ?? "");
  }

  async function handleCopy() {
    if (!summary) return;
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="bg-white rounded-2xl p-6 space-y-4"
      style={{
        boxShadow:
          "0 2px 12px 0 rgb(90 140 180 / 0.10), 0 1px 3px 0 rgb(90 140 180 / 0.06)",
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="font-semibold text-[#1a2332] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#5ba4d4]" />
            近期重点工作总结
          </h2>
          <p className="text-sm text-[#7a96ae] mt-1">
            P0/P1 自动归类：敏捷交付月 -1 为开发月；待排期归入「其他」
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleGenerate}
          disabled={loading}
          className="shrink-0"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {loading ? "生成中…" : "AI 一键生成"}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-[#e06060] bg-[#fdeaea] rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {summary ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-[#dde6ef] bg-[#f8fbfd] px-4 py-4">
            <pre className="text-sm text-[#1a2332] whitespace-pre-wrap font-sans leading-relaxed">
              {summary}
            </pre>
          </div>
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              {copied ? (
                <Check className="w-4 h-4 text-[#4db896]" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "已复制" : "复制全文"}
            </Button>
          </div>
        </div>
      ) : (
        !loading &&
        !error && (
          <p className="text-sm text-[#a0b4c4] text-center py-8">
            点击「AI 一键生成」，自动总结本月与下月重点工作
          </p>
        )
      )}
    </div>
  );
}
