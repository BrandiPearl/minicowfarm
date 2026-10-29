import { requireAdminUser } from "@/lib/auth/admin";
import { PolicyEditor } from "@/components/admin/PolicyEditor";

export default async function AdminPoliciesPage() {
  const { supabase } = await requireAdminUser();
  const { data, error } = await supabase.from("policy_pages").select("*").order("slug");

  if (error) {
    return <p className="text-red-600">Failed to load policies: {error.message}</p>;
  }

  return (
    <div>
      <h1 className="font-display text-4xl font-bold text-forest">Policies</h1>
      <p className="mt-2 text-sm text-muted">
        Edit health guarantee and shipping policy content. Keep claims accurate and documented.
      </p>
      <div className="mt-8 space-y-10">
        {(data ?? []).map((page) => (
          <PolicyEditor key={page.id} page={page} />
        ))}
        {(data ?? []).length === 0 ? (
          <p className="text-muted">
            No policy rows yet. Run <code>supabase/seed.sql</code> or insert{" "}
            <code>health-guarantee</code> and <code>shipping-and-delivery-policy</code> slugs.
          </p>
        ) : null}
      </div>
    </div>
  );
}
