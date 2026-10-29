import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { brand, navLinks } from "@/lib/brand";

type FooterProps = {
  email?: string;
  phone?: string;
  location?: string;
};

export function Footer({
  email = brand.email,
  phone = brand.phone,
  location = brand.location,
}: FooterProps) {
  const year = new Date().getFullYear();
  const quick = navLinks.filter((l) => l.href !== "/");

  return (
    <footer className="bg-forest text-cream">
      <div className="container-site grid gap-10 py-10 md:grid-cols-3 md:items-start md:py-12">
        <div className="flex justify-center md:justify-start">
          <Link href="/" aria-label={`${brand.name} home`} className="inline-block">
            <Logo size={96} className="h-[89px] w-[89px] ring-2 ring-cream/30" />
          </Link>
        </div>

        <div>
          <h2 className="mb-5 text-center text-[22px] font-semibold uppercase tracking-wide text-white md:text-left">
            Quick Links
          </h2>
          <ul className="flex flex-col items-center gap-2 text-sm md:items-start">
            {quick.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-cream/90 hover:text-gold-bright">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-5 text-center text-[22px] font-semibold uppercase tracking-wide text-white md:text-left">
            Contact
          </h2>
          <ul className="space-y-2 text-center text-sm text-cream/90 md:text-left">
            <li>
              <a href={`mailto:${email}`} className="hover:text-gold-bright">
                {email}
              </a>
            </li>
            <li>
              <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="hover:text-gold-bright">
                {phone}
              </a>
            </li>
            <li>{location}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-site py-5 text-center text-xs text-sage sm:text-left">
          <p>
            © {year} {brand.legalName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
