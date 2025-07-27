// src/server/routers/referrals.ts
import { z } from 'zod';
import { procedure, router, getAuthenticatedUser } from '../trpc/trpc';
import { db } from '../../db';
import { user as userTable } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { nanoid } from 'nanoid';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export const referralsRouter = router({
  // Create or get Stripe Connect account and start onboarding
  setupStripeAccount: procedure
    .input(z.object({
      returnUrl: z.string().url(),
      refreshUrl: z.string().url(),
    }))
    .mutation(async ({ input, ctx }) => {
      const user = await getAuthenticatedUser(ctx);
      
      // Get user from database
      const existingUser = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, user.id))
        .limit(1);

      if (!existingUser[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      let stripeAccountId = existingUser[0].stripeAccountId;

      // Create Stripe Express account if doesn't exist
      if (!stripeAccountId) {
        try {
          const account = await stripe.accounts.create({
            type: 'express',
            country: 'US', // Change to your target country
            email: existingUser[0].email,
            capabilities: {
              card_payments: { requested: true },
              transfers: { requested: true },
            },
            business_type: 'individual', // or 'company' based on your needs
            metadata: {
              userId: user.id,
              referralSystem: 'true'
            },
          });

          stripeAccountId = account.id;

          // Update user with Stripe account ID
          await db
            .update(userTable)
            .set({ 
              stripeAccountId: stripeAccountId,
              updatedAt: new Date()
            })
            .where(eq(userTable.id, user.id));
        } catch (error) {
          console.error('Failed to create Stripe account:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create Stripe account',
          });
        }
      }

      // Create account link for onboarding (this is the key part for bank setup)
      try {
        const accountLink = await stripe.accountLinks.create({
          account: stripeAccountId,
          return_url: input.returnUrl,
          refresh_url: input.refreshUrl,
          type: 'account_onboarding', // This triggers the full onboarding flow
        });

        return {
          accountId: stripeAccountId,
          onboardingUrl: accountLink.url, // User goes here to complete bank setup
        };
      } catch (error) {
        console.error('Failed to create account link:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create onboarding link',
        });
      }
    }),

  // Check Stripe account status
  getStripeAccountStatus: procedure
    .query(async ({ ctx }) => {
      const user = await getAuthenticatedUser(ctx);
      
      const existingUser = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, user.id))
        .limit(1);

      if (!existingUser[0]?.stripeAccountId) {
        return { 
          isConnected: false, 
          requiresOnboarding: true,
          accountId: null 
        };
      }

      try {
        // Check account status with Stripe
        const account = await stripe.accounts.retrieve(existingUser[0].stripeAccountId);
        
        const isConnected = account.details_submitted && 
                           account.charges_enabled && 
                           account.payouts_enabled;

        // Update database if connection status changed
        if (isConnected !== existingUser[0].isStripeConnected) {
          await db
            .update(userTable)
            .set({ 
              isStripeConnected: isConnected,
              updatedAt: new Date()
            })
            .where(eq(userTable.id, user.id));
        }

        return {
          isConnected,
          requiresOnboarding: !account.details_submitted,
          accountId: existingUser[0].stripeAccountId,
          account: {
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled,
            details_submitted: account.details_submitted,
            currently_due: account.requirements?.currently_due || [],
            past_due: account.requirements?.past_due || [],
          }
        };
      } catch (error) {
        console.error('Failed to retrieve Stripe account:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to check account status',
        });
      }
    }),

  // Create dashboard link for existing connected accounts
  getStripeDashboardLink: procedure
    .mutation(async ({ ctx }) => {
      const user = await getAuthenticatedUser(ctx);
      
      const existingUser = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, user.id))
        .limit(1);

      if (!existingUser[0]?.stripeAccountId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No Stripe account found. Please complete setup first.',
        });
      }

      try {
        const loginLink = await stripe.accounts.createLoginLink(
          existingUser[0].stripeAccountId
        );

        return { dashboardUrl: loginLink.url };
      } catch (error) {
        console.error('Failed to create dashboard link:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create dashboard link',
        });
      }
    }),

  // Generate referral code if user doesn't have one
  generateReferralCode: procedure
    .mutation(async ({ ctx }) => {
      const user = await getAuthenticatedUser(ctx);
      
      const existingUser = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, user.id))
        .limit(1);

      if (!existingUser[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      // Return existing code if user already has one
      if (existingUser[0].referralCode) {
        return { referralCode: existingUser[0].referralCode };
      }

      // Generate new unique referral code
      let referralCode;
      let attempts = 0;
      const maxAttempts = 10;

      do {
        referralCode = nanoid(8).toUpperCase();
        attempts++;

        // Check if code already exists
        const existingCode = await db
          .select()
          .from(userTable)
          .where(eq(userTable.referralCode, referralCode))
          .limit(1);

        if (existingCode.length === 0) {
          break;
        }

        if (attempts >= maxAttempts) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to generate unique referral code',
          });
        }
      } while (attempts < maxAttempts);

      // Update user with referral code
      await db
        .update(userTable)
        .set({ 
          referralCode,
          updatedAt: new Date()
        })
        .where(eq(userTable.id, user.id));

      return { referralCode };
    }),
});