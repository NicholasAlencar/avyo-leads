"use server";

import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { getPublicEnv } from "@/lib/env/public";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { mapAuthError, type LoginState } from "./auth-result";
import { parseLoginCredentials } from "./credentials";

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  let credentials;

  try {
    credentials = parseLoginCredentials({
      email: formData.get("email"),
      password: formData.get("password"),
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return { status: "error", message: error.issues[0]?.message ?? "Dados inválidos." };
    }
    return { status: "error", message: mapAuthError(error) };
  }

  const env = getPublicEnv();
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return { status: "error", message: mapAuthError({ code: "not_configured" }) };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword(credentials);

    if (error) {
      return { status: "error", message: mapAuthError(error) };
    }
  } catch (error) {
    return { status: "error", message: mapAuthError(error) };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}
