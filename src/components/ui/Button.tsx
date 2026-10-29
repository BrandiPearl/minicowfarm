import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

const variants = {
  /** Dark forest primary CTA; cream text for contrast on deep green */
  primary:
    "bg-forest text-cream hover:bg-forest-deep hover:text-cream border border-transparent",
  /** Bright green secondary solid CTA */
  secondary:
    "bg-forest-bright text-cream hover:bg-forest-soft hover:text-cream border border-transparent",
  /** Mid green outline */
  outline:
    "bg-transparent text-forest border border-forest hover:bg-forest hover:text-cream",
  outlineLight:
    "bg-transparent text-cream border border-cream/80 hover:bg-cream hover:text-forest",
  soft: "bg-forest-soft text-cream hover:bg-forest-bright hover:text-cream border border-transparent",
} as const;

type Variant = keyof typeof variants;

type Common = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

type ButtonAsButton = Common &
  Omit<ComponentProps<"button">, "className" | "children"> & { href?: undefined };

type ButtonAsLink = Common & { href: string; type?: never; disabled?: never };

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonAsButton | ButtonAsLink) {
  const classes = `inline-flex items-center justify-center rounded-[2px] px-5 py-3 text-sm font-semibold tracking-wide transition-colors disabled:opacity-60 ${variants[variant]} ${className}`;

  if ("href" in props && props.href) {
    const { href, ...rest } = props;
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const buttonProps = props as ButtonAsButton;
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
