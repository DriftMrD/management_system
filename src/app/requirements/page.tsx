"use client";

import { useEffect, useState } from "react";
import { ProtectedPage } from "@/components/layout/protected-page";
import { RequirementsList } from "@/components/requirements/requirements-list";
import { createClient } from "@/lib/supabase/client";
import type { Product, Requirement, UserRole } from "@/types/database";

export default function RequirementsPage() {
  const [requirements, setRequirements] = useState<
    (Requirement & { products: Product | null })[]
  >([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isPM, setIsPM] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>("product");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: profile }, { data: productList }, { data: reqList }] =
        await Promise.all([
          supabase.from("profiles").select("role").eq("id", user.id).single(),
          supabase.from("products").select("*").order("name"),
          supabase
            .from("requirements")
            .select("*, products(*)")
            .order("created_at", { ascending: false }),
        ]);

      const prof = profile as { role: UserRole } | null;
      setIsPM(prof?.role === "project_manager");
      if (prof?.role) setUserRole(prof.role);
      setProducts(productList || []);
      setRequirements((reqList as (Requirement & { products: Product | null })[]) || []);
      setLoading(false);
    }

    load();
  }, []);

  return (
    <ProtectedPage>
      {loading ? (
        <p className="text-sm text-[#7a96ae]">加载中...</p>
      ) : (
        <RequirementsList
          requirements={requirements}
          products={products}
          isProjectManager={isPM}
          userRole={userRole}
        />
      )}
    </ProtectedPage>
  );
}
