"use client";

import React, {useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { db, storage } from '@/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function UploadPage() {
  const { user } = useAuth(); // The layout ensures the user exists.
  const router = useRouter();

  // State for form inputs
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (e.target.files[0].type === "application/pdf") {
        setFile(e.target.files[0]);
        setError(null);
      } else {
        setError("Invalid file type. Please select a PDF.");
        setFile(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file || !title || !course || !price) {
      setError('Please fill in all fields and select a PDF file.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const storageRef = ref(storage, `notes/${user.uid}/${Date.now()}_${file.name}`);
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(uploadResult.ref);

      await addDoc(collection(db, 'notes'), {
        title,
        course,
        price: Number(price),
        author: user.email, 
        authorId: user.uid,
        rating: 0,
        pdfUrl: downloadURL,
        createdAt: serverTimestamp(),
      });
      
      setSuccessMessage('Note uploaded successfully! Redirecting...');
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err) {
      console.error("Error uploading note: ", err);
      setError("Failed to upload note. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col h-full">
        <h1 className="text-4xl font-bold text-white">Upload Your Note</h1>
        <p className="mt-2 text-gray-400">
          Share your knowledge with the community and earn money.
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

          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-300">PDF File</label>
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              accept=".pdf"
              className="block w-full mt-1 text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
            />
             <p className="mt-1 text-xs text-gray-500">Only .pdf files are accepted.</p>
          </div>
          
          {error && <p className="text-sm text-center text-red-500">{error}</p>}
          {successMessage && <p className="text-sm text-center text-green-500">{successMessage}</p>}

          <button
            type="submit"
            disabled={isUploading}
            className="w-full px-4 py-3 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : 'Upload Note'}
          </button>
        </form>
    </div>
  );
}

