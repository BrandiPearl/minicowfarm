"use client";

import { FormEvent, useRef, useState } from "react";
import { inquirySchema } from "@/lib/validations/inquiry";
import { Button } from "@/components/ui/Button";

type InquiryFormProps = {
  animalId?: string;
  animalName?: string;
  source?: string;
};

export function InquiryForm({ animalId, animalName, source = "inquiry" }: InquiryFormProps) {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;

    setServerError(null);
    setServerMessage(null);
    setFieldErrors({});
    setIsSubmitting(true);

    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const values = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      phone: String(form.get("phone") || ""),
      message: String(form.get("message") || ""),
      animalId: animalId || null,
      website: String(form.get("website") || ""),
    };

    const parsed = inquirySchema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!next[key]) next[key] = issue.message;
      }
      setFieldErrors(next);
      setIsSubmitting(false);
      submittingRef.current = false;
      return;
    }

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          message: parsed.data.message ?? "",
          website: parsed.data.website ?? "",
          source,
        }),
      });

      let data: { ok?: boolean; error?: string; message?: string } = {};
      try {
        data = (await res.json()) as typeof data;
      } catch {
        setServerMessage(null);
        setServerError("Something went wrong. Please try again.");
        return;
      }

      if (!res.ok || !data.ok) {
        setServerMessage(null);
        setServerError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setServerError(null);
      setServerMessage(data.message ?? "Thanks, we received your inquiry and will respond soon.");
      formEl.reset();
    } catch {
      setServerMessage(null);
      setServerError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
      submittingRef.current = false;
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-forest">
          Name <span className="text-red-600">*</span>
        </label>
        <input
          id="name"
          name="name"
          required
          disabled={isSubmitting}
          className="w-full rounded-[2px] border border-border bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-forest-bright disabled:opacity-60"
        />
        {fieldErrors.name ? <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p> : null}
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-forest">
          Email <span className="text-red-600">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          disabled={isSubmitting}
          className="w-full rounded-[2px] border border-border bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-forest-bright disabled:opacity-60"
        />
        {fieldErrors.email ? <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p> : null}
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium text-forest">
          Phone <span className="text-red-600">*</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          disabled={isSubmitting}
          className="w-full rounded-[2px] border border-border bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-forest-bright disabled:opacity-60"
        />
        {fieldErrors.phone ? <p className="mt-1 text-sm text-red-600">{fieldErrors.phone}</p> : null}
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-forest">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          disabled={isSubmitting}
          defaultValue={animalName ? `I'm interested in ${animalName}.` : ""}
          className="w-full rounded-[2px] border border-border bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-forest-bright disabled:opacity-60"
        />
      </div>

      {serverError ? (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {serverError}
        </p>
      ) : null}
      {!serverError && serverMessage ? (
        <p className="rounded border border-forest/20 bg-sage/30 px-3 py-2 text-sm text-forest" role="status">
          {serverMessage}
        </p>
      ) : null}

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? "Sending..." : "Submit"}
      </Button>
    </form>
  );
}
