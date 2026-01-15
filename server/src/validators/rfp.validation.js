import { z } from "zod";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1, "Message content is required"),
});

export const sendMessageSchema = z.object({
  message: z.string().min(1, "Message is required").max(2000, "Message too long"),
  rfpId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid RFP ID").optional().nullable(),
});

export const updateRFPSchema = z.object({
  title: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  requirements: z.array(z.string()).optional(),
  quantity: z.number().positive().optional(),
  budget: z
    .object({
      min: z.number().min(0).optional(),
      max: z.number().min(0).optional(),
      currency: z.string().default("USD"),
    })
    .optional(),
  deadline: z.string().datetime().optional(),
  specs: z.record(z.any()).optional(),
  vendors: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
});

export const rfpIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid RFP ID"),
});
