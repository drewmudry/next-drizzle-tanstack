import { z } from 'zod';
import { procedure, router, getAuthenticatedUser } from '../trpc/trpc';
import { db } from '../../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const appRouter = router({
  // Public procedures (no authentication required)
  hello: procedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query((opts) => {
      return {
        greeting: `Hello ${opts.input.text}!`,
      };
    }),

  getUsers: procedure.query(async () => {
    return await db.select().from(users);
  }),

  getUserById: procedure
    .input(z.object({ id: z.number() }))
    .query(async (opts) => {
      const result = await db.select().from(users).where(eq(users.id, opts.input.id));
      return result[0];
    }),

  createUser: procedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().min(1),
      }),
    )
    .mutation(async (opts) => {
      const result = await db.insert(users).values({
        email: opts.input.email,
        name: opts.input.name,
      }).returning();
      return result[0];
    }),

  // Protected procedures (authentication required)
  getMyProfile: procedure
    .query(async () => {
      // This is a placeholder - in a real app, you'd get headers from the request
      // For now, this will throw an error since we don't have headers
      const user = await getAuthenticatedUser({});
      return user;
    }),

  createUserProtected: procedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().min(1),
      }),
    )
    .mutation(async (opts) => {
      // This is a placeholder - in a real app, you'd get headers from the request
      const user = await getAuthenticatedUser({});
      
      // Now you can use the authenticated user info
      console.log('Authenticated user:', user.email);
      
      const result = await db.insert(users).values({
        email: opts.input.email,
        name: opts.input.name,
      }).returning();
      return result[0];
    }),
});

// Export type definition of API
export type AppRouter = typeof appRouter; 