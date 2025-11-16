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

                // --- YOUR CODE GOES HERE ---
                //
                // 1. Fetch all of the user's purchase records, ordered by date
                //    - Create a reference to the 'purchases' collection
                //    - Create a query 'q' to find all purchases
                //      - 'where("userId", "==", user.uid)'
                //      - 'orderBy("purchasedAt", "desc")'
                //    - Get the snapshot: const purchaseSnapshot = await getDocs(q);
                //
                // 2. Check if the snapshot is empty (purchaseSnapshot.empty)
                //    - If it is, setTransactions([]) and setIsLoading(false), then return.
                //
                // 3. Loop through each purchase and fetch the related note details
                //    - This is the tricky part. Use 'Promise.all' to fetch all notes in parallel.
                //    - const transactionsList = await Promise.all(
                //        purchaseSnapshot.docs.map(async (purchaseDoc) => {
                //          const purchaseData = purchaseDoc.data();
                //          // Create a ref to the specific note
                //          const noteRef = doc(db, 'notes', purchaseData.noteId);
                //          const noteSnap = await getDoc(noteRef);
                //
                //          if (noteSnap.exists()) {
                //            // 4. Combine the purchase data and note data
                //            return {
                //              ...noteSnap.data(),
                //              id: noteSnap.id,
                //              purchaseId: purchaseDoc.id,
                //              purchasedAt: purchaseData.purchasedAt,
                //            } as Transaction;
                //          } else {
                //            return null; // Handle cases where a note might have been deleted
                //          }
                //        })
                //      );
                //
                // 5. Filter out any nulls (deleted notes) and set the state
                //    - setTransactions(transactionsList.filter(t => t !== null) as Transaction[]);
                //
                // --- END OF YOUR CODE ---

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
        return <div className="p-8 text-center text-gray-400">Loading your transactions...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">{error}</div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-white mb-8">Transaction History</h1>

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
                <div className="flex flex-col items-center justify-center text-center text-gray-400 border-2 border-dashed border-gray-700 rounded-lg p-12">
                    <ShoppingCart className="w-16 h-16 mb-4" />
                    <h2 className="text-xl font-semibold text-white">You haven&apost purchased any notes yet.</h2>
                    <p className="mt-2">Your purchased notes will appear here.</p>
                </div>
            ) : (
                // This is the transaction table
                <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <table className="w-full min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Note Title</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Course</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {transactions.map((tx) => (
                                <tr key={tx.purchaseId}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{tx.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{tx.course}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{formatDate(tx.purchasedAt)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-400">{formatCurrency(tx.price)}</td>
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