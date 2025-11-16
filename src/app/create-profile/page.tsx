"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { db } from '@/firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

// A list of common Binus majors for the dropdown
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
  "Other", // Always good to have an "Other" option
];

export default function CreateProfilePage() {
  const { user, userProfile, isLoading } = useAuth();
  const router = useRouter();
  
  const [fullName, setFullName] = useState('');
  const [major, setMajor] = useState(''); // The state remains the same
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // This effect protects the page
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not logged in, send to login
        router.push('/login');
      } else if (userProfile) {
        // Already has a profile, send to dashboard
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
    // This validation still works perfectly for the dropdown
    if (!fullName || !major) {
      setError("Please fill in all fields.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // 1. Update their auth profile (this stores the name in Firebase Auth)
      await updateProfile(user, {
        displayName: fullName,
      });

      // 2. Create their user document in Firestore
      // We use the user's UID as the document ID for a direct link
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: fullName,
        major: major,
        createdAt: new Date(),
      });
      
      // 3. Redirect to the dashboard
      router.push('/dashboard');

    } catch (err) {
      console.error("Error creating profile: ", err);
      setError("Failed to create profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading screen while checking auth
  if (isLoading || !user || userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  // Once loaded, show the profile form
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-white">Welcome to Noted!</h1>
        <p className="text-center text-gray-400">Let's set up your profile.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Nicholas Andrew Sutiono"
            />
          </div>

          {/* --- THIS IS THE CHANGED SECTION --- */}
          <div>
            <label className="block text-sm font-medium text-gray-300">Major</label>
            <select
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              required
              // This logic makes the "Select" text gray, like a placeholder
              className={`w-full px-3 py-2 mt-1 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                major === '' ? 'text-gray-400' : 'text-white'
              }`}
            >
              <option value="" disabled>Select your major</option>
              {binusMajors.map((maj) => (
                <option key={maj} value={maj} className="text-white">
                  {maj}
                </option>
              ))}
            </select>
          </div>
          {/* --- END OF CHANGED SECTION --- */}

          {error && <p className="text-sm text-center text-red-500">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400/50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save and Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}