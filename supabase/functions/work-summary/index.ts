import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const CHINESE_MONTHS = [
  "一月",
  "二月",
  "三月",
  "四月",
  "五月",
  "六月",
  "七月",
  "八月",
  "九月",
  "十月",
  "十一月",
  "十二月",
];

const STATUS_LABELS: Record<string, string> = {
  not_started: "未启动",
  in_progress: "进行中",
  reviewed: "已评审",
  pending_schedule: "待排期",
  scheduled: "已排期",
  in_development: "开发中",
  testing: "测试中",
  completed: "已完成",
  cancelled: "已取消",
};

const SCHEDULE_LABELS: Record<string, string> = {
  tos: "TOS 版本",
  agile: "敏捷迭代",
};

const EXAMPLE_TEMPLATE = `一、六月开发工作
六月各项开发任务均已完成提测，目前处于bug修复阶段。
1. CAMSPEC-28255影像垃圾回收机制适配（原计划通过敏捷迭代推进，因17.0版本暂未发布，暂时无法上线）；
2. 新增垃圾清理入口；
3. PC 互联功能修改；
5. 文件管理修改录音名称后无法移动到 Vault（敏捷发布）。

二、七月需求推进工作
1. Ella知识库搭建迭代（需TEX AI部门开展排期变更，目前相关工作持续推进中）
2. AI 检索；
3. 三方应用打开功能优化（待评审；敏捷）；
4. 完成手机 DOCK 拓展坞排版问题适配优化。`;

const DEEPSEEK_MODEL = "deepseek-v4-pro";

type SectionKind = "development" | "advancement";

type SummarySection = {
  month: string;
  kind: SectionKind;
};

type SummaryPeriod = {
  mode: "prev_current" | "prev_current_next" | "current_next";
  sections: SummarySection[];
};

