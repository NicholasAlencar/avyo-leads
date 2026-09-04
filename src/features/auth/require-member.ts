import "server-only";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type OrganizationRole = "admin" | "manager" | "member";

export interface CurrentMember {
  userId: string;
  organizationId: string;
  role: OrganizationRole;
  name: string;
}

interface MembershipRow {
  organization_id: string;
  role: OrganizationRole;
  profiles: { display_name: string } | null;
}

export async function requireMember(): Promise<CurrentMember> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("organization_members")
    .select(
      "organization_id, role, profiles!organization_members_user_id_fkey(display_name)",
    )
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  const membership = data as MembershipRow | null;

  if (error || !membership || !membership.profiles) {
    redirect("/login?reason=membership");
  }

  return {
    userId: user.id,
    organizationId: membership.organization_id,
    role: membership.role,
    name: membership.profiles.display_name,
  };
}
