"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db, auth } from '@/firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { User, Lock, Mail } from 'lucide-react';
import { FirebaseError } from 'firebase/app';

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

export default function AccountPage() {
    const { user, userProfile } = useAuth();

    // State for profile information
    const [fullName, setFullName] = useState('');
    const [major, setMajor] = useState('');

    // State for password change
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // State for feedback messages
    const [profileMessage, setProfileMessage] = useState<string | null>(null);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    // When the component loads, fill the form with the user's current data
    useEffect(() => {
        if (userProfile) {
            setFullName(userProfile.displayName || '');
            setMajor(userProfile.major || '');
        }
    }, [userProfile]);

    // Handle profile update (Name and Major)
    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !userProfile) return;

        setProfileMessage(null);
        setProfileError(null);

        try {
            // 1. Update the Firestore document
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
                displayName: fullName,
                major: major,
            });

            // 2. Update the Firebase Auth profile
            await updateProfile(user, {
                displayName: fullName,
            });

            setProfileMessage("Profile updated successfully!");
            // We might need to refresh the auth context here, but for now, this works
        } catch (err) {
            console.error("Error updating profile: ", err);
            setProfileError("Failed to update profile. Please try again.");
        }
    };

    // Handle password change
    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !user.email) return;

        setPasswordMessage(null);
        setPasswordError(null);

        try {
            // 1. Re-authenticate the user
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);

            // 2. Update the password
            await updatePassword(user, newPassword);

            setPasswordMessage("Password changed successfully!");
            setCurrentPassword('');
            setNewPassword('');
        } catch (err: unknown) {
            console.error("Error changing password: ", err);
            if (err instanceof FirebaseError) {
                // Now we can safely access err.code
                if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                    setPasswordError("Incorrect current password.");
                } else if (err.code === 'auth/weak-password') {
                    setPasswordError("New password must be at least 6 characters.");
                } else {
                    setPasswordError("Failed to change password. Please try again.");
                }
            } else {
                // Handle other, non-Firebase errors
                setPasswordError("An unexpected error occurred.");
            }
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-white mb-8">My Account</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-400 h-full mx-auto">

                {/* --- Profile Details Form --- */}
                <form onSubmit={handleProfileUpdate} className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-4">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        Profile Details
                    </h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-300">Email</label>
                        <div className="flex items-center w-full px-3 py-2 mt-1 text-gray-400 bg-gray-700/50 border border-gray-600 rounded-md">
                            <Mail className="w-5 h-5 mr-2 text-gray-500" />
                            <span>{user?.email} (Cannot be changed)</span>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-300">Full Name</label>
                        <input
                            type="text"
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="block w-full px-4 py-3 mt-1 text-white bg-gray-700 border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="major" className="block text-sm font-medium text-gray-300">Major</label>
                        <select
                            value={major}
                            onChange={(e) => setMajor(e.target.value)}
                            required
                            // This logic makes the "Select" text gray, like a placeholder
                            className={`w-full px-3 py-2 mt-1 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${major === '' ? 'text-gray-400' : 'text-white'
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

                    {profileError && <p className="text-sm text-red-500">{profileError}</p>}
                    {profileMessage && <p className="text-sm text-green-500">{profileMessage}</p>}

                    <button
                        type="submit"
                        className="w-full px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                    >
                        Save Profile
                    </button>
                </form>

                {/* --- Change Password Form --- */}
                <form onSubmit={handlePasswordChange} className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-4">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                        <Lock className="w-5 h-5 mr-2" />
                        Change Password
                    </h2>

                    <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300">Current Password</label>
                        <input
                            type="password"
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            className="block w-full px-4 py-3 mt-1 text-white bg-gray-700 border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300">New Password</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                            className="block w-full px-4 py-3 mt-1 text-white bg-gray-700 border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
                    {passwordMessage && <p className="text-sm text-green-500">{passwordMessage}</p>}

                    <button
                        type="submit"
                        className="w-full px-4 py-2 font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-500"
                    >
                        Change Password
                    </button>
                </form>
            </div>
        </div>
    );
}