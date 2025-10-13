import { z } from 'zod';

export const PublicUserDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
});

export type PublicUserDto = z.infer<typeof PublicUserDtoSchema>;
