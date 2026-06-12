import { z } from "zod";

export const createProductSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().min(10).max(2000),
  price: z.number().positive(),
  discountPercentage: z.number().min(0).max(100).optional().default(0),
  category: z.string().min(1),
  brand: z.string().min(1),
  model: z.string().min(1),
  images: z.array(z.string()).optional().default([]),
  stock: z.number().int().nonnegative().optional().default(0),
  specifications: z.record(z.string(), z.string()).optional().default({}),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
