"use client";

import { useEffect, useState, useCallback } from "react";
import { authClient } from "@/lib/auth-client";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getUser = useCallback(async () => {
    try {
      const response = await authClient.getSession();
      if (response.data) {
        setUser(response.data.user || null);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error getting user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getUser();
  }, [getUser]);

  return { user, loading, refetch: getUser };
} 