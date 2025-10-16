"use client";

import Link from 'next/link';
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Notebook, User, History, Upload, LogOut } from 'lucide-react';

export const Sidebar = ({ closeMenu }: { closeMenu?: () => void }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/my-notes', label: 'My Notes', icon: Notebook },
    { href: '/account', label: 'My Account', icon: User },
    { href: '/transactions', label: 'Transaction History', icon: History },
  ];

  const handleLinkClick = () => {
    if (closeMenu) {
      closeMenu();
    }
  };

  const handleLogout = () => {
    if (closeMenu) closeMenu();
    logout();
  };

  return (
    <aside className="h-full w-full bg-gray-800 text-white flex flex-col border-r border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <Link href="/dashboard" onClick={handleLinkClick}>
          <h1 className="text-2xl font-bold">Noted</h1>
        </Link>
      </div>
      <div className="px-4 py-3 border-b border-gray-700">
        <p className="text-sm text-gray-400">Signed in as</p>
        <p className="font-medium truncate">{user.email}</p>
      </div>
      <nav className="flex-grow p-2 space-y-1">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} onClick={handleLinkClick} className="flex items-center px-3 py-2 space-x-3 text-sm font-medium transition-colors rounded-md hover:bg-gray-700">
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-2 border-t border-gray-700 space-y-2">
         {/* --- THIS LINK IS NOW CORRECTED --- */}
         <Link href="/upload" onClick={handleLinkClick} className="flex items-center justify-center w-full px-4 py-2 space-x-3 text-sm font-semibold text-white transition-colors border border-gray-600 rounded-md hover:bg-gray-800">
            <Upload className="w-5 h-5" />
            <span>Upload Note</span>
         </Link>
         <button onClick={handleLogout} className="flex items-center justify-center w-full px-4 py-2 space-x-3 text-sm font-semibold text-white transition-colors bg-indigo-600 rounded-md hover:bg-indigo-700">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
         </button>
      </div>
    </aside>
  );
};

