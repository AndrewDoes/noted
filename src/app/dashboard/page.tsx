"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SearchBar } from '../components/SearchBar';
import { FilterChip } from '../components/FilterChip';
import { NoteCard } from '../components/NoteCard';
import { db } from '@/firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { Note } from '../types/Note';

export default function DashboardPage() {
  const { user } = useAuth(); // We still need the user to fetch data
  const filters = ['All', 'Trending', 'Newest', 'For You', 'Top Rated'];
  
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [notes, setNotes] = useState<Note[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // The auth check is now in the layout, so we can assume a user exists here.
    // We fetch notes as soon as the component mounts.
    const fetchNotes = async () => {
      try {
        setIsLoading(true);
        const notesCollection = collection(db, 'notes');
        const notesSnapshot = await getDocs(notesCollection);
        const notesList = notesSnapshot.docs.map(doc => ({
          ...doc.data() as Omit<Note, 'id'>,
          id: doc.id,
        }));
        setNotes(notesList);
        setError(null);
      } catch (err) {
        console.error("Error fetching notes: ", err);
        setError("Failed to load notes. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, []); // Run only once on component mount

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
  };

  const filteredNotes = notes.filter(note => {
    if (selectedFilter === 'Trending') return note.rating > 4.8;
    if (selectedFilter === 'Top Rated') return note.rating >= 4.9;
    return true; 
  });

  // The main container is now just a simple div with padding,
  // as the layout provides the screen structure.
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-white mb-6">Welcome, {user?.email}!</h1>
      
      <section className="space-y-8">
        <SearchBar />
        
        <div className="flex px-4 pb-2 -mx-4 space-x-3 overflow-x-auto">
          {filters.map((filter) => (
            <FilterChip 
              key={filter} 
              label={filter} 
              isSelected={selectedFilter === filter}
              onClick={() => handleFilterSelect(filter)}
            />
          ))}
        </div>
        
        <div>
          <h2 className="mb-4 text-2xl font-bold text-white">{selectedFilter} Notes</h2>
          {isLoading ? (
            <p className="text-center">Loading notes...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredNotes.length > 0 ? (
                filteredNotes.map((note) => (
                  <NoteCard key={note.title} note={note} />
                ))
              ) : (
                <p className="text-center text-gray-400 md:col-span-2 xl:col-span-3">
                  No notes found for this filter.
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

