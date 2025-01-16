import { z } from 'zod';

export const memorialSchema = z.object({
  coupleName: z.string().min(1, 'Couple name is required'),
  email: z.string().email('Invalid email address'),
  message: z.string().optional(),
  youtubeUrl: z.string().url().optional(),
  selectedPlan: z.enum(['basic', 'premium']),
  startDate: z.date().optional(),
  startTime: z.string().optional(),
});

export type MemorialFormValues = z.infer<typeof memorialSchema>;