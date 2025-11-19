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
      <div className="transition-all duration-300 ease-in-out bg-card border border-border rounded-lg shadow-lg cursor-pointer overflow-hidden hover:border-primary hover:-translate-y-1">
        
        {note.thumbnailUrl ? (
          <img 
            src={note.thumbnailUrl} 
            alt={`${note.title} preview`} 
            className="w-full h-32 object-cover" 
          />
        ) : (
          <div className="w-full h-32 bg-secondary/50 flex flex-col items-center justify-center text-secondary-foreground">
            <FileText className="w-8 h-8" />
            <span className="mt-2 text-xs font-semibold">No Preview Available</span>
          </div>
        )}

        <div className="p-4">
          <div className="flex-grow">
            <h3 className="text-lg font-bold text-foreground truncate">{note.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground truncate">{note.course}</p>
          </div>
          <div className="pt-4 mt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground truncate">{note.author}</p>
              <div className="flex items-center space-x-1 flex-shrink-0">
                <Star className="w-4 h-4 text-stars fill-current" /> 
                <span className="text-sm font-semibold text-foreground">{note.rating}</span>
              </div>
            </div>
            
            <p className="mt-3 text-lg font-semibold text-primary">
              {formatCurrency(note.price)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};