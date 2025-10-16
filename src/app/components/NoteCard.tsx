import React from 'react';
import { Note } from '../types/Note';
import { format } from 'path';

const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-amber-500">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
);

interface NoteCardProps {
    note: Note;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };
    return (
        <div className="flex flex-col h-full p-5 transition-all duration-300 transform bg-gray-800 border border-gray-700 rounded-lg hover:border-indigo-500 hover:-translate-y-1">
            <div className="flex-grow">
                <h3 className="mb-1 text-lg font-bold text-white">{note.title}</h3>
                <p className="text-sm text-gray-400">{note.course}</p>
            </div>
            <div className="flex items-end justify-between mt-4">
                <div>
                    <p className="text-xs text-gray-400">{note.author}</p>
                    <div className="flex items-center mt-1">
                        <StarIcon />
                        <span className="ml-1 font-bold text-white">{note.rating}</span>
                    </div>
                </div>
                <p className="text-xl font-bold text-indigo-400">{formatCurrency(note.price)},00</p>
            </div>
        </div>
    );
};
