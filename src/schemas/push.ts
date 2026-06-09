import { z } from 'zod';

/** POST /push/register body. */
export const registerDeviceInputSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(['ios', 'android']),
});
export type RegisterDeviceInput = z.infer<typeof registerDeviceInputSchema>;
