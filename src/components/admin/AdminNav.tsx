"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/animals", label: "Animals" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/policies", label: "Policies" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex w-full flex-col border-b border-border bg-forest text-cream md:min-h-screen md:w-56 md:border-b-0 md:border-r">
      <div className="px-4 py-5">
        <p className="font-display text-2xl font-bold">Admin</p>
        <Link href="/" className="mt-1 text-xs text-sage hover:underline">
          View site
        </Link>
      </div>
      <nav className="flex flex-1 flex-wrap gap-1 px-2 pb-4 md:flex-col">
        {links.map((link) => {
          const active =
            link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded px-3 py-2 text-sm ${
                active ? "bg-white/15 text-gold-bright" : "hover:bg-white/10"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={signOut}
        className="m-3 rounded border border-white/20 px-3 py-2 text-left text-sm hover:bg-white/10"
      >
        Sign out
      </button>
    </aside>
  );
}
