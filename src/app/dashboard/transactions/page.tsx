"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '@/firebase/config';
import { collection, getDocs, query, where, orderBy, doc, getDoc, Timestamp, Query } from 'firebase/firestore';
import { Note } from '../../types/Note';
import { History, ShoppingCart } from 'lucide-react';

// We need a new type for our combined data
interface Transaction extends Note {
    purchaseId: string;
    purchasedAt: Timestamp;
}

export default function TransactionsPage() {
    const { user } = useAuth();

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return; // Wait for user

        const fetchTransactions = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const purchaseRef = collection(db, 'purchases');
                const q = query(
                    purchaseRef,
                    where("userId", "==", user.uid),
                    orderBy("purchasedAt", "desc")
                );
                const purchaseSnapshot = await getDocs(q);

                if (purchaseSnapshot.empty) {
                    setTransactions([]);
                    setIsLoading(false);
                    return;
                }

                const transactionsList = await Promise.all(
                    purchaseSnapshot.docs.map(async (purchaseDoc) => {
                        const purchaseData = purchaseDoc.data();
                        const noteRef = doc(db, 'notes', purchaseData.noteId);
                        const noteSnap = await getDoc(noteRef);

                        if (noteSnap.exists()) {
                            return {
                                ...noteSnap.data(),
                                id: noteSnap.id,
                                purchaseId: purchaseDoc.id,
                                purchasedAt: purchaseData.purchasedAt,
                            } as Transaction;
                        }
                        else return null;
                    }));
                setTransactions(transactionsList.filter(t => t !== null) as Transaction[]);

            } catch (err) {
                console.error("Error fetching transactions: ", err);
                setError("Failed to load transaction history.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactions();
    }, [user]);

    // Helper to format the timestamp
    const formatDate = (timestamp: Timestamp) => {
        if (!timestamp) return 'N/A'; // Add a check for safety
        return timestamp.toDate().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    if (isLoading) {
        return <div className="p-8 text-center text-card-foreground">Loading your transactions...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-destructive">{error}</div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-foreground mb-8">Transaction History</h1>

            {/* --- YOUR CODE GOES HERE (JSX) --- */}
            {/*
         1. Check if 'transactions.length' is 0.
         2. If it is 0:
            - Show the "empty state" div (I've provided this below).
         3. If it is > 0:
            - Show the transaction table (I've provided this below).
      */}

            {transactions.length === 0 ? (
                // This is the "empty state"
                <div className="flex flex-col items-center justify-center text-center text-card-foreground border-2 border-dashed border-border rounded-lg p-12">
                    <ShoppingCart className="w-16 h-16 mb-4" />
                    <h2 className="text-xl font-semibold text-foreground">You haven&apos;t purchased any notes yet.</h2>
                    <p className="mt-2">Your purchased notes will appear here.</p>
                </div>
            ) : (
                // This is the transaction table
                <div className="bg-card rounded-lg shadow-lg overflow-scroll lg:overflow-hidden border border-border">
                    <table className="w-full min-w-full divide-y divide-border">
                        <thead className="bg-secondary/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-card-foreground uppercase tracking-wider">Note Title</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-card-foreground uppercase tracking-wider">Course</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-card-foreground uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-card-foreground uppercase tracking-wider">Price</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-borders">
                            {transactions.map((tx) => (
                                <tr key={tx.purchaseId}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{tx.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">{tx.course}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">{formatDate(tx.purchasedAt)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-primary/90">{formatCurrency(tx.price)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* --- END OF YOUR CODE --- */}

        </div>
    );
}