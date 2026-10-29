"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "not_admin"
      ? "Signed in, but this account is not an administrator."
      : null,
  );
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
      router.push(searchParams.get("next") || "/admin");
      router.refresh();
    } catch {
      setError(
        "Unable to sign in. Ensure Supabase env vars are configured and you have an admin profile.",
      );
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-16 w-full max-w-md space-y-4 border border-border bg-white p-8 shadow-sm">
      <h1 className="font-display text-4xl font-bold text-forest">Admin sign in</h1>
      <p className="text-sm text-muted">
        Use the Supabase Auth user that has a matching row in <code>admin_profiles</code>.
      </p>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          className="w-full rounded border border-black/25 px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          className="w-full rounded border border-black/25 px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center">Loading…</p>}>
      <LoginForm />
    </Suspense>
  );
}
