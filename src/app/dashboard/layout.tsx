"use client";

import React, { useState } from 'react';
import { Sidebar } from '../components/navbar/Sidebar';
import { MenuIcon } from '../components/icons/MenuIcon';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// We no longer need the UploadModal
// import { UploadModal } from '@/components/UploadModal'; 

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // We no longer need the modal state
  // const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* --- Desktop Sidebar (WIDER) --- */}
      <div className="hidden md:block md:w-1/3 lg:w-1/4 xl:w-1/5 flex-shrink-0">
        {/* We no longer pass the onUploadClick prop */}
        <Sidebar />
      </div>

      {/* --- Mobile Sidebar --- */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar 
          closeMenu={() => setIsSidebarOpen(false)} 
          // We no longer pass the onUploadClick prop
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header (reverted to dark) */}
        <header className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700 md:hidden">
          <Link href="/dashboard"><h1 className="text-2xl font-bold text-white">Noted</h1></Link>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-white" aria-label="Open menu">
            <MenuIcon />
          </button>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
      
      {/* We no longer need the modal here */}
      {/* {isUploadModalOpen && <UploadModal onClose={() => setIsUploadModalOpen(false)} />} */}
      
       {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
        ></div>
      )}
    </div>
  );
}