"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProtectedPage } from "@/components/layout/protected-page";
import { RequirementForm } from "@/components/requirements/requirement-form";
import { createClient } from "@/lib/supabase/client";
import type { Product, Requirement } from "@/types/database";

function getReturnTo(id: string, from: string | null) {
  if (from === "list") return "/requirements";
  return `/requirements/detail?id=${id}`;
}

function EditRequirementContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const from = searchParams.get("from");
  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isPM, setIsPM] = useState(false);
  const [lockedProductName, setLockedProductName] = useState<string | undefined>();
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

      const [{ data: req }, { data: profile }, { data: productList }] =
        await Promise.all([
          supabase
            .from("requirements")
            .select("*")
            .eq("id", requirementId)
            .single(),
          supabase
            .from("profiles")
            .select("role, product_id, products(name)")
            .eq("id", user.id)
            .single(),
          supabase.from("products").select("*").order("name"),
        ]);

      if (!req) {
        setNotFound(true);
      } else {
        setRequirement(req);
        setProducts(productList || []);
        type ProfileRow = {
          role: string;
          product_id: string | null;
          products: { name: string } | null;
        };
        const prof = profile as ProfileRow | null;
        setIsPM(prof?.role === "project_manager");
        if (prof?.role !== "project_manager") {
          setLockedProductName(prof?.products?.name ?? undefined);
        }
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

  const returnTo = getReturnTo(requirement.id, from);
  const returnLabel = from === "list" ? "返回需求池" : "返回需求详情";

  return (
    <div className="space-y-5 w-full">
      <Link
        href={returnTo}
        className="inline-flex items-center gap-1.5 text-sm text-[#7a96ae] hover:text-[#5ba4d4] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {returnLabel}
      </Link>
      <h1 className="text-xl font-bold text-[#1a2332]">编辑需求</h1>

      <div
        className="bg-white rounded-2xl p-6"
        style={{
          boxShadow:
            "0 2px 12px 0 rgb(90 140 180 / 0.10), 0 1px 3px 0 rgb(90 140 180 / 0.06)",
        }}
      >
        <RequirementForm
          products={products}
          isProjectManager={isPM}
          lockedProductName={lockedProductName}
          requirement={requirement}
          returnTo={returnTo}
        />
      </div>
    </div>
  );
}

export default function EditRequirementPage() {
  return (
    <ProtectedPage>
      <Suspense fallback={<p className="text-sm text-[#7a96ae]">加载中...</p>}>
        <EditRequirementContent />
      </Suspense>
    </ProtectedPage>
  );
}
