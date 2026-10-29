import { requireAdminUser } from "@/lib/auth/admin";
import { InquiryStatusForm } from "@/components/admin/InquiryStatusForm";
import { formatDate } from "@/lib/format";

export default async function AdminInquiriesPage() {
  const { supabase } = await requireAdminUser();
  const { data, error } = await supabase
    .from("inquiries")
    .select("*, animals(name, slug)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return <p className="text-red-600">Failed to load inquiries: {error.message}</p>;
  }

  return (
    <div>
      <h1 className="font-display text-4xl font-bold text-forest">Inquiries</h1>
      <div className="mt-8 space-y-4">
        {(data ?? []).map((inquiry) => {
          const animal = inquiry.animals as { name: string; slug: string } | null;
          return (
            <article key={inquiry.id} className="border border-border bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-forest">{inquiry.name}</h2>
                  <p className="text-sm text-muted">
                    {inquiry.email}
                    {inquiry.phone ? ` · ${inquiry.phone}` : ""} · {formatDate(inquiry.created_at)}
                  </p>
                  {animal ? (
                    <p className="mt-1 text-sm">
                      Animal: <span className="font-medium">{animal.name}</span>
                    </p>
                  ) : null}
                </div>
                <InquiryStatusForm id={inquiry.id} status={inquiry.status} />
              </div>
              {inquiry.message ? (
                <p className="mt-3 whitespace-pre-line text-sm text-ink/85">{inquiry.message}</p>
              ) : null}
            </article>
          );
        })}
        {(data ?? []).length === 0 ? (
          <p className="text-muted">No inquiries yet.</p>
        ) : null}
      </div>
    </div>
  );
}
