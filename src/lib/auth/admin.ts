import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireAdminUser() {
  if (!isSupabaseConfigured()) {
    redirect("/admin");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/admin/login?error=not_admin");
  }

  return { supabase, user, profile };
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
