// src/app/components/ReviewsSection.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/firebase/config';
import { 
  collection, query, where, orderBy, getDocs, addDoc, 
  serverTimestamp, Timestamp, doc, updateDoc, deleteDoc, 
  arrayUnion, arrayRemove, getDoc 
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Star, User, MessageSquare, Send, Trash2, MessageCircle, Reply } from 'lucide-react';

interface Reply {
  userId: string;
  userName: string;
  text: string;
  createdAt: Timestamp; // We'll store this manually in the array
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Timestamp;
  replies?: Reply[]; // Array of reply objects
}

interface ReviewsSectionProps {
  noteId: string;
  canReview: boolean;
}

export const ReviewsSection = ({ noteId, canReview }: ReviewsSectionProps) => {
  const { user, userProfile } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  
  // Form States
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  
  // Reply States: Track which review is being replied to
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch Reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!noteId) return;
      try {
        const q = query(
          collection(db, 'reviews'),
          where("noteId", "==", noteId),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const reviewsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Review));
        
        setReviews(reviewsData);
      } catch (error) {
        console.error("Error loading reviews:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [noteId]);

  // 2. Submit New Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      // A. Add to Firestore
      const docRef = await addDoc(collection(db, 'reviews'), {
        noteId,
        userId: user.uid,
        userName: userProfile?.displayName || user.email?.split('@')[0] || 'Anonymous',
        rating: newRating,
        comment: newComment,
        createdAt: serverTimestamp(),
        replies: [] // Initialize empty replies array
      });

      // B. Update Note Average
      await updateNoteRating(newRating, 'add');

      // C. Update Local State
      const newReviewObj: Review = {
        id: docRef.id,
        userId: user.uid,
        userName: userProfile?.displayName || 'You',
        rating: newRating,
        comment: newComment,
        createdAt: Timestamp.now(),
        replies: []
      };
      setReviews([newReviewObj, ...reviews]);
      
      // Reset Form
      setNewComment('');
      setNewRating(5);

    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Delete Review
  const handleDeleteReview = async (reviewId: string, rating: number) => {
    if (!confirm("Delete this review?")) return;
    
    try {
      // A. Delete Document
      await deleteDoc(doc(db, 'reviews', reviewId));

      // B. Update Note Average
      await updateNoteRating(rating, 'remove');

      // C. Update Local State
      setReviews(reviews.filter(r => r.id !== reviewId));

    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  // Helper: Recalculate Rating
  const updateNoteRating = async (ratingChange: number, mode: 'add' | 'remove') => {
    // We calculate based on current local state to save reads, 
    // but for 'add', the state hasn't updated yet, so we handle logically.
    
    let newTotal = 0;
    let newCount = 0;

    if (mode === 'add') {
       const currentSum = reviews.reduce((sum, r) => sum + r.rating, 0);
       newTotal = currentSum + ratingChange;
       newCount = reviews.length + 1;
    } else {
       const currentSum = reviews.reduce((sum, r) => sum + r.rating, 0);
       newTotal = currentSum - ratingChange;
       newCount = reviews.length - 1;
    }

    const newAverage = newCount > 0 ? newTotal / newCount : 0;

    const noteRef = doc(db, 'notes', noteId);
    await updateDoc(noteRef, {
      rating: Number(newAverage.toFixed(1))
    });
  };

  // 4. Reply Functions
  const handleReplySubmit = async (e: React.FormEvent, reviewId: string) => {
    e.preventDefault();
    if (!user || !replyText.trim()) return;

    const replyPayload: Reply = {
      userId: user.uid,
      userName: userProfile?.displayName || user.email?.split('@')[0] || 'User',
      text: replyText,
      createdAt: Timestamp.now(), 
    };

    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      // Use arrayUnion to add to the 'replies' array in Firestore
      await updateDoc(reviewRef, {
        replies: arrayUnion(replyPayload)
      });

      // Update local state
      setReviews(reviews.map(r => {
        if (r.id === reviewId) {
          return { ...r, replies: [...(r.replies || []), replyPayload] };
        }
        return r;
      }));

      setReplyingTo(null);
      setReplyText('');

    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  const handleDeleteReply = async (reviewId: string, replyToDelete: Reply) => {
    if (!confirm("Delete this reply?")) return;

    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      await updateDoc(reviewRef, {
        replies: arrayRemove(replyToDelete) // Requires exact object match
      });

      // Update local state
      setReviews(reviews.map(r => {
        if (r.id === reviewId) {
          return { 
            ...r, 
            replies: (r.replies || []).filter(reply => reply.createdAt !== replyToDelete.createdAt) 
          };
        }
        return r;
      }));

    } catch (error) {
      console.error("Error deleting reply:", error);
    }
  };

  return (
    <div className="mt-12 border-t border-border pt-8">
      <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
        <MessageSquare className="w-6 h-6 mr-2" />
        Reviews ({reviews.length})
      </h2>

      {/* --- Main Review Form --- */}
      {canReview && (
        <form onSubmit={handleSubmitReview} className="bg-card border border-border p-6 rounded-lg mb-8 shadow-sm">
          <h3 className="text-base font-semibold mb-4 text-foreground">Leave a review</h3>
          <div className="flex items-center space-x-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setNewRating(star)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star className={`w-8 h-8 ${star <= newRating ? 'text-stars fill-current' : 'text-muted'}`} />
              </button>
            ))}
          </div>
          <div className="relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full p-4 pr-12 rounded-md bg-secondary/50 border border-border text-foreground focus:ring-2 focus:ring-primary focus:outline-none resize-none"
              rows={3}
              required
            />
            <button type="submit" disabled={isSubmitting} className="absolute bottom-3 right-3 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* --- Reviews List --- */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="bg-card border border-border p-4 rounded-lg">
            <div className="flex space-x-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground">
                  <User className="w-5 h-5" />
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-foreground">{review.userName}</h4>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-muted-foreground">
                      {review.createdAt?.toDate().toLocaleDateString()}
                    </span>
                    {/* Delete Review Button */}
                    {user?.uid === review.userId && (
                      <button 
                        onClick={() => handleDeleteReview(review.id, review.rating)}
                        className="text-destructive hover:text-destructive/80 transition-colors"
                        title="Delete Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < Math.round(review.rating) ? 'text-stars fill-current' : 'text-muted'}`} />
                  ))}
                </div>
                
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  {review.comment}
                </p>

                {/* Reply Toggle Button */}
                {user && (
                   <button 
                     onClick={() => setReplyingTo(replyingTo === review.id ? null : review.id)}
                     className="flex items-center text-xs text-primary hover:underline font-medium mb-2"
                   >
                     <Reply className="w-3 h-3 mr-1" /> Reply
                   </button>
                )}

                {/* --- Reply Input Form --- */}
                {replyingTo === review.id && (
                  <form onSubmit={(e) => handleReplySubmit(e, review.id)} className="mt-2 mb-4 flex flex-col md:flex-row ">
                    <input 
                      type="text" 
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      className="flex-1 px-3 py-2 text-sm mb-2 mr-0 md:mr-2 md:mb-0  rounded-md bg-secondary border border-border focus:outline-none focus:border-primary "
                      autoFocus
                    />
                    <button type="submit" className="px-3 py-2 whitespace-nowrap bg-primary text-primary-foreground text-sm rounded-md font-medium">
                      Reply
                    </button>
                  </form>
                )}

                {/* --- Replies List --- */}
                {review.replies && review.replies.length > 0 && (
                  <div className="mt-3 pl-4 border-l-2 border-border space-y-3">
                    {review.replies.map((reply, idx) => (
                      <div key={idx} className="bg-secondary/30 p-3 rounded-md">
                        <div className="flex justify-between items-start">
                           <div className="flex items-center gap-2 mb-1">
                             <span className="text-xs font-bold text-foreground">{reply.userName}</span>
                             {/* Optional: Add 'Author' badge here if userId matches note owner */}
                           </div>
                           
                           {/* Delete Reply Button */}
                           {user?.uid === reply.userId && (
                             <button 
                               onClick={() => handleDeleteReply(review.id, reply)}
                               className="text-muted-foreground hover:text-destructive transition-colors"
                             >
                               <Trash2 className="w-3 h-3" />
                             </button>
                           )}
                        </div>
                        <p className="text-xs text-muted-foreground">{reply.text}</p>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </div>
          </div>
        ))}

        {!isLoading && reviews.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
            <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
            <p>No reviews yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};