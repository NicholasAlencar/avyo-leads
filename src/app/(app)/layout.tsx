import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { requireMember } from "@/features/auth/require-member";

export const dynamic = "force-dynamic";

export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const member = await requireMember();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <AppSidebar />
      <div className="lg:pl-[276px]">
        <AppHeader member={member} />
        <main className="mx-auto max-w-[1680px] px-5 py-7 lg:px-9 lg:py-9">{children}</main>
      </div>
    </div>
  );
}
