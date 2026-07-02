"use client";

import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  addDays,
  differenceInCalendarDays,
  format,
  parseISO,
  isValid,
  endOfWeek,
  startOfWeek,
  eachMonthOfInterval,
  endOfMonth,
  isWithinInterval,
  isSameDay,
  isWeekend,
} from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  SCHEDULE_PHASE_LABELS,
  type SchedulePhase,
} from "@/types/database";

export const PHASE_COLORS: Record<SchedulePhase, string> = {
  prd: "#5ba4d4",
  interaction: "#7b8fd4",
  visual: "#a07bd4",
  development: "#4db896",
  testing: "#e8a43c",
  acceptance: "#e06060",
};

export interface GanttBar {
  id: string;
  phase: SchedulePhase;
  start: string;
  end: string;
  tooltip?: string;
}

export interface GanttRow {
  id: string;
  label: string;
  sublabel?: string;
  bars: GanttBar[];
}

interface GanttChartProps {
  rows: GanttRow[];
  emptyMessage?: string;
  expandPhases?: boolean;
}

const LABEL_WIDTH = 220;
const ROW_HEIGHT = 48;
const BAR_HEIGHT = 28;
const MIN_PX_PER_DAY = 22;
const MAX_PX_PER_DAY = 44;

interface DayColumn {
  date: Date;
  left: number;
  width: number;
  dayLabel: string;
  weekdayLabel: string;
  isWeekend: boolean;
  isToday: boolean;
  showMonthLabel: boolean;
}

interface WeekGroup {
  left: number;
  width: number;
  label: string;
}

interface MonthGroup {
  left: number;
  width: number;
  label: string;
}

function parseDate(value: string): Date | null {
  const d = parseISO(value);
  return isValid(d) ? d : null;
}

function getDateRange(rows: GanttRow[]): { start: Date; end: Date } | null {
  const dates: Date[] = [];
  for (const row of rows) {
    for (const bar of row.bars) {
      const start = parseDate(bar.start);
      const end = parseDate(bar.end);
      if (start) dates.push(start);
      if (end) dates.push(end);
    }
  }
  if (dates.length === 0) return null;

  const min = new Date(Math.min(...dates.map((d) => d.getTime())));
  const max = new Date(Math.max(...dates.map((d) => d.getTime())));
  return { start: addDays(min, -1), end: addDays(max, 1) };
}

function buildDayColumns(
  range: { start: Date; end: Date },
  pxPerDay: number,
  today: Date
): DayColumn[] {
  const cols: DayColumn[] = [];
  let prevMonth = -1;
  let d = range.start;

  while (d <= range.end) {
    const month = d.getMonth();
    const showMonthLabel = month !== prevMonth;
    prevMonth = month;

    cols.push({
      date: d,
      left: differenceInCalendarDays(d, range.start) * pxPerDay,
      width: pxPerDay,
      dayLabel: format(d, "d"),
      weekdayLabel: format(d, "EEE", { locale: zhCN }),
      isWeekend: isWeekend(d),
      isToday: isSameDay(d, today),
      showMonthLabel,
    });
    d = addDays(d, 1);
  }
  return cols;
}

function buildWeekGroups(
  range: { start: Date; end: Date },
  pxPerDay: number
): WeekGroup[] {
  const groups: WeekGroup[] = [];
  let cursor = startOfWeek(range.start, { weekStartsOn: 1 });

  while (cursor <= range.end) {
    const weekEnd = endOfWeek(cursor, { weekStartsOn: 1 });
    const tickStart = cursor < range.start ? range.start : cursor;
    const tickEnd = weekEnd > range.end ? range.end : weekEnd;
    const left = differenceInCalendarDays(tickStart, range.start) * pxPerDay;
    const width =
      (differenceInCalendarDays(tickEnd, tickStart) + 1) * pxPerDay;

    groups.push({
      left,
      width,
      label: `${format(tickStart, "M/d", { locale: zhCN })} – ${format(tickEnd, "M/d", { locale: zhCN })}`,
    });

    cursor = addDays(weekEnd, 1);
  }
  return groups;
}

