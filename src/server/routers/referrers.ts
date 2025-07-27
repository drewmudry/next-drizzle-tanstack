import { z } from 'zod';
import { protectedProcedure, router } from '../trpc/trpc';
import { db } from '../../db';
import { user as userTable } from '../../db/schema';
import { stripe, createConnectAccount, createConnectAccountLink } from '../../lib/stripe';
import { eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const referrersRouter = router({
  // Start Stripe Connect onboarding
  startOnboarding: protectedProcedure
    .mutation(async ({ ctx }) => {
      const authenticatedUser = ctx.user;
      
      // Check if user is already a referrer
      const existingUser = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, authenticatedUser.id))
        .limit(1);

      if (!existingUser[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      if (existingUser[0].isStripeConnected) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User is already connected to Stripe',
        });
      }

      try {
        // Create Stripe Connect account
        const account = await createConnectAccount(authenticatedUser.email);
        
        // Update user with Stripe account ID
        await db
          .update(userTable)
          .set({ 
            stripeAccountId: account.id,
            updatedAt: new Date()
          })
          .where(eq(userTable.id, authenticatedUser.id));

        // Create account link for onboarding
        const accountLink = await createConnectAccountLink(
          account.id,
          `${process.env.BETTER_AUTH_URL}/referrer/onboarding/refresh`,
          `${process.env.BETTER_AUTH_URL}/referrer/onboarding/complete`
        );

        return {
          accountId: account.id,
          onboardingUrl: accountLink.url,
        };
      } catch (error) {
        console.error('Stripe Connect onboarding error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to start Stripe Connect onboarding',
        });
      }
    }),

  // Check onboarding status
  getOnboardingStatus: protectedProcedure
    .query(async ({ ctx }) => {
      const authenticatedUser = ctx.user;
      
      const existingUser = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, authenticatedUser.id))
        .limit(1);

      if (!existingUser[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      if (!existingUser[0].stripeAccountId) {
        return {
          isConnected: false,
          needsOnboarding: true,
          accountId: null,
        };
      }

      try {
        // Check Stripe account status
        const account = await stripe.accounts.retrieve(existingUser[0].stripeAccountId);
        
        const isConnected = account.charges_enabled && account.payouts_enabled;
        
        // Update user status if changed
        if (isConnected !== existingUser[0].isStripeConnected) {
          await db
            .update(userTable)
            .set({ 
              isStripeConnected: isConnected,
              updatedAt: new Date()
            })
            .where(eq(userTable.id, authenticatedUser.id));
        }

        return {
          isConnected,
          needsOnboarding: !isConnected,
          accountId: existingUser[0].stripeAccountId,
          requirements: account.requirements,
        };
      } catch (error) {
        console.error('Error checking Stripe account status:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to check onboarding status',
        });
      }
    }),

  // Set referral code
  setReferralCode: protectedProcedure
    .input(z.object({
      referralCode: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_-]+$/),
    }))
    .mutation(async ({ ctx, input }) => {
      const authenticatedUser = ctx.user;
      
      // Check if user is connected to Stripe
      const existingUser = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, authenticatedUser.id))
        .limit(1);

      if (!existingUser[0]?.isStripeConnected) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You must complete Stripe Connect onboarding before setting a referral code',
        });
      }

      // Check if referral code is already taken
      const existingReferralCode = await db
        .select()
        .from(userTable)
        .where(eq(userTable.referralCode, input.referralCode))
        .limit(1);

      if (existingReferralCode.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Referral code is already taken',
        });
      }

      // Update user with referral code
      await db
        .update(userTable)
        .set({ 
          referralCode: input.referralCode,
          updatedAt: new Date()
        })
        .where(eq(userTable.id, authenticatedUser.id));

      return {
        success: true,
        referralCode: input.referralCode,
      };
    }),

  // Get referrer profile
  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      const authenticatedUser = ctx.user;
      
      const existingUser = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, authenticatedUser.id))
        .limit(1);

      if (!existingUser[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      return {
        id: existingUser[0].id,
        name: existingUser[0].name,
        email: existingUser[0].email,
        referralCode: existingUser[0].referralCode,
        isStripeConnected: existingUser[0].isStripeConnected,
        stripeAccountId: existingUser[0].stripeAccountId,
      };
    }),
}); 