/** Normalize listing fields that may still contain mashed import text. */
export function cleanAgeDescription(age: string | null | undefined, name?: string | null) {
  if (!age) return null;
  let value = age.trim();

  if (/Color\s*:/i.test(value)) {
    value = value.split(/Color\s*:/i)[0]?.trim() || value;
  }

  if (name && value.includes(name)) {
    value = value.slice(0, value.indexOf(name)).trim();
  }

  const months = value.match(/^(\d+\s*Months?)\b/i);
  if (months) return months[1];

  return value.slice(0, 80) || null;
}

export function cleanColor(color: string | null | undefined, name?: string | null) {
  if (!color) return null;
  let value = color.trim();
  if (name) {
    const idx = value.indexOf(name);
    if (idx > 0) value = value.slice(0, idx).trim();
  }
  const prose = value.search(
    /\s+[A-Z][\w'&]*(?:\s(?:&|and)\s[A-Z][\w']*)*\s+is\s+(?:an?\s+)?(?:adorable|beautiful|fluffy|charming|handsome|stunning|true|bold|ready|\d)/i,
  );
  if (prose > 0) value = value.slice(0, prose).trim();
  return value.slice(0, 120) || null;
}
