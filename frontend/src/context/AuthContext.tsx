import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth as useClerkAuth, useUser as useClerkUser } from '@clerk/clerk-react';
import { getMe, setTokenProvider } from '../services/api';

export interface AppUser {
  id: string; // from MongoDB
  clerkId: string;
  name: string;
  email: string;
  xp: number;
  level: number;
  streak: number;
  learningStyle: 'visual' | 'textual' | 'example';
  mentorPersonality: 'friendly' | 'strict' | 'coach';
  dailyGoal: number;
  completedToday: number;
  confidenceScore: number;
  totalSessions: number;
  totalTimeSpent: number;
  enrolledCourses: string[];
  lastWatchedVideo?: {
    videoId: string;
    title: string;
    thumbnail: string;
    timestamp: number;
    lastAccessed: string;
  };
  learningHistory: Array<{
    videoId: string;
    title: string;
    thumbnail: string;
    timestamp: number;
    lastAccessed: string;
  }>;
}

interface AuthContextType {
  user: AppUser | null;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { getToken, isLoaded: isClerkLoaded, isSignedIn } = useClerkAuth();
  const { user: clerkUser, isLoaded: isUserLoaded } = useClerkUser();
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const token = await getToken();
      if (token) {
        const res = await getMe();
        setAppUser(res.data);
      } else {
        setAppUser(null);
      }
    } catch (err) {
      console.error("Failed to fetch app user", err);
      setAppUser(null);
    }
  };

  useEffect(() => {
    if (isClerkLoaded && isUserLoaded) {
      if (isSignedIn) {
        setTokenProvider(getToken);
        refreshUser().finally(() => setIsLoading(false));
      } else {
        setAppUser(null);
        setIsLoading(false);
      }
    }
  }, [isClerkLoaded, isUserLoaded, isSignedIn, getToken]);

  return (
    <AuthContext.Provider value={{ user: appUser, refreshUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
