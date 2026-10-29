import Image from "next/image";
import { brand } from "@/lib/brand";

type LogoProps = {
  size?: number;
  className?: string;
  priority?: boolean;
};

export function Logo({ size = 96, className = "", priority = false }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt={`${brand.name} logo`}
      width={size}
      height={size}
      priority={priority}
      className={`rounded-full object-cover ${className}`}
      sizes={`${size}px`}
    />
  );
}
