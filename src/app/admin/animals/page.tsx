import Link from "next/link";
import { requireAdminUser } from "@/lib/auth/admin";
import { formatPrice, statusLabel } from "@/lib/format";
import { Button } from "@/components/ui/Button";

export default async function AdminAnimalsPage() {
  const { supabase } = await requireAdminUser();
  const { data, error } = await supabase
    .from("animals")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return <p className="text-red-600">Failed to load animals: {error.message}</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl font-bold text-forest">Animals</h1>
        <Button href="/admin/animals/new">Add animal</Button>
      </div>

      <div className="mt-8 overflow-x-auto border border-border bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-cream">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Species</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Published</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((animal) => (
              <tr key={animal.id} className="border-b border-border">
                <td className="px-4 py-3 font-medium">{animal.name}</td>
                <td className="px-4 py-3">{animal.species}</td>
                <td className="px-4 py-3">{statusLabel(animal.status)}</td>
                <td className="px-4 py-3">{formatPrice(animal.price, animal.currency)}</td>
                <td className="px-4 py-3">{animal.published ? "Yes" : "No"}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/animals/${animal.id}`} className="text-forest-bright underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(data ?? []).length === 0 ? (
          <p className="p-6 text-muted">No animals yet. Add your first listing.</p>
        ) : null}
      </div>
    </div>
  );
}
