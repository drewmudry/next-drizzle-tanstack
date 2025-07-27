'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SignInButton } from '@/components/auth/sign-in-button';
import { UserProfile } from '@/components/auth/user-profile';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const { user, loading, refetch } = useAuth();

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">SaaS Referral System</h1>
        {user ? <UserProfile user={user} onSignOut={refetch} /> : <SignInButton />}
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>{user ? '🔒 Protected Section' : '🔒 Start Earning With Referrals'}</CardTitle>
          <CardDescription>
            {user 
              ? 'This content is only visible when you\'re signed in'
              : 'Sign in to access the referral system and start earning commissions'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Welcome back, {user.name}! 👋
              </h3>
              <p className="text-green-700 mb-4">
                You're signed in as {user.email}. Start referring friends to earn commissions!
              </p>
              <div className="flex gap-2">
                <Link href="/referrer">
                  <Button>
                    Go to Referrer Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <h3 className="text-xl font-semibold mb-2">Join Our Referral Program</h3>
              <p className="text-gray-600 mb-4">
                Earn 10% commission on every sale from users you refer. Set up takes less than 5 minutes!
              </p>
              <SignInButton />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}