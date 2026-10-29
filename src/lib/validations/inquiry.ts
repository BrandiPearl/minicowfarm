import { z } from "zod";

export const inquirySchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email").max(200),
  phone: z.string().trim().min(7, "Phone is required").max(40),
  message: z.string().trim().max(4000).optional(),
  animalId: z.string().uuid().optional().nullable(),
  /** Honeypot, must stay empty */
  website: z.string().max(0).optional(),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

export const contactSchema = inquirySchema.omit({ animalId: true });

export type ContactInput = z.infer<typeof contactSchema>;
