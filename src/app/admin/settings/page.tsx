import { requireAdminUser } from "@/lib/auth/admin";
import { SettingsForm } from "@/components/admin/SettingsForm";
import type { SiteSettings } from "@/types/database";

export default async function AdminSettingsPage() {
  const { supabase } = await requireAdminUser();
  const { data, error } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();

  if (error) {
    return <p className="text-red-600">Failed to load settings: {error.message}</p>;
  }

  return (
    <div>
      <h1 className="font-display text-4xl font-bold text-forest">Site settings</h1>
      <p className="mt-2 text-sm text-muted">
        Brand contact details used across the public site. Change these without redesigning pages.
      </p>
      <div className="mt-8">
        <SettingsForm settings={(data as SiteSettings | null) ?? null} />
      </div>
    </div>
  );
}
