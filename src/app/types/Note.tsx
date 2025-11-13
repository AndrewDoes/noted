import { Timestamp } from "firebase/firestore";

export interface Note {
  // This 'id' is what was missing
  id: string; 
  title: string;
  course: string;
  author: string;
  rating: number;
  price: number;
  
  // We should also add the other fields we save
  // to make the type truly accurate
  authorId: string;
  pdfUrl: string;
  createdAt: Timestamp; // Using 'any' for serverTimestamp for simplicity
}