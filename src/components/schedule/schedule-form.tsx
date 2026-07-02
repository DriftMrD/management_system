"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveScheduleTasks } from "@/lib/schedule-api";
import {
  SCHEDULE_PHASE_LABELS,
  type SchedulePhase,
  type ScheduleType,
} from "@/types/database";

const PHASES = Object.keys(SCHEDULE_PHASE_LABELS) as SchedulePhase[];

interface TaskRow {
  phase: SchedulePhase;
  start_date: string;
  end_date: string;
  milestone_notes: string;
}

interface ScheduleFormProps {
  requirementId: string;
  scheduleType: ScheduleType;
  initialTasks: TaskRow[];
  onSaved?: () => void;
  returnTo?: string;
}

function buildRows(
  initialTasks: { phase: SchedulePhase; start_date: string | null; end_date: string | null; milestone_notes: string }[]
): TaskRow[] {
  const byPhase = new Map(initialTasks.map((t) => [t.phase, t]));
  return PHASES.map((phase) => {
    const existing = byPhase.get(phase);
    return {
      phase,
      start_date: existing?.start_date || "",
      end_date: existing?.end_date || "",
      milestone_notes: existing?.milestone_notes || "",
    };
  });
}

export function ScheduleForm({
  requirementId,
  scheduleType,
  initialTasks,
  onSaved,
  returnTo,
}: ScheduleFormProps) {
  const router = useRouter();
  const [rows, setRows] = useState<TaskRow[]>(() => buildRows(initialTasks));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateRow(phase: SchedulePhase, field: keyof Omit<TaskRow, "phase">, value: string) {
    setRows((prev) =>
      prev.map((row) => (row.phase === phase ? { ...row, [field]: value } : row))
    );
  }

  async function handleSave() {
    setLoading(true);
    setError("");

    const result = await saveScheduleTasks(requirementId, scheduleType, rows);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.refresh();
    onSaved?.();
    if (returnTo) {
      router.push(returnTo);
      return;
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#f8fbfd] border-b border-[#edf3f8]">
              <th className="px-3 py-3 text-left font-medium text-[#7a96ae] w-28">阶段</th>
              <th className="px-3 py-3 text-left font-medium text-[#7a96ae] w-36">开始</th>
              <th className="px-3 py-3 text-left font-medium text-[#7a96ae] w-36">结束</th>
              <th className="px-3 py-3 text-left font-medium text-[#7a96ae]">备注</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f4f8]">
            {rows.map((row) => (
              <tr key={row.phase}>
                <td className="px-3 py-3 font-medium text-[#1a2332] align-top">
                  {SCHEDULE_PHASE_LABELS[row.phase]}
                </td>
                <td className="px-3 py-2 align-top">
                  <Input
                    type="date"
                    value={row.start_date}
                    onChange={(e) => updateRow(row.phase, "start_date", e.target.value)}
                    className="py-2"
                  />
                </td>
                <td className="px-3 py-2 align-top">
                  <Input
                    type="date"
                    value={row.end_date}
                    onChange={(e) => updateRow(row.phase, "end_date", e.target.value)}
                    className="py-2"
                  />
                </td>
                <td className="px-3 py-2 align-top">
                  <Input
                    value={row.milestone_notes}
                    onChange={(e) => updateRow(row.phase, "milestone_notes", e.target.value)}
                    placeholder="里程碑说明"
                    className="py-2"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-sm text-[#e06060] bg-[#fdeaea] rounded-xl px-3.5 py-2.5">
          <span className="mt-0.5 shrink-0">⚠</span>
          <span>{error}</span>
        </div>
      )}

      <Button onClick={handleSave} disabled={loading}>
        {loading ? "保存中..." : "保存排期"}
      </Button>
    </div>
  );
}
