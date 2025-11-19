"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ArrowLeft } from 'lucide-react';

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
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="w-full max-w-md h-screen flex flex-col md:h-fit items-center justify-center p-8 space-y-6 bg-card border-border rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-center text-card-foreground">Log In to Noted</h1>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground">Binusian Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 mt-1 text-card-foreground bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="your.name@binus.ac.id"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 mt-1 text-card-foreground bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="••••••••"
                        />
                    </div>
                    {error && <p className="text-sm text-center text-destructive">{error}</p>}
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2 font-semibold text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:bg-primary/40 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Logging In...' : 'Log In'}
                        </button>
                    </div>
                </form>
                <p className="text-sm text-center text-muted-foreground">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="font-medium text-primary/80 hover:underline">
                        Sign Up
                    </Link>
                </p>

                <p className="text-sm text-center text-muted-foreground">
                    <Link href="/" className="font-medium text-primary/80 hover:border-b hover:border-primary flex justify-center items-center gap-2">
                        <ArrowLeft className="" />
                        Go back
                    </Link>
                </p>
            </div>
        </div>
    );
}

