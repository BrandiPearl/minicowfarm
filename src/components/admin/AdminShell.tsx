"use client";

import { usePathname } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname.startsWith("/admin/login");

  if (isLogin) {
    return <div className="min-h-screen bg-cream">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-cream-dark md:flex">
      <AdminNav />
      <div className="flex-1 p-6 md:p-8">{children}</div>
    </div>
  );
}
