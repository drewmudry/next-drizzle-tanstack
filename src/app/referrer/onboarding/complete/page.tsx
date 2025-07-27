'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Loader2 } from 'lucide-react';
import { trpc } from '@/components/trpc-provider';

export default function OnboardingComplete() {
  const router = useRouter();
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [message, setMessage] = useState('');

  const { data: onboardingStatus, isLoading } = trpc.referrers.getOnboardingStatus.useQuery();

  useEffect(() => {
    if (!isLoading && onboardingStatus) {
      if (onboardingStatus.isConnected) {
        setStatus('success');
        setMessage('Your payment account has been successfully connected!');
      } else {
        setStatus('error');
        setMessage('Onboarding is not yet complete. Please try again or contact support.');
      }
    }
  }, [onboardingStatus, isLoading]);

  const handleContinue = () => {
    router.push('/referrer');
  };

  const handleRetry = () => {
    router.push('/referrer');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Onboarding Complete</CardTitle>
          <CardDescription>
            We're checking your payment setup status...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading || status === 'checking' ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Checking status...</span>
            </div>
          ) : status === 'success' ? (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
              <Button onClick={handleContinue} className="w-full">
                Continue to Dashboard
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
              <Button onClick={handleRetry} variant="outline" className="w-full">
                Back to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 