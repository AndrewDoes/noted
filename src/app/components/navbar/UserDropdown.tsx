"use client";

import Link from 'next/link';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, History, LogOut } from 'lucide-react';

export const UserDropdown = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)} // Close on blur
        className="flex items-center p-2 text-sm text-white transition-colors rounded-full hover:bg-gray-700"
      >
        <User className="w-5 h-5"/>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10">
          <div className="py-1">
            <div className="px-4 py-2 border-b border-gray-700">
                <p className="text-sm text-gray-400">Signed in as</p>
                <p className="font-medium text-white truncate">{user.email}</p>
            </div>
            <Link href="/account" className="flex items-center w-full px-4 py-2 space-x-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
                <User className="w-4 h-4"/>
                <span>My Account</span>
            </Link>
            <Link href="/transactions" className="flex items-center w-full px-4 py-2 space-x-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
                <History className="w-4 h-4"/>
                <span>Transaction History</span>
            </Link>
            <div className="border-t border-gray-700 my-1"></div>
            <button onClick={logout} className="flex items-center w-full px-4 py-2 space-x-2 text-sm text-red-400 hover:bg-gray-700 hover:text-white">
                <LogOut className="w-4 h-4"/>
                <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
