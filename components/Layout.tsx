import React, { useState } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <main className={`transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} pt-16 md:pt-0`}>
        {React.isValidElement(children) ? (
          React.cloneElement(children, {
            currentPage,
            setCurrentPage,
          })
        ) : (
          children
        )}
      </main>
    </div>
  );
}
