"use client";

// 1. IMPORTS
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext'; // Cleaned up import path
import { db } from '@/firebase/config';
import { doc, getDoc, addDoc, collection, serverTimestamp, query, where, getDocs } from 'firebase/firestore'; 
import { Note } from '../../../types/Note'; // Cleaned up import path
import { Star, FileText, User, CheckCircle, AlertTriangle, BadgeCheck } from 'lucide-react';

export default function NoteDetailPage() {
  
  // 2. HOOKS & STATE
  const { user } = useAuth();
  const params = useParams();
  const { noteId } = params;

  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  // Your new state is perfect!
  const [hasPurchased, setHasPurchased] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // 3. DATA FETCHING
  useEffect(() => {
    const fetchNoteAndPurchaseStatus = async () => {
      // You need to check for user here, otherwise user.uid might be null
      if (typeof noteId !== 'string' || !user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // --- Step A: Fetch the Note ---
        const noteRef = doc(db, 'notes', noteId);
        const docSnap = await getDoc(noteRef);

        if (!docSnap.exists()) {
          setError("Note not found.");
          setIsLoading(false);
          return;
        }
        
        const noteData = { id: docSnap.id, ...docSnap.data() } as Note;
        setNote(noteData);

        // --- Step B: Check purchase status ---
        if (noteData.authorId === user.uid) {
          // User is the owner, no need to do anything else
        } else {
          // User is not the owner, check if they've bought it
          
          // --- THIS IS THE FIX ---
          // Using the 'user.uid' variable, not the string "user.uid"
          const q = query(
            collection(db, 'purchases'),
            where("userId", "==", user.uid), 
            where("noteId", "==", noteId)
          );
          // ---------------------

          const purchaseSnapshot = await getDocs(q);
          if (!purchaseSnapshot.empty) {
            setHasPurchased(true);
          }
        }

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load note details.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNoteAndPurchaseStatus();
  }, [noteId, user]); // Added 'user' dependency

  // 4. PURCHASE FUNCTION
  const handlePurchase = async () => {
    if (!user || !note) {
      setPurchaseError("You must be logged in to purchase a note.");
      return;
    }
    
    // Add check for hasPurchased
    if (hasPurchased) return;
    
    setIsPurchasing(true);
    setPurchaseError(null);
    setPurchaseSuccess(false);

    try {
      const purchasesRef = collection(db, 'purchases');
      await addDoc(purchasesRef, {
        userId: user.uid,
        noteId: note.id,
        noteTitle: note.title,
        price: note.price,
        purchasedAt: serverTimestamp()
      });
      setPurchaseSuccess(true);
      setHasPurchased(true); // Also update the state locally
    } catch (err) {
      console.error("Error purchasing note: ", err);
      setPurchaseError("Failed to purchase. Please try again.");
    } finally {
      setIsPurchasing(false);
    }
  };

  // 5. RENDER LOGIC
  if (isLoading) {
    return <div className="p-8 text-center text-gray-400">Loading...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }
  if (!note) {
    return <div className="p-8 text-center text-gray-400">Note not found.</div>;
  }

  // Your ownership constant is perfect!
  const isOwner = user?.uid === note.authorId;

  // 6. JSX (The View)
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        
        <div className="h-48 bg-gray-700 w-full flex items-center justify-center text-gray-500">
          <FileText className="w-16 h-16" />
        </div>

        <div className="p-6">
          <h1 className="text-3xl font-bold text-white mb-2">{note.title}</h1>
          <p className="text-lg text-gray-400 mb-4">{note.course}</p>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">{note.author}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="text-lg font-semibold text-white">{note.rating}</span>
            </div>
          </div>
          
          {/* Your button logic here is 100% correct. Great job. */}
          <button
            onClick={handlePurchase}
            disabled={isOwner || hasPurchased || isPurchasing || purchaseSuccess}
            className={`w-full py-3 font-bold text-white rounded-lg transition-colors ${
              isOwner
                ? 'bg-gray-600 cursor-not-allowed'
                : hasPurchased || purchaseSuccess
                ? 'bg-green-600 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400/50 disabled:cursor-not-allowed'
            }`}
          >
            {isOwner ? (
              <span className="flex items-center justify-center">
                <BadgeCheck className="w-5 h-5 mr-2" />
                This is your note
              </span>
            ) : hasPurchased || purchaseSuccess ? (
              <span className="flex items-center justify-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Successfully Purchased!
              </span>
            ) : isPurchasing ? (
              'Purchasing...'
            ) : (
              `Buy Now (${formatCurrency(note.price)})`
            )}
          </button>
          
          {purchaseError && (
            <p className="mt-4 text-sm text-center text-red-500 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {purchaseError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}