"use client"

import { auth } from "@/firebase/config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ArrowLeft } from "lucide-react";
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

        if (email.toString() != email.toLowerCase()) {
            setError('Please use a valid Binusian email address (not containing uppercase).');
            return;
        }

        setIsLoading(true);

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            router.push('/login');
        }
        catch (err) {
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
        }
    }
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="w-full max-w-md h-screen flex flex-col md:h-fit items-center justify-center p-8 space-y-6 bg-card border-border rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-center text-card-foreground">Create Your Noted Account</h1>
                <form onSubmit={handleSignUp} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground">Binusian Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 mt-1 text-secondary-foreground bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
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
                            minLength={6}
                            className="w-full px-3 py-2 mt-1 text-secondary-foreground bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
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
                            {isLoading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </div>
                </form>
                <p className="text-sm text-center text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-primary/80 hover:underline">
                        Log In
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
    )
}