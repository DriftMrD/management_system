"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProtectedPage } from "@/components/layout/protected-page";
import { RequirementDetail } from "@/components/requirements/requirement-detail";
import { createClient } from "@/lib/supabase/client";
import type { Product, Profile, Requirement } from "@/types/database";

function RequirementDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [requirement, setRequirement] = useState<
    (Requirement & { products: Product | null }) | null
  >(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    async function load() {
      const requirementId = id;
      if (!requirementId) return;

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: req }, { data: prof }] = await Promise.all([
        supabase
          .from("requirements")
          .select("*, products(*)")
          .eq("id", requirementId)
          .single(),
        supabase.from("profiles").select("*").eq("id", user.id).single(),
      ]);

      if (!req) {
        setNotFound(true);
      } else {
        setRequirement(req);
        setProfile(prof);
      }
      setLoading(false);
    }

    load();
  }, [id]);

  if (loading) {
    return <p className="text-sm text-[#7a96ae]">加载中...</p>;
  }

  if (notFound || !requirement) {
    return <p className="text-sm text-[#7a96ae]">需求不存在或无权访问</p>;
  }

  return (
    <RequirementDetail
      requirement={requirement}
      isProjectManager={profile?.role === "project_manager"}
      profile={profile}
    />
  );
}

export default function RequirementDetailPage() {
  return (
    <ProtectedPage>
      <Suspense fallback={<p className="text-sm text-[#7a96ae]">加载中...</p>}>
        <RequirementDetailContent />
      </Suspense>
    </ProtectedPage>
  );
}
