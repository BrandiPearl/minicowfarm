"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { InquiryStatus } from "@/types/database";

const statuses: InquiryStatus[] = ["new", "in_progress", "responded", "closed", "spam"];

export function InquiryStatusForm({ id, status }: { id: string; status: InquiryStatus }) {
  const router = useRouter();

  async function onChange(next: InquiryStatus) {
    const supabase = createClient();
    await supabase.from("inquiries").update({ status: next }).eq("id", id);
    router.refresh();
  }

  return (
    <select
      className="rounded border border-black/25 px-2 py-1 text-sm"
      value={status}
      onChange={(e) => void onChange(e.target.value as InquiryStatus)}
    >
      {statuses.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
