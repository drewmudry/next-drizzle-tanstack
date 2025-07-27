'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { trpc } from '@/components/trpc-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, ExternalLink, CreditCard } from 'lucide-react';

export default function ReferrerDashboard() {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [isSettingCode, setIsSettingCode] = useState(false);

  // Get referrer profile and onboarding status
  const { data: profile, isLoading: profileLoading } = trpc.referrers.getProfile.useQuery();
  const { data: onboardingStatus, isLoading: statusLoading } = trpc.referrers.getOnboardingStatus.useQuery();

  // Mutations
  const startOnboardingMutation = trpc.referrers.startOnboarding.useMutation();
  const setReferralCodeMutation = trpc.referrers.setReferralCode.useMutation();

  const isLoading = profileLoading || statusLoading;

  const handleStartOnboarding = async () => {
    try {
      const result = await startOnboardingMutation.mutateAsync();
      // Redirect to Stripe onboarding
      window.location.href = result.onboardingUrl;
    } catch (error) {
      console.error('Failed to start onboarding:', error);
    }
  };

  const handleSetReferralCode = async () => {
    if (!referralCode.trim()) return;
    
    setIsSettingCode(true);
    try {
      await setReferralCodeMutation.mutateAsync({ referralCode: referralCode.trim() });
      setReferralCode('');
      // Refetch profile to get updated referral code
      window.location.reload();
    } catch (error) {
      console.error('Failed to set referral code:', error);
    } finally {
      setIsSettingCode(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please sign in to access the referrer dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Referrer Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {profile?.name}! Complete your setup to start earning.
          </p>
        </div>

        {/* Stripe Connect Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Setup
            </CardTitle>
            <CardDescription>
              Connect your bank account to receive referral payments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {onboardingStatus?.isConnected ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Your payment account is connected and ready to receive payments!
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    You need to complete Stripe Connect onboarding to receive referral payments.
                  </AlertDescription>
                </Alert>
                <Button 
                  onClick={handleStartOnboarding}
                  disabled={startOnboardingMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  {startOnboardingMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Start Payment Setup
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Referral Code Setup */}
        <Card>
          <CardHeader>
            <CardTitle>Referral Code</CardTitle>
            <CardDescription>
              Set a custom referral code to share with potential customers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile?.referralCode ? (
              <div className="space-y-2">
                <Label>Your Referral Code</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    value={profile.referralCode} 
                    readOnly 
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(profile.referralCode!)}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Share this code with potential customers: 
                  <span className="font-mono ml-1">
                    {typeof window !== 'undefined' ? `${window.location.origin}?ref=${profile.referralCode}` : ''}
                  </span>
                </p>
              </div>
            ) : onboardingStatus?.isConnected ? (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    Set a referral code to start sharing your referral link.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Label htmlFor="referralCode">Referral Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="referralCode"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      placeholder="Enter your referral code"
                      className="flex-1"
                      maxLength={20}
                    />
                    <Button 
                      onClick={handleSetReferralCode}
                      disabled={!referralCode.trim() || isSettingCode}
                    >
                      {isSettingCode ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Setting...
                        </>
                      ) : (
                        'Set Code'
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Use 3-20 characters, letters, numbers, hyphens, and underscores only.
                  </p>
                </div>
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  Complete payment setup first to set your referral code.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Error Display */}
        {(startOnboardingMutation.error || setReferralCodeMutation.error) && (
          <Alert variant="destructive">
            <AlertDescription>
              {startOnboardingMutation.error?.message || setReferralCodeMutation.error?.message}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
} 