import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="container-site py-24 text-center">
      <h1 className="font-display text-5xl font-bold text-forest">Page not found</h1>
      <p className="mt-4 text-ink/80">That page doesn’t exist or the animal listing was removed.</p>
      <div className="mt-8">
        <Button href="/">Back home</Button>
      </div>
      <p className="mt-4 text-sm">
        Or browse{" "}
        <Link href="/available-mini-cows" className="underline">
          available mini cows
        </Link>
        .
      </p>
    </div>
  );
}
