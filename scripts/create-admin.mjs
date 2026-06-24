import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  const env = {};
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return env;
}

const ADMIN_EMAIL = "admin@transsion.com";
const ADMIN_PASSWORD = "admin";
const ADMIN_NAME = "admin";

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or API key in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function ensureProfile(userId) {
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: ADMIN_NAME,
      role: "project_manager",
      product_id: null,
    })
    .eq("id", userId);

  if (error) throw error;
}

async function createWithServiceRole() {
  const { data: existing } = await supabase.auth.admin.listUsers();
  const found = existing?.users?.find((u) => u.email === ADMIN_EMAIL);

  if (found) {
    await ensureProfile(found.id);
    console.log("Admin account already exists, profile updated.");
    return;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: ADMIN_NAME },
  });

  if (error) throw error;
  await ensureProfile(data.user.id);
  console.log("Admin account created.");
}

async function createWithAnonKey() {
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    options: { data: { full_name: ADMIN_NAME } },
  });

  if (signUpError && !signUpError.message.toLowerCase().includes("already")) {
    throw signUpError;
  }

  let userId = signUpData.user?.id;

  if (!userId) {
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      });
    if (signInError) throw signInError;
    userId = signInData.user.id;
  }

  await ensureProfile(userId);
  console.log("Admin account ready.");
}

try {
  if (env.SUPABASE_SERVICE_ROLE_KEY) {
    await createWithServiceRole();
  } else {
    await createWithAnonKey();
  }

  console.log(`Email: ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
  console.log("Role: project_manager (can view all requirements)");
} catch (error) {
  console.error("Failed to create admin:", error.message ?? error);
  console.error(
    "\nIf password is too short, add SUPABASE_SERVICE_ROLE_KEY to .env.local and retry,\n" +
      "or run supabase/migrations/002_seed_admin.sql in Supabase SQL Editor."
  );
  process.exit(1);
}
