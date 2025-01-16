import { z } from "zod";

export const memorialSchema = z.object({
  coupleName: z.string()
    .min(3, "Couple name must be at least 3 characters")
    .max(50, "Couple name must be less than 50 characters")
    .refine(val => !val.includes('emoji'), "Emojis are not allowed"),
  relationshipStart: z.date(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  message: z.string().max(500, "Message must be less than 500 characters").optional(),
  selectedPlan: z.enum(["basic", "premium"]),
  photos: z.array(z.instanceof(File)),
  youtubeUrl: z.string().url().optional(),
});

export type MemorialFormValues = z.infer<typeof memorialSchema>;