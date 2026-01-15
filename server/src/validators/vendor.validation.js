import { z } from "zod";

export const createVendorSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format")
    .toLowerCase()
    .trim(),
  company: z
    .string()
    .max(100, "Company name must be less than 100 characters")
    .trim()
    .optional(),
  phone: z
    .string()
    .max(20, "Phone number must be less than 20 characters")
    .trim()
    .optional(),
  tags: z
    .array(z.string().trim().toLowerCase())
    .max(10, "Maximum 10 tags allowed")
    .optional()
    .default([]),
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .trim()
    .optional(),
});

export const updateVendorSchema = createVendorSchema.partial();

export const vendorIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid vendor ID"),
});
