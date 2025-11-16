"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext'; // Using relative path
import { db } from '@/firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function EditNotePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { noteId } = params;

  // State for form inputs
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [price, setPrice] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch the note's current data
  useEffect(() => {
    if (!user || typeof noteId !== 'string') return;

    const fetchNote = async () => {
      try {
        const noteRef = doc(db, 'notes', noteId);
        const docSnap = await getDoc(noteRef);

        if (docSnap.exists()) {
          const noteData = docSnap.data();
          // 2. Authorization check
          if (noteData.authorId !== user.uid) {
            setError("You are not authorized to edit this note.");
            router.push('/dashboard');
            return;
          }
          // 3. Populate the form
          setTitle(noteData.title);
          setCourse(noteData.course);
          setPrice(noteData.price.toString());
        } else {
          setError("Note not found.");
        }
      } catch (err) {
        setError("Failed to load note.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [user, noteId, router]);

  // 4. Handle the form submit to UPDATE the doc
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title || !course || !price || typeof noteId !== 'string') {
      setError('Please fill in all fields.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const noteRef = doc(db, 'notes', noteId);
      await updateDoc(noteRef, {
        title: title,
        course: course,
        price: Number(price),
      });
      
      // 5. Go back to the note detail page
      router.push(`/dashboard/note/${noteId}`);

    } catch (err) {
      console.error("Error updating note: ", err);
      setError("Failed to update note. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-400">Loading note details...</div>;
  }

  // 6. This JSX is based on your UploadPage
  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col h-full">
        <h1 className="text-4xl font-bold text-white">Edit Note Details</h1>
        <p className="mt-2 text-gray-400">
          Update the information for your note.
        </p>

        <form onSubmit={handleSubmit} className="p-8 mt-8 space-y-6 bg-gray-800 rounded-lg w-full">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300">Note Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full px-4 py-3 mt-1 text-white bg-gray-700 border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., Marketing Mid-Term Summary"
            />
          </div>

          <div>
            <label htmlFor="course" className="block text-sm font-medium text-gray-300">Course Code / Name</label>
            <input
              type="text"
              id="course"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="block w-full px-4 py-3 mt-1 text-white bg-gray-700 border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., MKTG101 - Binus University"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-300">Price (IDR)</label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="block w-full px-4 py-3 mt-1 text-white bg-gray-700 border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., 15000"
            />
          </div>

           <p className="mt-1 text-xs text-gray-500">Note: To change the PDF file, please delete this note and re-upload.</p>
          
          {error && <p className="text-sm text-center text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full px-4 py-3 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
    </div>
  );
}