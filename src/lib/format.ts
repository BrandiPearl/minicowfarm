export function formatPrice(
  amount: number | null | undefined,
  currency = "USD",
): string {
  if (amount == null) return "Contact for price";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}

export function statusLabel(status: string): string {
  switch (status) {
    case "available":
      return "Available";
    case "reserved":
      return "Reserved";
    case "sold":
      return "Sold";
    case "draft":
      return "Draft";
    default:
      return status;
  }
}

export function genderLabel(gender: string, species?: string): string {
  if (species === "donkey") {
    if (gender === "female") return "Jenny (Female Donkey)";
    if (gender === "male") return "Jack (Male Donkey)";
  }
  if (gender === "female") return "Female";
  if (gender === "male") return "Male";
  return "Unknown";
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
