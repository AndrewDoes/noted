// src/app/dashboard/note/[noteId]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { db, storage } from '@/firebase/config';
import { doc, getDoc, addDoc, collection, serverTimestamp, query, where, getDocs, deleteDoc } from 'firebase/firestore'; 
import { ref, deleteObject } from 'firebase/storage';
import { Note } from '../../../types/Note';
import { Star, FileText, User, CheckCircle, AlertTriangle, Pencil, Trash2 } from 'lucide-react';
import { ReviewsSection } from '../../../components/ReviewsSection';

export default function NoteDetailPage() {
  
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter(); 
  const { noteId } = params;

  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  useEffect(() => {
    const fetchNoteAndPurchaseStatus = async () => {
      if (typeof noteId !== 'string' || !user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // 1. Fetch Note
        const noteRef = doc(db, 'notes', noteId);
        const docSnap = await getDoc(noteRef);

        if (!docSnap.exists()) {
          setError("Note not found.");
          setIsLoading(false);
          return;
        }
        
        const noteData = { id: docSnap.id, ...docSnap.data() } as Note;
        setNote(noteData);

        // 2. Check Purchase Status
        // IMPORTANT: We only check purchases if the user is NOT the author.
        // Authors don't need to buy their own notes, but they also shouldn't review them.
        if (noteData.authorId !== user.uid) {
          const q = query(
            collection(db, 'purchases'),
            where("userId", "==", user.uid), 
            where("noteId", "==", noteId)
          );

          const purchaseSnapshot = await getDocs(q);
          if (!purchaseSnapshot.empty) {
            setHasPurchased(true);
          }
        }
        // Note: If authorId === user.uid, hasPurchased remains FALSE.

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load note details.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNoteAndPurchaseStatus();
  }, [noteId, user]);

  // ... (handlePurchase and handleDelete functions remain the same) ...
  
  const handlePurchase = async () => {
    if (!user || !note) {
      setPurchaseError("You must be logged in to purchase a note.");
      return;
    }
    if (hasPurchased) return;
    
    setIsPurchasing(true);
    setPurchaseError(null);
    setPurchaseSuccess(false);

    try {
      await addDoc(collection(db, 'purchases'), {
        userId: user.uid,
        noteId: note.id,
        noteTitle: note.title,
        price: note.price,
        purchasedAt: serverTimestamp()
      });
      setPurchaseSuccess(true);
      setHasPurchased(true);
    } catch (err) {
      console.error("Error purchasing: ", err);
      setPurchaseError("Failed to purchase. Please try again.");
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !note || !(user.uid === note.authorId)) return;
    if (window.confirm("Are you sure? This cannot be undone.")) {
      try {
        await deleteObject(ref(storage, note.pdfUrl));
        await deleteDoc(doc(db, 'notes', note.id));
        router.push('/dashboard/my-notes');
      } catch (err) {
        setPurchaseError("Failed to delete note.");
      }
    }
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  if (error) return <div className="p-8 text-center text-destructive">{error}</div>;
  if (!note) return <div className="p-8 text-center text-muted-foreground">Note not found.</div>;

  const isOwner = user?.uid === note.authorId;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="bg-card border-border rounded-lg shadow-lg overflow-hidden">
        
        {/* PDF Viewer Logic: Visible if Owner OR Purchased */}
        {isOwner || hasPurchased ? (
          <div className="aspect-video bg-background">
            <iframe src={note.pdfUrl} title={note.title} width="100%" className="w-full h-96" />
            <p className="p-4 text-center text-muted-foreground text-sm">
              Can&apos;t see the PDF? 
              <a href={note.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                Open in a new tab
              </a>
            </p>
          </div>
        ) : (
          <div className="h-48 bg-secondary w-full flex items-center justify-center text-secondary-foreground">
            <FileText className="w-16 h-16" />
            <span className="ml-4 text-lg font-semibold">Preview Not Available</span>
          </div>
        )}

        <div className="p-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">{note.title}</h1>
          <p className="text-lg text-muted-foreground mb-4">{note.course}</p>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{note.author}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-5 h-5 text-stars fill-current" />
              <span className="text-lg font-semibold text-foreground">{note.rating}</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          {isOwner ? (
            <div className="grid grid-cols-2 gap-4">
              <Link href={`/dashboard/note/${note.id}/edit`} className="flex items-center justify-center w-full py-3 font-bold text-secondary-foreground bg-secondary rounded-lg hover:bg-secondary/90">
                <Pencil className="w-5 h-5 mr-2" /> Edit Note
              </Link>
              <button onClick={handleDelete} className="flex items-center justify-center w-full py-3 font-bold text-destructive-foreground bg-destructive rounded-lg hover:bg-destructive/90">
                <Trash2 className="w-5 h-5 mr-2" /> Delete Note
              </button>
            </div>
          ) : (
            <button
              onClick={handlePurchase}
              disabled={hasPurchased || isPurchasing || purchaseSuccess}
              className={`w-full py-3 font-bold text-primary-foreground rounded-lg transition-colors ${
                hasPurchased || purchaseSuccess
                  ? 'bg-success cursor-not-allowed'
                  : 'bg-primary hover:bg-primary/90 disabled:opacity-50'
              }`}
            >
              {hasPurchased || purchaseSuccess ? (
                <span className="flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {hasPurchased ? "You own this note" : "Successfully Purchased!"}
                </span>
              ) : isPurchasing ? 'Purchasing...' : `Buy Now (${formatCurrency(note.price)})`}
            </button>
          )}
          
          {purchaseError && (
            <p className="mt-4 text-sm text-center text-destructive flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 mr-1" /> {purchaseError}
            </p>
          )}

          {/* Reviews Section */}
          {/* hasPurchased is FALSE for owners, so they cannot review */}
          <ReviewsSection 
            noteId={note.id} 
            canReview={hasPurchased} 
          />
        </div>
      </div>
    </div>
  );
}