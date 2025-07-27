import { z } from 'zod';
import { procedure, router, getAuthenticatedUser } from '../trpc/trpc';
import { db } from '../../db';
import { referralsRouter } from './referrals';
import { referrersRouter } from './referrers';

export const appRouter = router({
  // routers
  referrals: referralsRouter,
  referrers: referrersRouter,

// procedures
  hello: procedure
    .query(() => {
      return {
        greeting: `Healthy`,
      };
    }),

});

// Export type definition of API
export type AppRouter = typeof appRouter; 