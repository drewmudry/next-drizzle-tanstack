"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
import { LogOut, User } from "lucide-react";

interface UserProfileProps {
  user: {
    id: number;
    name: string;
    email: string;
    image?: string | null;
  };
  onSignOut?: () => void;
}

export function UserProfile({ user, onSignOut }: UserProfileProps) {
  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      // Call the callback to refresh the auth state
      if (onSignOut) {
        onSignOut();
      }
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.image || undefined} alt={user.name} />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="hidden md:block">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <Button onClick={handleSignOut} variant="ghost" size="sm">
        <LogOut className="h-4 w-4" />
        <span className="hidden md:ml-2 md:inline">Sign out</span>
      </Button>
    </div>
  );
} 