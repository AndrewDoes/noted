import { Note } from "../types/Note";
import { Star, FileText } from "lucide-react";
import Link from "next/link"; // 1. Import Link

interface NoteCardProps {
  note: Note;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

export const NoteCard = ({ note }: NoteCardProps) => {
  return (
    // 2. Wrap the card in a Link component with a dynamic href
    <Link href={`/dashboard/note/${note.id}`}>
      <div className="transition-all duration-300 ease-in-out bg-gray-800 border border-gray-700 rounded-lg shadow-lg cursor-pointer overflow-hidden hover:border-indigo-500 hover:-translate-y-1">
        
        {note.thumbnailUrl ? (
          <img 
            src={note.thumbnailUrl} 
            alt={`${note.title} preview`} 
            className="w-full h-32 object-cover" 
          />
        ) : (
          <div className="w-full h-32 bg-gray-700/50 flex flex-col items-center justify-center text-gray-500">
            <FileText className="w-8 h-8" />
            <span className="mt-2 text-xs font-semibold">No Preview Available</span>
          </div>
        )}

        <div className="p-4">
          <div className="flex-grow">
            <h3 className="text-lg font-bold text-white truncate">{note.title}</h3>
            <p className="mt-1 text-sm text-gray-400 truncate">{note.course}</p>
          </div>
          <div className="pt-4 mt-4 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400 truncate">{note.author}</p>
              <div className="flex items-center space-x-1 flex-shrink-0">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-semibold text-white">{note.rating}</span>
              </div>
            </div>
            
            <p className="mt-3 text-lg font-semibold text-indigo-400">
              {formatCurrency(note.price)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};