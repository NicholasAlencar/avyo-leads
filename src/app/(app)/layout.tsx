import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { requireMember } from "@/features/auth/require-member";

export const dynamic = "force-dynamic";

export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const member = await requireMember();

  return (
    <div className="min-h-screen bg-[var(--canvas)]">
      <AppSidebar member={member} />
      <div className="lg:pl-[248px]">
        <AppHeader member={member} />
        <main className="mx-auto max-w-[1720px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
