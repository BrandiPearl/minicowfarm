import { requireAdminUser } from "@/lib/auth/admin";
import { AnimalForm } from "@/components/admin/AnimalForm";

export default async function NewAnimalPage() {
  await requireAdminUser();
  return (
    <div>
      <h1 className="mb-6 font-display text-4xl font-bold text-forest">Add animal</h1>
      <AnimalForm />
    </div>
  );
}
