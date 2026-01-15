import { z } from "zod";

export const submitProposalSchema = z.object({
  vendorEmail: z.string().email("Valid email required"),
  vendorName: z.string().min(1, "Vendor name required").max(200),
  price: z.object({
    amount: z.number().positive("Price must be positive"),
    currency: z.string().optional().default("USD"),
  }),
  timeline: z.string().min(1, "Timeline required").max(100),
  deliveryDate: z.string().optional().nullable(),
  terms: z.string().max(2000).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const updateProposalSchema = z.object({
  status: z.enum(["submitted", "reviewed", "shortlisted", "rejected", "awarded"]).optional(),
  score: z.number().min(0).max(10).optional(),
  reviewNotes: z.string().max(1000).optional(),
});

export const proposalIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Proposal ID"),
});

export const rfpIdSchema = z.object({
  rfpId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid RFP ID"),
});

