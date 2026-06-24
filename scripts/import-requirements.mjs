import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

const CSV_PATH = resolve(
  process.cwd(),
  "「创新」产品需求池管理（2026）_产品需求池.csv"
);

const PRODUCT_CODES = {
  日历: "calendar",
  计算器: "calculator",
  时钟: "clock",
  Note: "note",
  主题: "theme",
  录音机: "recorder",
  换机助手: "phone_transfer",
  天气: "weather",
  文件管理: "file_manager",
  玩机技巧: "phone_tips",
  扫一扫: "scanner",
  Visha: "visha",
  文管: "document",
  AIoT: "aiot",
};

const STATUS_MAP = {
  未启动: "not_started",
  进行中: "in_progress",
  排期中: "scheduled",
  验收中: "in_progress",
  验收完成: "completed",
  测试中: "in_progress",
};

const RAT_MAP = {
  还未评审: "not_reviewed",
  通过: "passed",
  不涉及: "not_applicable",
};

function loadEnv() {
  const env = {};
  for (const line of readFileSync(resolve(process.cwd(), ".env.local"), "utf8").split(
    "\n"
  )) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return env;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || (ch === "\r" && next === "\n")) {
      row.push(field);
      field = "";
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      if (ch === "\r") i++;
    } else {
      field += ch;
    }
  }

  if (field.length || row.length) {
    row.push(field);
    if (row.some((cell) => cell.trim())) rows.push(row);
  }

  return rows;
}

function mapScheduleType(value) {
  const v = (value || "").trim().toLowerCase();
  if (v === "tos" || v === "t os") return "tos";
  if (v.includes("敏捷")) return "agile";
  return null;
}

function mapPriority(value) {
  const v = (value || "").trim();
  if (v === "P0" || v === "P1" || v === "P2") return v;
  return "P1";
}

function mapStatus(value) {
  return STATUS_MAP[(value || "").trim()] ?? "not_started";
}

function mapRat(value) {
  return RAT_MAP[(value || "").trim()] ?? "not_reviewed";
}

function mapNeedsDataAnalysis(value) {
  const v = (value || "").trim();
  return v === "是";
}

function buildNotes(row) {
  const parts = [];
  const pm = (row[6] || "").trim();
  const proposed = (row[7] || "").trim();
  const notes = (row[9] || "").trim();

  if (pm) parts.push(`产品经理: ${pm}`);
  if (proposed) parts.push(`提出日期: ${proposed}`);
  if (notes) parts.push(notes);
  return parts.join("\n");
}

function buildRelatedFiles(url) {
  const trimmed = (url || "").trim();
  if (!trimmed) return [];
  return [{ name: "相关文档", url: trimmed }];
}

function toRecords(rows) {
  const [, ...dataRows] = rows;
  return dataRows
    .map((cols) => ({
      title: (cols[0] || "").trim(),
      productName: (cols[1] || "").trim(),
      status: mapStatus(cols[2]),
      priority: mapPriority(cols[3]),
      scheduleType: mapScheduleType(cols[4]),
      needsDataAnalysis: mapNeedsDataAnalysis(cols[5]),
      targetDeliveryMonth: (cols[8] || "").trim() || null,
      supplementaryNotes: buildNotes(cols),
      relatedFiles: buildRelatedFiles(cols[10]),
      ratStatus: mapRat(cols[11]),
    }))
    .filter((r) => r.title);
}

async function loadProductMap(supabase) {
  const { data, error } = await supabase.from("products").select("id, name, code");
  if (error) throw error;

  const productMap = new Map();
  for (const [name, code] of Object.entries(PRODUCT_CODES)) {
    const product = data.find((p) => p.code === code);
    if (product) productMap.set(name, product.id);
  }
  return productMap;
}

function sqlString(value) {
  const escaped = (value || "")
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "''")
    .replace(/\r\n|\n|\r/g, "\\n");
  return `E'${escaped}'`;
}

function generateSql(records) {
  const lines = [
    "-- 从 CSV 导入需求池数据",
    "-- 在 Supabase Dashboard → SQL Editor 中执行",
    "",
    "INSERT INTO products (name, code) VALUES",
    "  ('计算器', 'calculator'),",
    "  ('时钟', 'clock'),",
    "  ('Note', 'note'),",
    "  ('主题', 'theme'),",
    "  ('录音机', 'recorder'),",
    "  ('换机助手', 'phone_transfer'),",
    "  ('天气', 'weather'),",
    "  ('文件管理', 'file_manager'),",
    "  ('玩机技巧', 'phone_tips'),",
    "  ('扫一扫', 'scanner'),",
    "  ('Visha', 'visha')",
    "ON CONFLICT (code) DO NOTHING;",
    "",
  ];

  for (const record of records) {
    const code = PRODUCT_CODES[record.productName];
    if (!code) continue;

    const relatedFiles =
      record.relatedFiles.length > 0
        ? JSON.stringify(record.relatedFiles).replace(/'/g, "''")
        : "[]";

    const scheduleType = record.scheduleType
      ? `'${record.scheduleType}'::schedule_type`
      : "NULL";

    lines.push(`INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  ${sqlString(record.title)},
  '',
  p.id,
  '${record.priority}'::priority_level,
  '${record.status}'::requirement_status,
  ${scheduleType},
  ${record.targetDeliveryMonth ? sqlString(record.targetDeliveryMonth) : "NULL"},
  '${record.ratStatus}'::rat_status,
  ${sqlString(record.supplementaryNotes)},
  ${record.needsDataAnalysis},
  '${relatedFiles}'::jsonb
FROM products p
WHERE p.code = '${code}'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = ${sqlString(record.title)} AND r.product_id = p.id
  );`);
    lines.push("");
  }

  return lines.join("\n");
}

async function main() {
  const csvText = readFileSync(CSV_PATH, "utf8");
  const records = toRecords(parseCsv(csvText));

  if (process.argv.includes("--sql")) {
    const { writeFileSync } = await import("fs");
    const outPath = resolve(
      process.cwd(),
      "supabase/migrations/005_import_requirements_pool.sql"
    );
    writeFileSync(outPath, generateSql(records), "utf8");
    console.log(`已生成 ${outPath}（${records.length} 条需求）`);
    return;
  }

  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error("Missing Supabase config in .env.local");
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: "admin@transsion.com",
      password: "admin",
    });
    if (signInError) throw signInError;
  }

  const productMap = await loadProductMap(supabase);

  let inserted = 0;
  let skipped = 0;

  for (const record of records) {
    const productId = productMap.get(record.productName);
    if (!productId) {
      console.warn(`跳过（未知产品）: ${record.title} [${record.productName}]`);
      skipped++;
      continue;
    }

    const { data: existing } = await supabase
      .from("requirements")
      .select("id")
      .eq("title", record.title)
      .eq("product_id", productId)
      .maybeSingle();

    if (existing) {
      skipped++;
      continue;
    }

    const { error } = await supabase.from("requirements").insert({
      title: record.title,
      description: "",
      product_id: productId,
      priority: record.priority,
      status: record.status,
      schedule_type: record.scheduleType,
      target_delivery_month: record.targetDeliveryMonth,
      rat_status: record.ratStatus,
      supplementary_notes: record.supplementaryNotes,
      needs_data_analysis: record.needsDataAnalysis,
      related_files: record.relatedFiles,
    });

    if (error) throw error;
    inserted++;
  }

  console.log(`导入完成: 新增 ${inserted} 条，跳过 ${skipped} 条（已存在或无效）`);
}

main().catch((err) => {
  console.error("导入失败:", err.message ?? err);
  process.exit(1);
});
