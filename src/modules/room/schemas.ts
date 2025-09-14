import { z } from 'zod';

export const createRoomSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  category: z.string().min(3, 'Category must be at least 3 characters long'),
  subject: z.string().min(3, 'Subject must be at least 3 characters long'),
  description: z.string().min(10, 'Description must be at least 10 characters long'),
});