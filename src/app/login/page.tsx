"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Redirect to the dashboard on successful login
            router.push('/dashboard');
        } catch (err) {
            if (err && typeof err === 'object' && 'code' in err) {
                const errorCode = (err as { code: string }).code;

                if (
                    errorCode === 'auth/user-not-found' ||
                    errorCode === 'auth/wrong-password' ||
                    errorCode === 'auth/invalid-credential'
                ) {
                    setError('Invalid email or password. Please try again.');
                } else {
                    setError('Failed to log in. Please try again later.');
                }
            } else {
                // Handle cases where the error isn't the shape we expect
                setError('An unexpected error occurred.');
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-center text-white">Log In to Noted</h1>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Binusian Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="your.name@binus.ac.id"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="••••••••"
                        />
                    </div>
                    {error && <p className="text-sm text-center text-red-500">{error}</p>}
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Logging In...' : 'Log In'}
                        </button>
                    </div>
                </form>
                <p className="text-sm text-center text-gray-400">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="font-medium text-indigo-400 hover:underline">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}

