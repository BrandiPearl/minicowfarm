import Link from "next/link";
import { requireAdminUser, isSupabaseConfigured } from "@/lib/auth/admin";

export default async function AdminDashboardPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div>
        <h1 className="font-display text-4xl font-bold text-forest">Dashboard</h1>
        <p className="mt-4 max-w-xl text-sm text-ink/80">
          Supabase is not configured. Public pages use local demo data. Add env vars from{" "}
          <code>.env.example</code>, run migrations, create an Auth user, and insert an{" "}
          <code>admin_profiles</code> row to unlock the dashboard.
        </p>
      </div>
    );
  }

  const { supabase } = await requireAdminUser();

  const [animals, inquiries, posts] = await Promise.all([
    supabase.from("animals").select("id", { count: "exact", head: true }),
    supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("blog_posts").select("id", { count: "exact", head: true }),
  ]);

  const cards = [
    { label: "Animals", value: animals.count ?? 0, href: "/admin/animals" },
    { label: "New inquiries", value: inquiries.count ?? 0, href: "/admin/inquiries" },
    { label: "Blog posts", value: posts.count ?? 0, href: "/admin/blog" },
  ];

  return (
    <div>
      <h1 className="font-display text-4xl font-bold text-forest">Dashboard</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="border border-border bg-white p-6 shadow-sm hover:border-forest"
          >
            <p className="text-sm text-muted">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold text-forest">{card.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
