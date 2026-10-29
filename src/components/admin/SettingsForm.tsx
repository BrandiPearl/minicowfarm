"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { brand } from "@/lib/brand";
import type { SiteSettings } from "@/types/database";

export function SettingsForm({ settings }: { settings: SiteSettings | null }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setError(null);
    setMessage(null);
    const payload = {
      business_name: String(formData.get("business_name") || brand.name),
      email: String(formData.get("email") || brand.email),
      phone: String(formData.get("phone") || "") || null,
      whatsapp: String(formData.get("whatsapp") || "") || null,
      location: String(formData.get("location") || "") || null,
      address_line: String(formData.get("address_line") || "") || null,
      tagline: String(formData.get("tagline") || "") || null,
      social_tiktok: String(formData.get("social_tiktok") || "") || null,
      social_facebook: String(formData.get("social_facebook") || "") || null,
      social_instagram: String(formData.get("social_instagram") || "") || null,
    };

    const supabase = createClient();
    if (settings?.id) {
      const { error: updateError } = await supabase
        .from("site_settings")
        .update(payload)
        .eq("id", settings.id);
      if (updateError) {
        setError(updateError.message);
        return;
      }
    } else {
      const { error: insertError } = await supabase.from("site_settings").insert(payload);
      if (insertError) {
        setError(insertError.message);
        return;
      }
    }
    setMessage("Saved.");
    router.refresh();
  }

  return (
    <form action={onSubmit} className="max-w-xl space-y-3">
      {(
        [
          ["business_name", "Business name", settings?.business_name ?? brand.name],
          ["email", "Email", settings?.email ?? brand.email],
          ["phone", "Phone", settings?.phone ?? brand.phone],
          ["whatsapp", "WhatsApp", settings?.whatsapp ?? brand.whatsapp],
          ["location", "Location", settings?.location ?? brand.location],
          ["address_line", "Address line", settings?.address_line ?? brand.addressLine],
          ["tagline", "Tagline", settings?.tagline ?? brand.tagline],
          ["social_tiktok", "TikTok URL", settings?.social_tiktok ?? ""],
          ["social_facebook", "Facebook URL", settings?.social_facebook ?? ""],
          ["social_instagram", "Instagram URL", settings?.social_instagram ?? ""],
        ] as const
      ).map(([name, label, value]) => (
        <div key={name}>
          <label className="mb-1 block text-sm font-medium" htmlFor={name}>
            {label}
          </label>
          <input
            id={name}
            name={name}
            defaultValue={value}
            className="w-full rounded border border-black/25 px-3 py-2 text-sm"
          />
        </div>
      ))}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-forest">{message}</p> : null}
      <Button type="submit">Save settings</Button>
    </form>
  );
}
