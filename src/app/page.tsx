'use client';

import { trpc } from '@/components/trpc-provider';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SignInButton } from '@/components/auth/sign-in-button';
import { UserProfile } from '@/components/auth/user-profile';
import { useAuth } from '@/hooks/use-auth';

export default function Home() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const { user, loading, refetch } = useAuth();

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      {/* Header with Authentication */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">tRPC + TanStack Query + Drizzle ORM Demo</h1>
        <div>
          {user ? (
            <UserProfile user={user} onSignOut={refetch} />
          ) : (
            <SignInButton />
          )}
        </div>
      </div>

      {/* PROTECTED SECTION - Only Visible When Signed In */}
      {user ? (
        <Card>
          <CardHeader>
            <CardTitle>🔒 Protected Section</CardTitle>
            <CardDescription>This content is only visible when you're signed in</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Welcome Message */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Welcome, {user.name}! 👋
              </h3>
              <p className="text-green-700">
                You're signed in as {user.email}. This section contains protected content.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>🔒 Protected Section</CardTitle>
            <CardDescription>Sign in to access this content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                This section contains protected content that requires authentication.
              </p>
              <SignInButton />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
