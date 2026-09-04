import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { requireMember } from "@/features/auth/require-member";

export const dynamic = "force-dynamic";

export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const member = await requireMember();

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <AppSidebar />
      <div className="lg:pl-64">
        <AppHeader member={member} />
        <main className="px-5 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
