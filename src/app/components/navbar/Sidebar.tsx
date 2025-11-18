"use client";

import Link from 'next/link';
import React from 'react';
import { useAuth } from '../../context/AuthContext'; // Using @/ alias for cleaner imports
import { LayoutDashboard, Notebook, User, History, Upload, LogOut } from 'lucide-react';

// 1. REMOVED 'onUploadClick' from the props. It's no longer needed.
interface SidebarProps {
  closeMenu?: () => void;
}

export const Sidebar = ({ closeMenu }: SidebarProps) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/my-notes', label: 'My Notes', icon: Notebook },
    { href: '/dashboard/account', label: 'My Account', icon: User },
    { href: '/dashboard/transactions', label: 'Transaction History', icon: History },
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

  // 2. REMOVED the 'handleUploadClick' function.

  return (
    <aside className="h-full w-full bg-card text-card-foreground flex flex-col border-r border-border">
      <div className="p-4 border-b border-border">
        <Link href="/dashboard" onClick={handleLinkClick}>
          <h1 className="text-2xl font-bold">Noted</h1>
        </Link>
      </div>
      <div className="px-4 py-3 border-b border-border">
        <p className="text-sm text-muted-foreground">Signed in as</p>
        <p className="font-medium truncate">{user.email}</p>
      </div>
      <nav className="flex-grow p-2 space-y-1">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} onClick={handleLinkClick} className="flex items-center px-3 py-2 space-x-3 text-sm font-medium transition-colors rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground">
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-2 border-t border-border space-y-2">
         {/* 3. This is now a <Link> pointing to the correct page route. */}
         <Link 
           href="/dashboard/upload" 
           onClick={handleLinkClick} 
           className="flex items-center justify-center w-full px-4 py-2 space-x-3 text-sm font-semibold text-secondary-foreground transition-colors border border-border rounded-md hover:bg-accent"
         >
            <Upload className="w-5 h-5" />
            <span>Upload Note</span>
         </Link>
         <button onClick={handleLogout} className="flex items-center justify-center w-full px-4 py-2 space-x-3 text-sm font-semibold text-destructive-foreground transition-colors bg-destructive rounded-md hover:bg-destructive/85">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
         </button>
      </div>
    </aside>
  );
};