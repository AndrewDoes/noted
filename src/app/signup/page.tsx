"use client"

import { auth } from "@/firebase/config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignUpPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email.endsWith('@binus.ac.id')) {
            setError('Please use a valid Binusian email address (@binus.ac.id).');
            return;
        }

        setIsLoading(true);

        try {
            await createUserWithEmailAndPassword(auth, email, password);
        }
        catch (err) { // <-- The `err` variable is now `unknown`

            // Safely check the error's structure
            if (err && typeof err === 'object' && 'code' in err) {
                const errorCode = (err as { code: string }).code;
                if (errorCode === 'auth/email-already-in-use') {
                    setError('This email address is already registered.');
                } else {
                    setError('Failed to create an account. Please try again.');
                }
            } else {
                // Fallback for unexpected errors
                setError('An unexpected error occurred.');
            }
            console.error(err);
        }
        finally {
            setIsLoading(false);
            router.push('/login');
        }
    }
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-center text-white">Create Your Noted Account</h1>
                <form onSubmit={handleSignUp} className="space-y-6">
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
                            minLength={6}
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
                            {isLoading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </div>
                </form>
                <p className="text-sm text-center text-gray-400">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-indigo-400 hover:underline">
                        Log In
                    </Link>
                </p>
            </div>
        </div>
    )
}