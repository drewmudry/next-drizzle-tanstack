"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Chrome } from "lucide-react";

export function SignInButton() {
  const handleGoogleSignIn = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
      });
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  return (
    <Button onClick={handleGoogleSignIn} variant="outline" size="lg">
      <Chrome className="mr-2 h-4 w-4" />
      Sign in with Google
    </Button>
  );
} 