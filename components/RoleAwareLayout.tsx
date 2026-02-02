import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/authContextSupabase';
import { LogOut, Home, Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import FloatingChatButton from './FloatingChatButton';

interface RoleAwareLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  currentPage?: string;
  setCurrentPage?: (page: string) => void;
}

import { useFeatureSettings } from '@/lib/useFeatureSettings';

export default function RoleAwareLayout({
  children,
  showSidebar = true,
  currentPage = 'dashboard',
  setCurrentPage,
}: RoleAwareLayoutProps) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { settings } = useFeatureSettings();
  const [sidebarPage, setSidebarPage] = useState(currentPage);

  const handleLogout = async () => {
    if (confirm('Apakah Anda yakin ingin logout?')) {
      try {
        await signOut();
        router.push('/login');
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  };

  // Check if user has admin privileges (teacher, admin, or super_admin) or is student (Sidebar now handles filtering)
  const isAdminOrTeacher = user?.role === 'teacher' || user?.role === 'admin' || user?.isSuperAdmin;
  // Previously we hid sidebar for students, now we show it but Sidebar.tsx filters items
  const showSidebarCurrent = showSidebar; // Always show sidebar if page requests it (Sidebar component handles access control internally)
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with User Info and Logout */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 print:hidden">
        <div className="flex items-center justify-between px-4 md:px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            {/* Mobile Hamburger Menu */}
            {showSidebarCurrent && (
              <button
                onClick={() => setMobileSidebarOpen(!isMobileSidebarOpen)}
                className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Menu size={24} />
              </button>
            )}

            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center hidden sm:flex">
              <Home className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-lg sm:text-base">BK Dashboard</h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                {user?.role === 'student' ? '👨‍🎓 Siswa' : '👨‍🏫 Admin Panel'}
              </p>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="font-medium text-gray-900 text-sm">{user?.name}</p>
              <p className="text-xs text-gray-500">
                {user?.role === 'student' ? 'Siswa' : 'Admin'}
              </p>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - For Teachers/Admins */}
        {showSidebarCurrent && (
          <Sidebar
            currentPage={sidebarPage}
            setCurrentPage={setCurrentPage || setSidebarPage}
            isMobileOpen={isMobileSidebarOpen}
            onMobileClose={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main
          className={`flex-1 ${showSidebarCurrent ? '' : 'w-full'
            }`}
        >
          {children}
        </main>
      </div>

      {/* Student-only UI Elements */}
      {user?.role === 'student' && (
        <>
          <FloatingChatButton setCurrentPage={setCurrentPage} />
          <StudentFooter />
        </>
      )}
    </div>
  );
}

function StudentFooter() {
  const router = useRouter();

  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Tentang</h3>
            <p className="text-sm text-gray-600">
              Platform asesmen konseling untuk membantu perjalanan akademik Anda
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Kontak</h3>
            <p className="text-sm text-gray-600">
              Hubungi guru BK Anda untuk pertanyaan lebih lanjut
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Bantuan</h3>
            <p className="text-sm text-gray-600">
              Untuk bantuan teknis, hubungi admin sekolah
            </p>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-6 text-center text-sm text-gray-600">
          <p>© 2024 BK Dashboard. Semua hak dilindungi.</p>
        </div>
      </div>
    </footer>
  );
}
