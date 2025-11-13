"use client";

import React, { useState, useEffect, useMemo } from 'react'; // Import useMemo
import { useAuth } from '../context/AuthContext';
import { SearchBar } from '../components/SearchBar';
import { FilterChip } from '../components/FilterChip';
import { NoteCard } from '../components/NoteCard';
import { db } from '@/firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { Note } from '../types/Note';
import { Search } from 'lucide-react'; // Import Search icon

export default function DashboardPage() {
  const { user } = useAuth();
  const filters = ['All', 'Trending', 'Newest', 'For You', 'Top Rated'];

  const [selectedFilter, setSelectedFilter] = useState('All');
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(''); // --- ADDED SEARCH STATE ---

  useEffect(() => {
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

  // --- UPDATED FILTERING LOGIC ---
  const filteredNotes = useMemo(() => {
    return notes
      .filter(note => {
        // 1. Filter by search query
        const query = searchQuery.toLowerCase();
        if (!query) return true;
        return note.title.toLowerCase().includes(query) || 
               note.course.toLowerCase().includes(query);
      })
      .filter(note => {
        // 2. Filter by selected chip
        if (selectedFilter === 'All') return true;
        if (selectedFilter === 'Trending') return note.rating > 4.8;
        if (selectedFilter === 'Top Rated') return note.rating >= 4.9;
        // 'Newest' and 'For You' logic can be added here
        return true; 
      });
  }, [notes, searchQuery, selectedFilter]);
  // ---------------------------------

  const findName = () => {
    if (!user || !user.email) {
      return "Guest";
    }
    const localPart = user.email.split('@')[0];
    const nameParts = localPart.split('.');
    if (nameParts.length >= 2) {
      const [firstName, lastName] = nameParts;
      const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
      return `${capitalize(firstName)} ${capitalize(lastName)}`;
    }
    if (nameParts.length === 1) {
      const name = nameParts[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return "User";
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-white mb-6">Welcome, {findName()}!</h1>

      <section className="space-y-8">
        {/* --- UPDATED SEARCH BAR --- */}
        <SearchBar 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {/* ------------------------- */}

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
            <p className="text-center text-gray-400">Loading notes...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <>
              {filteredNotes.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {filteredNotes.map((note) => (
                    <NoteCard key={note.id} note={note} /> 
                  ))}
                </div>
              ) : (
                // --- ADDED NO RESULTS MESSAGE ---
                <div className="flex flex-col items-center justify-center text-center text-gray-400 border-2 border-dashed border-gray-700 rounded-lg p-12">
                  <Search className="w-16 h-16 mb-4" />
                  <h2 className="text-xl font-semibold text-white">No notes found.</h2>
                  <p className="mt-2">Try adjusting your search or filter.</p>
                </div>
                // ----------------------------------
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}