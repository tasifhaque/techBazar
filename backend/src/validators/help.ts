import { z } from "zod";

export const contactMessageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(1, "Message is required"),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
