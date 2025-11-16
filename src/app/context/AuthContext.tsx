"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth, db } from '@/firebase/config';
import { doc, getDoc, DocumentData } from 'firebase/firestore'; // Import firestore functions

// Define the shape of the user profile data from Firestore
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  major: string;
  createdAt: Date;
}

// Define the shape of the context's value
interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null; // Add userProfile state
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // Add profile state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is logged in
        setUser(user);
        // Now, try to fetch their profile from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          // Profile exists, set it
          setUserProfile(userDocSnap.data() as UserProfile);
        } else {
          // User is authenticated but has no profile document
          setUserProfile(null); 
        }
      } else {
        // User is logged out
        setUser(null);
        setUserProfile(null);
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Define the logout function
  const logout = async () => {
    try {
      await signOut(auth);
      // User and profile will be set to null by the onAuthStateChanged listener
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const value = { user, userProfile, isLoading, logout };

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