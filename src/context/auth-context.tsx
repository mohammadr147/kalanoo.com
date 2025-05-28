
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { UserProfile } from '@/types'; // Assuming UserProfile type is defined in types/index.ts
// TODO: Replace with actual server action to get current user session
// import { getCurrentUserSession } from '@/app/auth-actions';

interface AuthContextType {
  user: UserProfile | null; // Use UserProfile type for custom auth
  loading: boolean;
  isUserProfileComplete: boolean;
  checkAuthState: () => Promise<void>; // Function to re-check auth state
}

// Placeholder for UserProfile until fetched
const initialUser: UserProfile | null = null;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(initialUser);
  const [loading, setLoading] = useState(true); // Start loading until session is checked
  const [isUserProfileComplete, setIsUserProfileComplete] = useState(false);

  const checkAuthState = useCallback(async () => {
    setLoading(true);
    try {
      // --- TODO: Replace with actual Server Action call ---
      // This action would typically verify the session cookie/token
      // and return the user's profile data from MySQL if valid.
      // const session = await getCurrentUserSession(); // Example server action call

      // --- Placeholder Logic ---
      // Simulating fetching user data based on a hypothetical session check
      // In a real app, this would depend on the server action's response
      const session = null; // Replace with actual session check result
      // --- End Placeholder ---


      if (session && session.user) {
        setUser(session.user);
        // Check completeness based on MySQL user data
        const complete = !!(
          session.user.first_name &&
          session.user.last_name &&
          session.user.address?.full_address &&
          session.user.address?.province &&
          session.user.address?.city &&
          session.user.address?.postal_code &&
          session.user.birth_date
        );
        setIsUserProfileComplete(complete);
         console.log("AuthContext: User session found, profile complete:", complete);
      } else {
        setUser(null);
        setIsUserProfileComplete(false);
         console.log("AuthContext: No active user session found.");
      }
    } catch (error) {
      console.error("AuthContext: Error checking auth state:", error);
      setUser(null);
      setIsUserProfileComplete(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthState(); // Check auth state on initial load
  }, [checkAuthState]);

  const value = { user, loading, isUserProfileComplete, checkAuthState };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
