import { Note } from '../types/Note';
import { Timestamp } from 'firebase/firestore'; // Import Timestamp

// Helper to create a fake timestamp for mock data
const mockTimestamp = () => Timestamp.now();

export const mockNotes: Note[] = [
  {
    id: 'mock1', // Added id
    title: 'Database Systems Mid-Term Prep',
    course: 'COMP6048 - Binus University',
    author: 'by Michael C.',
    rating: 4.9,
    price: 20000, // Changed to number
    authorId: 'user1', // Added authorId
    pdfUrl: 'example.com/note1.pdf', // Added pdfUrl
    createdAt: mockTimestamp(), // Added createdAt
  },
  {
    id: 'mock2',
    title: 'Summary of Marketing - Week 5',
    course: 'MKTG101 - Binus University',
    author: 'by Jessica L.',
    rating: 4.8,
    price: 15000, // Changed to number
    authorId: 'user2',
    pdfUrl: 'example.com/note2.pdf',
    createdAt: mockTimestamp(),
  },
  {
    id: 'mock3',
    title: 'Algorithms & Complexity Cheatsheet',
    course: 'COMP6052 - Binus University',
    author: 'by Alex T.',
    rating: 5.0,
    price: 25000, // Changed to number
    authorId: 'user3',
    pdfUrl: 'example.com/note3.pdf',
    createdAt: mockTimestamp(),
  },
  {
    id: 'mock4',
    title: 'Business Communication Case Study',
    course: 'COMM6011 - Binus University',
    author: 'by Sarah P.',
    rating: 4.7,
    price: 12000, // Changed to number
    authorId: 'user4',
    pdfUrl: 'example.com/note4.pdf',
    createdAt: mockTimestamp(),
  },
  {
    id: 'mock5',
    title: 'Intro to Financial Accounting',
    course: 'ACCT6034 - Binus University',
    author: 'by David K.',
    rating: 4.9,
    price: 18000, // Changed to number
    authorId: 'user5',
    pdfUrl: 'example.com/note5.pdf',
    createdAt: mockTimestamp(),
  },
  {
    id: 'mock6',
    title: 'Calculus II Final Exam Review',
    course: 'MATH6020 - Binus University',
    author: 'by Emily R.',
    rating: 4.6,
    price: 15000, // Changed to number
    authorId: 'user6',
    pdfUrl: 'example.com/note6.pdf',
    createdAt: mockTimestamp(),
  },
    {
    id: 'mock7',
    title: 'Human Computer Interaction Guide',
    course: 'ISYS6078 - Binus University',
    author: 'by Chris G.',
    rating: 4.8,
    price: 17000, // Changed to number
    authorId: 'user7',
    pdfUrl: 'example.com/note7.pdf',
    createdAt: mockTimestamp(),
  },
];