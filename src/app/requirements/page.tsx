import { AppShell } from "@/components/layout/app-shell";
import { RequirementsList } from "@/components/requirements/requirements-list";
import { createClient } from "@/lib/supabase/server";

export default async function RequirementsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  const isPM = profile?.role === "project_manager";

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("name");

  const { data: requirements } = await supabase
    .from("requirements")
    .select("*, products(*)")
    .order("created_at", { ascending: false });

  return (
    <AppShell>
      <RequirementsList
        requirements={requirements || []}
        products={products || []}
        isProjectManager={isPM}
      />
    </AppShell>
  );
}
