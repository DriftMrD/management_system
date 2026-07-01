"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { USER_ROLE_LABELS, type Profile } from "@/types/database";
import { LogoutButton } from "./logout-button";
import { ClipboardList, LayoutDashboard, GanttChart } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<
    (Profile & { products: { name: string } | null }) | null
  >(null);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*, products(name)")
        .eq("id", user.id)
        .single();

      if (data) setProfile(data);
    }

    loadProfile();
  }, []);

  const productName = profile?.products?.name ?? null;

  return (
    <div className="min-h-screen flex flex-col bg-[#e8eff6]">
      <header className="sticky top-0 z-20">
        <div
          className="bg-white/80 backdrop-blur-md border-b border-[#dde6ef]/60"
          style={{ boxShadow: "0 1px 0 0 rgb(90 140 180 / 0.08)" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-14 items-center justify-between">
              <div className="flex items-center gap-6">
                <Link
                  href="/requirements"
                  className="flex items-center gap-2 group"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#5ba4d4] flex items-center justify-center shadow-[0_2px_6px_0_rgb(91_164_212/0.35)]">
                    <ClipboardList className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="font-semibold text-[#1a2332] text-sm group-hover:text-[#5ba4d4] transition-colors">
                    需求管理系统
                  </span>
                </Link>

                <nav className="hidden sm:flex items-center gap-0.5">
                  <NavLink
                    href="/requirements"
                    icon={<ClipboardList className="w-3.5 h-3.5" />}
                  >
                    需求池
                  </NavLink>
                  <NavLink href="/schedule/gantt" icon={<GanttChart className="w-3.5 h-3.5" />}>
                    甘特图
                  </NavLink>
                  <NavLink
                    href="/dashboard"
                    icon={<LayoutDashboard className="w-3.5 h-3.5" />}
                  >
                    概览
                  </NavLink>
                </nav>
              </div>

              <div className="flex items-center gap-3">
                {profile && (
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-medium text-[#1a2332] leading-tight">
                      {profile.full_name || profile.email}
                    </p>
                    <p className="text-[11px] text-[#7a96ae] leading-tight mt-0.5">
                      {USER_ROLE_LABELS[profile.role]}
                      {productName && ` · ${productName}`}
                    </p>
                  </div>
                )}
                {profile && (
                  <div className="w-8 h-8 rounded-full bg-[#e8f3fb] flex items-center justify-center text-xs font-semibold text-[#5ba4d4] select-none">
                    {(profile.full_name || profile.email || "?")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#7a96ae] rounded-lg hover:bg-[#e8f3fb] hover:text-[#5ba4d4] transition-all duration-150"
    >
      {icon}
      {children}
    </Link>
  );
}
