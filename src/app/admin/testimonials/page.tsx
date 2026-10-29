import { requireAdminUser } from "@/lib/auth/admin";
import { TestimonialAdminForm } from "@/components/admin/TestimonialAdminForm";

export default async function AdminTestimonialsPage() {
  const { supabase } = await requireAdminUser();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    return <p className="text-red-600">Failed to load testimonials: {error.message}</p>;
  }

  return (
    <div>
      <h1 className="font-display text-4xl font-bold text-forest">Testimonials</h1>
      <p className="mt-2 text-sm text-muted">
        Publish only authentic, authorized customer stories. Do not copy third-party reviews.
      </p>
      <div className="mt-8">
        <TestimonialAdminForm existing={data ?? []} />
      </div>
    </div>
  );
}
