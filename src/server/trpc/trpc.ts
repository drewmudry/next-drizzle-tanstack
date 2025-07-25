import { initTRPC, TRPCError } from '@trpc/server';
import { auth } from '@/lib/auth';

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.create();

// Base router and procedure helpers
export const router = t.router;
export const procedure = t.procedure;

// Helper function to get authenticated user (use this in your procedures)
export const getAuthenticatedUser = async (headers: any) => {
  const session = await auth.api.getSession({ headers });
  if (!session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  return session.user;
}; 