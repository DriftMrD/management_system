import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { USER_ROLE_LABELS } from "@/types/database";
import { LogoutButton } from "./logout-button";
import { ClipboardList, Calendar, LayoutDashboard } from "lucide-react";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("*, products(name)")
        .eq("id", user.id)
        .single()
    : { data: null };

  const isPM = profile?.role === "project_manager";
  const productName =
    profile && "products" in profile && profile.products
      ? (profile.products as { name: string }).name
      : null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/requirements" className="font-semibold text-foreground">
                需求管理系统
              </Link>
              <nav className="hidden sm:flex items-center gap-1">
                <NavLink href="/requirements" icon={<ClipboardList className="w-4 h-4" />}>
                  需求池
                </NavLink>
                {isPM && (
                  <NavLink href="/schedule" icon={<Calendar className="w-4 h-4" />}>
                    全部排期
                  </NavLink>
                )}
                <NavLink href="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />}>
                  概览
                </NavLink>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              {profile && (
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{profile.full_name || profile.email}</p>
                  <p className="text-xs text-muted">
                    {USER_ROLE_LABELS[profile.role]}
                    {productName && ` · ${productName}`}
                  </p>
                </div>
              )}
              <LogoutButton />
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
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted rounded-md hover:bg-slate-100 hover:text-foreground transition-colors"
    >
      {icon}
      {children}
    </Link>
  );
}
