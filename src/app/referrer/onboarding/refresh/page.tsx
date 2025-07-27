'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Loader2 } from 'lucide-react';
import { trpc } from '@/components/trpc-provider';

export default function OnboardingRefresh() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startOnboardingMutation = trpc.referrers.startOnboarding.useMutation();

  const handleRefreshOnboarding = async () => {
    setIsRefreshing(true);
    try {
      const result = await startOnboardingMutation.mutateAsync();
      // Redirect to Stripe onboarding
      window.location.href = result.onboardingUrl;
    } catch (error) {
      console.error('Failed to refresh onboarding:', error);
      setIsRefreshing(false);
    }
  };

  const handleBackToDashboard = () => {
    router.push('/referrer');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Onboarding Refresh</CardTitle>
          <CardDescription>
            Your onboarding session has expired. Please refresh to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <RefreshCw className="h-4 w-4" />
            <AlertDescription>
              Click the button below to refresh your Stripe Connect onboarding session.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <Button 
              onClick={handleRefreshOnboarding}
              disabled={isRefreshing}
              className="w-full"
            >
              {isRefreshing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Onboarding
                </>
              )}
            </Button>
            
            <Button 
              onClick={handleBackToDashboard}
              variant="outline"
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </div>

          {startOnboardingMutation.error && (
            <Alert variant="destructive">
              <AlertDescription>
                {startOnboardingMutation.error.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 