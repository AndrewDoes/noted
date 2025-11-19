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
            <h1 className="text-3xl font-bold text-foreground mb-8">My Account</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-400 h-full mx-auto">

                {/* --- Profile Details Form --- */}
                <form onSubmit={handleProfileUpdate} className="bg-card p-6 rounded-lg shadow-lg space-y-4 border border-border">
                    <h2 className="text-xl font-semibold text-card-foreground mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        Profile Details
                    </h2>

                    <div>
                        <label className="block text-sm font-medium text-muted-foreground">Email</label>
                        <div className="flex items-center w-full px-3 py-2 mt-1 text-muted-foreground bg-muted/50 border border-border rounded-md">
                            <Mail className="w-5 h-5 mr-2 text-muted-foreground" />
                            <span>{user?.email} (Cannot be changed)</span>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-muted-foreground">Full Name</label>
                        <input
                            type="text"
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="block w-full px-4 py-3 mt-1 text-secondary-foreground bg-secondary border border-border rounded-md foucs:outline-none focus:ring-2 focus:ring-ring focus:border-primary"
                        />
                    </div>

                    <div>
                        <label htmlFor="major" className="block text-sm font-medium text-muted-foreground">Major</label>
                        <select
                            value={major}
                            onChange={(e) => setMajor(e.target.value)}
                            required
                            // This logic makes the "Select" text gray, like a placeholder
                            className={`w-full px-3 py-2 mt-1 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring ${major === '' ? 'text-secondary-foreground' : 'text-accent-foreground'
                                }`}
                        >
                            <option value="" disabled>Select your major</option>
                            {binusMajors.map((maj) => (
                                <option key={maj} value={maj} className="text-foreground">
                                    {maj}
                                </option>
                            ))}
                        </select>
                    </div>

                    {profileError && <p className="text-sm text-destructive">{profileError}</p>}
                    {profileMessage && <p className="text-sm text-success">{profileMessage}</p>}

                    <button
                        type="submit"
                        className="w-full px-4 py-2 font-semibold text-primary-foreground bg-primary rounded-md hover:bg-primary/90"
                    >
                        Save Profile
                    </button>
                </form>

                {/* --- Change Password Form --- */}
                <form onSubmit={handlePasswordChange} className="bg-card p-6 rounded-lg shadow-lg space-y-4 border border-border">
                    <h2 className="text-xl font-semibold text-card-foreground mb-4 flex items-center">
                        <Lock className="w-5 h-5 mr-2" />
                        Change Password
                    </h2>

                    <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-muted-foreground">Current Password</label>
                        <input
                            type="password"
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            className="block w-full px-4 py-3 mt-1 text-secondary-foreground bg-secondary border border-border rounded-md focus:ring-ring focus:border-primary"
                        />
                    </div>

                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-muted-foreground">New Password</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                            className="block w-full px-4 py-3 mt-1 text-secondary-foreground bg-secondary border border-border rounded-md focus:ring-ring focus:border-primary"
                        />
                    </div>

                    {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                    {passwordMessage && <p className="text-sm text-success">{passwordMessage}</p>}

                    <button
                        type="submit"
                        className="w-full px-4 py-2 font-semibold text-secondary-foreground bg-secondary rounded-md transition-all duration-50 hover:bg-accent hover:border hover:scale-[1.02] hover:border-border"
                    >
                        Change Password
                    </button>
                </form>
            </div>
        </div>
    );
}