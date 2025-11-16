"use client";

import React, { useState } from 'react';
import { Sidebar } from '../components/navbar/Sidebar';
import { MenuIcon } from '../components/icons/MenuIcon';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const { user, userProfile, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Case 1: Not logged in
        router.push('/login');
      } else if (user && !userProfile) {
        router.push('/create-profile');
      }
    }
  }, [user, userProfile, isLoading, router]);

  // Show a loading screen while auth/profile check is happening
  if (isLoading || !user || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  // If we get here, the user is fully authenticated and has a profile.
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* --- Desktop Sidebar (WIDER) --- */}
      <div className="hidden md:block md:w-1/3 lg:w-1/4 xl:w-1/5 flex-shrink-0">
        <Sidebar />
      </div>

      {/* --- Mobile Sidebar --- */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar closeMenu={() => setIsSidebarOpen(false)} />
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
      
       {/* We'll re-add the modal logic in the next step */}
      
       {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
        ></div>
      )}
    </div>
  );
}