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
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // This protects the entire section of the app (all pages within this layout)
  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Shows a full-page loader while we verify the user's session
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* --- Desktop Sidebar (Permanent & Visible) --- */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* --- Mobile Sidebar (Slide-out, hidden by default) --- */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar closeMenu={() => setIsSidebarOpen(false)} />
      </div>

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header with Hamburger Menu */}
        <header className="flex items-center justify-between p-4 border-b border-gray-700 md:hidden">
          <Link href="/dashboard"><h1 className="text-2xl font-bold">Noted</h1></Link>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2" aria-label="Open menu">
            <MenuIcon />
          </button>
        </header>
        {/* The actual page content will be rendered here */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
      
       {/* Overlay for closing the mobile menu when clicking outside */}
       {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
        ></div>
      )}
    </div>
  );
}