function buildMonthGroups(
  range: { start: Date; end: Date },
  pxPerDay: number
): MonthGroup[] {
  return eachMonthOfInterval({ start: range.start, end: range.end }).map(
    (month) => {
      const monthStart = month < range.start ? range.start : month;
      const monthEnd = endOfMonth(month) > range.end ? range.end : endOfMonth(month);
      const left = differenceInCalendarDays(monthStart, range.start) * pxPerDay;
      const width =
        (differenceInCalendarDays(monthEnd, monthStart) + 1) * pxPerDay;
      return {
        left,
        width,
        label: format(month, "yyyy年M月", { locale: zhCN }),
      };
    }
  );
}

interface RenderRow {
  id: string;
  label: string;
  sublabel?: string;
  bars: GanttBar[];
  isPhaseRow?: boolean;
}

function buildRenderRows(rows: GanttRow[], expandPhases: boolean): RenderRow[] {
  if (!expandPhases) return rows;

  const result: RenderRow[] = [];
  for (const row of rows) {
    if (row.bars.length <= 1) {
      result.push(row);
      continue;
    }
    for (const bar of row.bars) {
      result.push({
        id: bar.id,
        label: SCHEDULE_PHASE_LABELS[bar.phase],
        sublabel: row.label,
        bars: [bar],
        isPhaseRow: true,
      });
    }
  }
  return result;
}

function computePxPerDay(totalDays: number, containerWidth: number): number {
  if (containerWidth > 0) {
    const available = containerWidth - LABEL_WIDTH;
    const fit = available / totalDays;
    return Math.min(MAX_PX_PER_DAY, Math.max(MIN_PX_PER_DAY, fit));
  }
  return MIN_PX_PER_DAY;
}

interface HoveredBar {
  phaseLabel: string;
  start: string;
  end: string;
  note?: string;
  rect: DOMRect;
}

function GanttBarTooltip({ hovered }: { hovered: HoveredBar | null }) {
  if (!hovered || typeof document === "undefined") return null;

  const { rect, phaseLabel, start, end, note } = hovered;
  const centerX = rect.left + rect.width / 2;
  const tooltipTop = rect.top - 8;

  return createPortal(
    <div
      className="fixed z-[200] pointer-events-none"
      style={{
        left: centerX,
        top: tooltipTop,
        transform: "translate(-50%, -100%)",
      }}
    >
      <div className="bg-[#1a2332] text-white text-[11px] rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg">
        <p className="font-medium">{phaseLabel}</p>
        <p className="text-white/70 mt-0.5">
          {start} → {end}
        </p>
        {note && <p className="text-white/60 mt-1">{note}</p>}
      </div>
    </div>,
    document.body
  );
}

