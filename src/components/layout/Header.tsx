"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Mail } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { brand, navLinks } from "@/lib/brand";

type HeaderProps = {
  email?: string;
};

export function Header({ email = brand.email }: HeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-50 border-b border-border/70 bg-white">
      <div className="mx-auto flex w-full max-w-[1300px] items-center gap-3 px-4 py-2.5 sm:px-6 md:items-center md:gap-6 md:py-3 lg:px-8">
        <Link
          href="/"
          className="group shrink-0 transition-opacity hover:opacity-90"
          onClick={() => setOpen(false)}
          aria-label={`${brand.name} home`}
        >
          <Logo size={176} priority className="h-16 w-16 shadow-sm md:h-[88px] md:w-[88px]" />
        </Link>

        <div className="hidden min-w-0 flex-1 flex-col items-start justify-center gap-2.5 md:flex">
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-2.5 rounded-full bg-[#0A1905] px-6 py-2 text-[13px] font-medium leading-none text-[#F8F6F1] transition-opacity hover:opacity-90"
          >
            <Mail className="h-3.5 w-3.5 shrink-0 text-[#FBCA1E]" aria-hidden />
            <span className="text-[#F8F6F1]">{email}</span>
          </a>

          <nav
            aria-label="Main"
            className="flex w-full flex-wrap items-center gap-x-4 gap-y-1.5 lg:gap-x-5"
          >
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`whitespace-nowrap text-[13px] font-medium tracking-[0.01em] transition-colors lg:text-[14px] ${
                    active
                      ? "text-forest-bright"
                      : "text-forest hover:text-forest-bright"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="ml-auto flex items-center gap-2 md:hidden">
          <a
            href={`mailto:${email}`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0A1905]"
            aria-label={`Email ${email}`}
          >
            <Mail className="h-4 w-4 text-[#FBCA1E]" strokeWidth={2.25} />
          </a>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-forest"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          className="border-t border-border bg-white px-5 py-4 md:hidden"
          aria-label="Mobile"
        >
          <ul className="flex flex-col">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`block border-b border-border/60 py-3 text-[15px] font-medium ${
                    pathname === link.href ? "text-forest-bright" : "text-forest"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <a
            href={`mailto:${email}`}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#0A1905] px-5 py-2.5 text-sm text-[#F8F6F1]"
          >
            <Mail className="h-4 w-4 text-[#FBCA1E]" />
            {email}
          </a>
        </nav>
      ) : null}
    </header>
  );
}
