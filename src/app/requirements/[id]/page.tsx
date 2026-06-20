import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { RequirementDetail } from "@/components/requirements/requirement-detail";
import { createClient } from "@/lib/supabase/server";

export default async function RequirementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const { data: requirement } = await supabase
    .from("requirements")
    .select("*, products(*)")
    .eq("id", id)
    .single();

  if (!requirement) notFound();

  return (
    <AppShell>
      <RequirementDetail
        requirement={requirement}
        isProjectManager={profile?.role === "project_manager"}
        profile={profile}
      />
    </AppShell>
  );
}
