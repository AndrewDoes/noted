"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { db } from '@/firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

const binusMajors = [
  "Accounting",
  "Architecture",
  "Business Creation",
  "Business Management",
  "Civil Engineering",
  "Computer Science",
  "Cyber Security",
  "Film",
  "Finance",
  "Food Technology",
  "Game Application and Technology",
  "Graphic Design",
  "Industrial Engineering",
  "Information Systems",
  "Interior Design",
  "International Business Management",
  "International Relations",
  "Marketing Communication",
  "Mass Communication",
  "Psychology",
  "Visual Communication Design",
  "Other", 
];

export default function CreateProfilePage() {
  // Destructure refreshProfile from useAuth
  const { user, userProfile, isLoading, refreshProfile } = useAuth(); 
  const router = useRouter();
  
  const [fullName, setFullName] = useState('');
  const [major, setMajor] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (userProfile) {
        router.push('/dashboard');
      }
    }
  }, [user, userProfile, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("User not found. Please log in again.");
      return;
    }
    if (!fullName || !major) {
      setError("Please fill in all fields.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // 1. Update their auth profile
      await updateProfile(user, {
        displayName: fullName,
      });

      // 2. Create their user document in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: fullName,
        major: major,
        createdAt: new Date(),
      });
      
      await refreshProfile();
      router.push('/dashboard');

    } catch (err) {
      console.error("Error creating profile: ", err);
      setError("Failed to create profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !user || userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md h-screen flex flex-col md:h-fit items-center justify-center p-8 space-y-6 bg-card border-border rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-card-foreground">Welcome to Noted!</h1>
        <p className="text-center text-muted-foreground">Let&apos;s set up your profile.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-muted-foreground">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-secondary-foreground bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="e.g., John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground">Major</label>
            <select
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              required
              className={`w-full px-3 py-2 mt-1 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring ${
                major === '' ? 'text-muted-foreground' : 'text-secondary-foreground'
              }`}
            >
              <option value="" disabled>Select your major</option>
              {binusMajors.map((maj) => (
                <option key={maj} value={maj} className="text-secondary-foreground">
                  {maj}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-center text-destructive">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2 font-semibold text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save and Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}