export function GanttChart({
  rows,
  emptyMessage = "暂无排期数据，请先在需求详情中录入各阶段日期",
  expandPhases = false,
}: GanttChartProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [hoveredBar, setHoveredBar] = useState<HoveredBar | null>(null);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => setContainerWidth(el.clientWidth);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setHoveredBar(null);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const rowsWithBars = useMemo(
    () => rows.filter((r) => r.bars.length > 0),
    [rows]
  );

  const renderRows = useMemo(
    () => buildRenderRows(rowsWithBars, expandPhases),
    [rowsWithBars, expandPhases]
  );

  const range = useMemo(() => getDateRange(rowsWithBars), [rowsWithBars]);

  const today = new Date();
  const totalDays = range
    ? differenceInCalendarDays(range.end, range.start) + 1
    : 0;
  const pxPerDay = computePxPerDay(totalDays || 1, containerWidth);
  const timelineWidth = totalDays * pxPerDay;
  const chartWidth = LABEL_WIDTH + timelineWidth;
  const dayGranularity = totalDays <= 90;

  const dayColumns = useMemo(
    () =>
      range && dayGranularity
        ? buildDayColumns(range, pxPerDay, today)
        : [],
    [range, pxPerDay, today, dayGranularity]
  );
  const weekGroups = useMemo(
    () => (range && dayGranularity ? buildWeekGroups(range, pxPerDay) : []),
    [range, pxPerDay, dayGranularity]
  );
  const monthGroups = useMemo(
    () => (!range || dayGranularity ? [] : buildMonthGroups(range, pxPerDay)),
    [range, pxPerDay, dayGranularity]
  );

  const headerHeight = dayGranularity ? 58 : 40;

  if (rowsWithBars.length === 0 || !range) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-4xl mb-3">📊</div>
        <p className="text-[#7a96ae] font-medium text-sm">{emptyMessage}</p>
      </div>
    );
  }

  const dateRange = range;

  const todayLeft =
    isWithinInterval(today, { start: dateRange.start, end: dateRange.end })
      ? differenceInCalendarDays(today, dateRange.start) * pxPerDay + pxPerDay / 2
      : null;

  function barPos(startStr: string, endStr: string) {
    const start = parseDate(startStr);
    const end = parseDate(endStr);
    if (!start || !end) return null;
    const left = differenceInCalendarDays(start, dateRange.start) * pxPerDay;
    const width = (differenceInCalendarDays(end, start) + 1) * pxPerDay;
    return { left, width: Math.max(width, pxPerDay * 0.6) };
  }

  return (
    <div className="space-y-3">
      <GanttBarTooltip hovered={hoveredBar} />
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
        {(Object.keys(SCHEDULE_PHASE_LABELS) as SchedulePhase[]).map((phase) => (
          <span key={phase} className="inline-flex items-center gap-1.5 text-[#7a96ae]">
            <span
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ background: PHASE_COLORS[phase] }}
            />
            {SCHEDULE_PHASE_LABELS[phase]}
          </span>
        ))}
      </div>

      <div
        className="gantt-container bg-white rounded-2xl border border-[#edf3f8]"
        style={{
          boxShadow:
            "0 2px 12px 0 rgb(90 140 180 / 0.10), 0 1px 3px 0 rgb(90 140 180 / 0.06)",
        }}
      >
        <div
          ref={scrollRef}
          className="gantt-scroll max-h-[min(70vh,640px)] overflow-auto"
        >
          <div
            className="gantt-grid"
            style={{
              display: "grid",
              gridTemplateColumns: `${LABEL_WIDTH}px ${timelineWidth}px`,
              width: chartWidth,
            }}
          >
            <div
              className="gantt-sticky-corner sticky top-0 left-0 z-30 flex items-end px-4 pb-2 text-xs font-medium text-[#7a96ae] border-r border-b border-[#edf3f8] bg-[#f8fbfd]"
              style={{ height: headerHeight }}
            >
              需求 / 阶段
            </div>

            <div
              className="gantt-sticky-header sticky top-0 z-20 relative border-b border-[#edf3f8] bg-[#f8fbfd] overflow-hidden"
              style={{ height: headerHeight, width: timelineWidth }}
            >
              {dayGranularity ? (
                <>
                  <div className="absolute top-0 left-0 right-0 h-[22px] border-b border-[#edf3f8]/80">
                    {weekGroups.map((wg, i) => (
                      <div
                        key={i}
                        className="absolute top-0 h-full flex items-center px-1.5 text-[10px] font-medium text-[#7a96ae] border-r border-[#edf3f8]/80 truncate"
                        style={{ left: wg.left, width: wg.width }}
                      >
                        {wg.label}
                      </div>
                    ))}
                  </div>
                  <div className="absolute top-[22px] left-0 right-0 bottom-0">
                    {dayColumns.map((col) => (
                      <div
                        key={col.date.toISOString()}
                        className={`absolute top-0 bottom-0 flex flex-col items-center justify-center border-r text-center leading-none ${
                          col.isToday
                            ? "bg-[#fdeaea] border-[#f0c0c0]/60"
                            : col.isWeekend
                              ? "bg-[#f4f7fa] border-[#edf3f8]/80"
                              : "border-[#edf3f8]/80"
                        }`}
                        style={{ left: col.left, width: col.width }}
                      >
                        {col.showMonthLabel && pxPerDay >= 26 && (
                          <span className="text-[9px] text-[#a0b4c4] -mt-0.5">
                            {format(col.date, "M月")}
                          </span>
                        )}
                        <span
                          className={`text-[11px] font-semibold tabular-nums ${
                            col.isToday ? "text-[#e06060]" : "text-[#1a2332]"
                          }`}
                        >
                          {col.dayLabel}
                        </span>
                        {pxPerDay >= 20 && (
                          <span className="text-[9px] text-[#a0b4c4] mt-0.5">
                            {col.weekdayLabel}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                monthGroups.map((mg, i) => (
                  <div
                    key={i}
                    className="absolute top-0 h-full flex items-center px-2 text-xs font-medium text-[#7a96ae] border-r border-[#edf3f8]/80"
                    style={{ left: mg.left, width: mg.width }}
                  >
                    {mg.label}
                  </div>
                ))
              )}
            </div>

            {renderRows.map((row) => (
              <Fragment key={row.id}>
                <div
                  className="gantt-sticky-label sticky left-0 z-[15] flex flex-col justify-center px-4 border-r border-b border-[#f0f4f8] bg-white hover:bg-[#fafcfe] transition-colors"
                  style={{ height: ROW_HEIGHT }}
                >
                  <p
                    className={`truncate leading-tight ${
                      row.isPhaseRow
                        ? "text-xs font-medium text-[#5ba4d4] pl-2"
                        : "text-sm font-medium text-[#1a2332]"
                    }`}
                    title={row.label}
                  >
                    {row.label}
                  </p>
                  {row.sublabel && (
                    <p
                      className="text-[11px] text-[#a0b4c4] mt-0.5 truncate"
                      title={row.sublabel}
                    >
                      {row.sublabel}
                    </p>
                  )}
                </div>

                <div
                  className="relative border-b border-[#f0f4f8] z-0 overflow-hidden"
                  style={{ height: ROW_HEIGHT, width: timelineWidth }}
                >
                  {dayGranularity
                    ? dayColumns.map((col) => (
                        <div
                          key={col.date.toISOString()}
                          className={`absolute top-0 bottom-0 border-r pointer-events-none ${
                            col.isToday
                              ? "bg-[#fdeaea]/40 border-[#f0c0c0]/40"
                              : col.isWeekend
                                ? "bg-[#f4f7fa]/60 border-[#edf3f8]/90"
                                : "border-[#edf3f8]/90"
                          }`}
                          style={{ left: col.left, width: col.width }}
                        />
                      ))
                    : monthGroups.map((mg, i) => (
                        <div
                          key={i}
                          className="absolute top-0 bottom-0 border-r border-[#edf3f8]/90 pointer-events-none"
                          style={{ left: mg.left }}
                        />
                      ))}

                  {todayLeft !== null && (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-[#e06060] z-[3] pointer-events-none"
                      style={{ left: todayLeft }}
                    />
                  )}

                  {row.bars.map((bar) => {
                    const pos = barPos(bar.start, bar.end);
                    if (!pos) return null;
                    const color = PHASE_COLORS[bar.phase];
                    const phaseLabel = SCHEDULE_PHASE_LABELS[bar.phase];
                    const startLabel = format(parseISO(bar.start), "M/d");
                    const endLabel = format(parseISO(bar.end), "M/d");
                    const showLabel = pos.width >= 56;

                    return (
                      <div
                        key={bar.id}
                        className="gantt-bar absolute z-[4] hover:z-[10]"
                        style={{
                          left: pos.left,
                          width: pos.width,
                          top: (ROW_HEIGHT - BAR_HEIGHT) / 2,
                          height: BAR_HEIGHT,
                        }}
                        onMouseEnter={(e) =>
                          setHoveredBar({
                            phaseLabel,
                            start: bar.start,
                            end: bar.end,
                            note: bar.tooltip,
                            rect: e.currentTarget.getBoundingClientRect(),
                          })
                        }
                        onMouseLeave={() => setHoveredBar(null)}
                      >
                        <div
                          className="h-full rounded-md shadow-sm hover:shadow-md cursor-default flex items-center overflow-hidden"
                          style={{
                            background: `linear-gradient(180deg, ${color} 0%, ${color}dd 100%)`,
                            borderLeft: `3px solid ${color}`,
                          }}
                        >
                          {showLabel ? (
                            <span className="px-2 text-[11px] font-semibold text-white truncate leading-none">
                              {phaseLabel}
                              <span className="font-normal opacity-80 ml-1">
                                {startLabel}–{endLabel}
                              </span>
                            </span>
                          ) : (
                            <span className="px-1.5 text-[10px] font-semibold text-white truncate leading-none w-full text-center">
                              {startLabel}–{endLabel}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Fragment>
            ))}
          </div>
        </div>

        <div className="px-4 py-2 border-t border-[#f0f4f8] bg-[#f8fbfd] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#a0b4c4]">
          <span>
            {format(dateRange.start, "yyyy/M/d", { locale: zhCN })}
            {" — "}
            {format(dateRange.end, "yyyy/M/d", { locale: zhCN })}
            {" · "}
            {totalDays} 天
          </span>
          <span className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#e06060]" />
              今天
            </span>
            {chartWidth > containerWidth && containerWidth > 0 && (
              <span>左右滑动查看更多</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
