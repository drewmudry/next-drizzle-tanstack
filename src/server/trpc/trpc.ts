import { initTRPC, TRPCError } from '@trpc/server';
import { auth } from '@/lib/auth';

// Define the context type
interface CreateContextOptions {
  req: Request;
}

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<CreateContextOptions>().create();

// Base router and procedure helpers
export const router = t.router;
export const procedure = t.procedure;

// Protected procedure that requires authentication
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const user = await getAuthenticatedUser(ctx);
  return next({
    ctx: {
      ...ctx,
      user,
    },
  });
});

// Helper function to get authenticated user (use this in your procedures)
export const getAuthenticatedUser = async (ctx: { req: Request }) => {
  const session = await auth.api.getSession({ headers: ctx.req.headers });
  if (!session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  return session.user;
}; 