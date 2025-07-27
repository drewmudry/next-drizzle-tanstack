import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-06-30.basil',
});

export function createConnectAccountLink(accountId: string, refreshUrl: string, returnUrl: string) {
  return stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  });
}

export function createConnectAccount(email: string) {
  return stripe.accounts.create({
    type: 'express',
    email,
  });
} 