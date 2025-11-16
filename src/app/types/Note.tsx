import { Timestamp } from "firebase/firestore";

export interface Note {
  id: string; 
  title: string;
  course: string;
  author: string;
  rating: number;
  price: number;
  authorId: string;
  pdfUrl: string;
  createdAt: Timestamp;
  thumbnailUrl?: string;
}