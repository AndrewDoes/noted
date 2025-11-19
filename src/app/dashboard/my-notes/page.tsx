"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { NoteCard } from '../../components/NoteCard';
import { db } from '@/firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Note } from '../../types/Note';
import { Notebook, Search } from 'lucide-react'; // Import icons
import { SearchBar } from '../../components/SearchBar';
import { FilterChip } from '../../components/FilterChip';

export default function MyNotesPage() {
  const { user } = useAuth();
  
  const [myNotes, setMyNotes] = useState<Note[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- New State for filtering and search ---
  const filters = ['All', 'Trending', 'Top Rated'];
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  // ------------------------------------------

  useEffect(() => {
    if (!user) return;

    const fetchMyNotes = async () => {
      try {
        setIsLoading(true);
        const notesCollection = collection(db, 'notes');
        const q = query(notesCollection, where("authorId", "==", user.uid));

        const notesSnapshot = await getDocs(q);
        const notesList = notesSnapshot.docs.map(doc => ({
          ...doc.data() as Omit<Note, 'id'>,
          id: doc.id,
        }));
        
        setMyNotes(notesList);
        setError(null);
      } catch (err) {
        console.error("Error fetching user's notes: ", err);
        setError("Failed to load your notes. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyNotes();
  }, [user]);

  const filteredNotes = useMemo(() => {
    return myNotes
      .filter(note => {
        // 1. Filter by search query
        const query = searchQuery.toLowerCase();
        if (!query) return true; // If no search, show all
        return note.title.toLowerCase().includes(query) || 
               note.course.toLowerCase().includes(query);
      })
      .filter(note => {
        // 2. Filter by selected chip
        if (selectedFilter === 'All') return true;
        if (selectedFilter === 'Trending') return note.rating > 4.8;
        if (selectedFilter === 'Top Rated') return note.rating >= 4.9;
        return true;
      });
  }, [myNotes, searchQuery, selectedFilter]);
  // ---------------------------

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-foreground mb-6">My Uploaded Notes</h1>

      {/* --- ADDED SEARCH AND FILTER UI --- */}
      <section className="space-y-8 mb-8">
        <SearchBar 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <div className="flex px-4 pb-2 -mx-4 space-x-3 overflow-x-auto">
          {filters.map((filter) => (
            <FilterChip 
              key={filter} 
              label={filter} 
              isSelected={selectedFilter === filter}
              onClick={() => setSelectedFilter(filter)}
            />
          ))}
        </div>
      </section>
      {/* --------------------------------- */}

      {isLoading ? (
        <p className="text-center text-muted-foreground">Loading your notes...</p>
      ) : error ? (
        <p className="text-center text-destructive">{error}</p>
      ) : (
        <>
          {myNotes.length === 0 ? (
            // State for users who have not uploaded any notes
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed border-border rounded-lg p-12">
              <Notebook className="w-16 h-16 mb-4" />
              <h2 className="text-xl font-semibold text-foreground">You haven&apos;t uploaded any notes yet.</h2>
              <p className="mt-2">Your uploaded notes will appear here.</p>
            </div>
          ) : filteredNotes.length === 0 ? (
            // State for when filters/search find no results
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed border-border rounded-lg p-12">
              <Search className="w-16 h-16 mb-4" />
              <h2 className="text-xl font-semibold text-foreground">No notes found.</h2>
              <p className="mt-2">Try adjusting your search or filter.</p>
            </div>
          ) : (
            // Default state: show the filtered notes
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredNotes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}