import Link from 'next/link';
import React from 'react';
import { NotificationIcon } from '../icons/NotificationIcon';

export const GuestNav = () => (
  <>
    <button aria-label="Notifications" className="p-2 transition-colors rounded-full hover:bg-gray-800">
      <NotificationIcon />
    </button>
    <Link href="/login">
      <span className="px-4 py-2 text-sm font-semibold text-white transition-colors rounded-md hover:bg-gray-800">
        Login
      </span>
    </Link>
    <Link href="/signup">
      <span className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
        Sign Up
      </span>
    </Link>
  </>
);
