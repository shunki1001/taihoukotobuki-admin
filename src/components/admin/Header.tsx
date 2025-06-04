"use client";
import React from "react";
// import { MenuIcon, UserCircleIcon } from '@heroicons/react/outline'; // 例: heroicons
// import { LogOut } from 'lucide-react'; // 例: lucide-react
// import { signOut } from "next-auth/react"; // NextAuth.js

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 dark:text-gray-400 focus:outline-none focus:text-gray-600 dark:focus:text-gray-200 md:hidden"
            >
              {/* <MenuIcon className="h-6 w-6" /> */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white ml-2 md:ml-0">
              管理画面
            </h1>
          </div>

          <div className="flex items-center">
            {/* User menu */}
            <div className="relative">
              <button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                {/* <UserCircleIcon className="h-8 w-8 text-gray-600 dark:text-gray-300" /> */}
                 <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </button>
              {/* Dropdown menu (tailwindcss-dropdownなどのライブラリや自前実装) */}
            </div>
            <button
              // onClick={() => signOut()} // NextAuth.js
              className="ml-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
              title="ログアウト"
            >
              {/* <LogOut size={24} /> */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;