type RequirementRow = {
  title: string;
  sr_number: string | null;
  priority: string;
  status: string;
  schedule_type: string | null;
  target_delivery_month: string | null;
  landing_version: string | null;
  supplementary_notes: string | null;
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getMonthByOffset(now: Date, offset: number): string {
  const date = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  return CHINESE_MONTHS[date.getMonth()];
}

function parseDeliveryMonthIndex(target: string | null): number | null {
  if (!target) return null;
  const numeric = target.match(/^(\d{1,2})月$/);
  if (numeric) {
    const month = parseInt(numeric[1], 10);
    if (month >= 1 && month <= 12) return month - 1;
  }
  const idx = CHINESE_MONTHS.indexOf(target);
  return idx >= 0 ? idx : null;
}

function monthIndexToChinese(index: number): string {
  return CHINESE_MONTHS[((index % 12) + 12) % 12];
}

/** 交付月（目标交付月字段，TOS/敏捷均以此为准） */
function getDeliveryMonth(req: RequirementRow): string | null {
  const idx = parseDeliveryMonthIndex(req.target_delivery_month);
  return idx === null ? null : monthIndexToChinese(idx);
}

/**
 * 开发归属月：敏捷迭代交付月 -1（7 月交付 → 6 月开发）；TOS 与交付月相同
 */
function getWorkMonth(req: RequirementRow): string | null {
  const deliveryIdx = parseDeliveryMonthIndex(req.target_delivery_month);
  if (deliveryIdx === null) return null;
  if (req.schedule_type === "agile") {
    return monthIndexToChinese(deliveryIdx - 1);
  }
  return monthIndexToChinese(deliveryIdx);
}

function matchesMonth(month: string | null, sectionMonth: string): boolean {
  return month === sectionMonth;
}

/**
 * 每月 10 日前：上月 + 本月
 * 10–19 日：上月 + 本月 + 下月
 * 20 日及以后：本月 + 下月
 */
function getSummaryPeriod(now: Date): SummaryPeriod {
  const day = now.getDate();
  const current = CHINESE_MONTHS[now.getMonth()];
  const prev = getMonthByOffset(now, -1);
  const next = getMonthByOffset(now, 1);

  if (day < 10) {
    return {
      mode: "prev_current",
      sections: [
        { month: prev, kind: "development" },
        { month: current, kind: "advancement" },
      ],
    };
  }

  if (day < 20) {
    return {
      mode: "prev_current_next",
      sections: [
        { month: prev, kind: "development" },
        { month: current, kind: "advancement" },
        { month: next, kind: "advancement" },
      ],
    };
  }

  return {
    mode: "current_next",
    sections: [
      { month: current, kind: "development" },
      { month: next, kind: "advancement" },
    ],
  };
}

function sectionTitle(section: SummarySection): string {
  return section.kind === "development"
    ? `${section.month}开发工作`
    : `${section.month}需求推进工作`;
}

function formatRequirement(req: RequirementRow) {
  const deliveryMonth = getDeliveryMonth(req);
  const workMonth = getWorkMonth(req);
  return {
    title: req.title,
    sr_number: req.sr_number,
    priority: req.priority,
    status: req.status,
    status_label: STATUS_LABELS[req.status] ?? req.status,
    schedule_type: req.schedule_type,
    schedule_label: req.schedule_type
      ? (SCHEDULE_LABELS[req.schedule_type] ?? req.schedule_type)
      : null,
    target_delivery_month: req.target_delivery_month,
    delivery_month: deliveryMonth,
    work_month: workMonth,
    landing_version: req.landing_version,
    supplementary_notes: req.supplementary_notes || "",
  };
}

const DEV_STATUSES = new Set(["in_development", "testing"]);
const ADVANCEMENT_STATUSES = new Set([
  "not_started",
  "in_progress",
  "reviewed",
  "scheduled",
]);

function bucketRequirements(
  requirements: RequirementRow[],
  sections: SummarySection[]
) {
  const buckets: Record<string, ReturnType<typeof formatRequirement>[]> = {};
  for (const section of sections) {
    buckets[section.month] = [];
  }
  const otherKeyItems: ReturnType<typeof formatRequirement>[] = [];

  for (const req of requirements) {
    // 待排期统一归入「其他」，不进入各月需求推进
    if (req.status === "pending_schedule") {
      otherKeyItems.push(formatRequirement(req));
      continue;
    }

    const workMonth = getWorkMonth(req);
    const deliveryMonth = getDeliveryMonth(req);
    let placed = false;

    // 开发中/测试中：按开发归属月匹配（敏捷已 -1）
    if (DEV_STATUSES.has(req.status) && workMonth) {
      const devSection = sections.find(
        (s) => s.kind === "development" && matchesMonth(workMonth, s.month)
      );
      if (devSection) {
        buckets[devSection.month].push(formatRequirement(req));
        placed = true;
      } else {
        const advSection = sections.find(
          (s) => s.kind === "advancement" && matchesMonth(workMonth, s.month)
        );
        if (advSection) {
          buckets[advSection.month].push(formatRequirement(req));
          placed = true;
        }
      }
    }

    // 未启动/进行中/已评审/已排期：按交付月匹配需求推进段
    if (!placed && ADVANCEMENT_STATUSES.has(req.status) && deliveryMonth) {
      const advSection = sections.find(
        (s) => s.kind === "advancement" && matchesMonth(deliveryMonth, s.month)
      );
      if (advSection) {
        buckets[advSection.month].push(formatRequirement(req));
        placed = true;
      }
    }

    if (!placed) {
      otherKeyItems.push(formatRequirement(req));
    }
  }

  return { buckets, otherKeyItems };
}

function buildPrompt(
  productName: string,
  period: SummaryPeriod,
  buckets: ReturnType<typeof bucketRequirements>
) {
  const numerals = ["一", "二", "三", "四", "五"];
  const sectionInstructions = period.sections
    .map((section, index) => {
      const title = sectionTitle(section);
      const items = buckets.buckets[section.month] ?? [];
      const introHint =
        section.kind === "development"
          ? "先写 1-2 句该月开发整体进展概括（如提测、bug 修复、开发中等），再列编号清单。敏捷迭代项按 work_month 归属本月开发。"
          : "列该月需求推进编号清单（仅含已排期及更早推进态的需求，不含待排期）。";

      return `${numerals[index]}、${title}
${introHint}
数据：
${JSON.stringify(items, null, 2)}`;
    })
    .join("\n\n");

  const otherIndex = period.sections.length;
  const otherSection = `${numerals[otherIndex]}、其他
列待排期及暂未归入上述各月段的需求，不要重复出现在前面各段。
数据：
${JSON.stringify(buckets.otherKeyItems, null, 2)}`;

  const totalSections = period.sections.length + 1;

  return `你是产品经理助手，请根据以下 P0/P1 需求数据，撰写「近期重点工作总结」。

## 时间范围规则（当前模式：${period.mode}）
${period.sections.map((s, i) => `${i + 1}. ${sectionTitle(s)}`).join("\n")}
${totalSections}. 其他（待排期等）

## 归类规则（必须遵守）
1. **本月/上月/下月**：按系统当前日期计算自然月；10 日前=上月+本月，10–19 日=上月+本月+下月，20 日后=本月+下月。
2. **敏捷迭代**：交付月 target_delivery_month 为发布月，实际开发月 work_month = 交付月 -1（如 7 月敏捷交付 → 归入 6 月开发段）。
3. **TOS 版本**：开发月与交付月相同。
4. **待排期**（pending_schedule）：只写在「其他」段，禁止写入任何「需求推进」段。
5. **开发中/测试中**：按 work_month 归入对应「开发工作」段。
6. **已排期/未启动/进行中/已评审**：按 delivery_month 归入对应「需求推进」段。
7. 严格使用已分组数据，不要把「其他」中的条目挪进七月/八月等推进段。

## 输出要求
1. 严格按 ${totalSections} 段输出：${period.sections.map((s) => sectionTitle(s)).join("、")}、其他。
2. 段标题格式如「一、六月开发工作」；「其他」段标题为「${numerals[otherIndex]}、其他」。
3. 每条格式：序号. 需求标题（进展、排期类型、版本等；可带 sr_number）。
4. 语气简洁专业；只输出正文，不要前言。

## 参考范例
${EXAMPLE_TEMPLATE}

## 产品
${productName}

## 各月需求数据
${sectionInstructions}

${otherSection}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "未登录" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ error: "未登录" }, 401);
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, product_id, products(name)")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return jsonResponse({ error: "无法读取用户资料" }, 400);
    }

    if (profile.role !== "product") {
      return jsonResponse({ error: "仅产品经理可使用此功能" }, 403);
    }

    if (!profile.product_id) {
      return jsonResponse({ error: "请先绑定所属产品" }, 400);
    }

    const { data: requirements, error: reqError } = await supabase
      .from("requirements")
      .select(
        "title, sr_number, priority, status, schedule_type, target_delivery_month, landing_version, supplementary_notes"
      )
      .eq("product_id", profile.product_id)
      .in("priority", ["P0", "P1"])
      .neq("status", "cancelled")
      .neq("status", "completed")
      .order("priority")
      .order("created_at", { ascending: false });

    if (reqError) {
      return jsonResponse({ error: reqError.message }, 400);
    }

    const deepseekKey = Deno.env.get("DEEPSEEK_API_KEY");
    if (!deepseekKey) {
      return jsonResponse(
        {
          error:
            "AI 服务未配置，请在 Supabase 项目 Secrets 中设置 DEEPSEEK_API_KEY",
        },
        503
      );
    }

    const now = new Date();
    const period = getSummaryPeriod(now);
    const productName =
      (profile.products as { name: string } | null)?.name ?? "产品";

    const buckets = bucketRequirements(
      (requirements ?? []) as RequirementRow[],
      period.sections
    );

    const totalItems =
      Object.values(buckets.buckets).reduce((sum, list) => sum + list.length, 0) +
      buckets.otherKeyItems.length;

    if (totalItems === 0) {
      return jsonResponse({ error: "暂无 P0/P1 需求可总结" }, 400);
    }

    // 即使「其他」为空也保留该段结构，便于格式统一
    const prompt = buildPrompt(productName, period, buckets);

    const aiResponse = await fetch(
      "https://api.deepseek.com/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${deepseekKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: DEEPSEEK_MODEL,
          messages: [
            {
              role: "system",
              content:
                "你是资深产品经理，擅长撰写简洁清晰的工作进展总结。",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.4,
        }),
      }
    );

    if (!aiResponse.ok) {
      const detail = await aiResponse.text();
      console.error("DeepSeek error:", detail);
      return jsonResponse({ error: "AI 生成失败，请稍后重试" }, 502);
    }

    const aiData = await aiResponse.json();
    const summary = aiData?.choices?.[0]?.message?.content?.trim();

    if (!summary) {
      return jsonResponse({ error: "AI 返回内容为空" }, 502);
    }

    return jsonResponse({ summary });
  } catch (error) {
    console.error(error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "服务器错误" },
      500
    );
  }
});
