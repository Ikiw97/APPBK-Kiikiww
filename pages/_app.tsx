import type { AppProps } from 'next/app'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Sidebar from '@/components/Sidebar'
import { AuthProvider, useAuth } from '@/lib/authContextSupabase'
import { LogOut, Menu, Bell, MessageCircle } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import ProfileEditModal from '@/components/ProfileEditModal'
import FloatingChatButton from '@/components/FloatingChatButton'
import { useFeatureSettings } from '@/lib/useFeatureSettings'
import { FeatureSettingsProvider } from '@/lib/featureSettingsContext'
import '@/styles/globals.css'

// Make sure useEffect is available in AppContent

// Component that uses auth
function AppContent({ Component, pageProps, currentPage, setCurrentPage, currentSubpage, setCurrentSubpage }: any) {
  const router = useRouter()
  const { isAuthenticated, loading, user, signOut, loadingMessage, refreshProfile } = useAuth()
  const { settings: featureSettings } = useFeatureSettings()
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)

  // Handle click outside notification dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationRef]);

  // Poll for unread messages
  useEffect(() => {
    if (!user) return;

    const fetchUnread = async () => {
      try {
        const field = user.role === 'student' ? 'unread_count_student' : 'unread_count_teacher';
        let query = supabase.from('counseling_sessions').select(field);

        if (user.role === 'student') {
          query = query.eq('student_id', user.id);
        }
        // Teachers see all or RLS handles it

        const { data, error } = await query;
        if (data) {
          const total = data.reduce((acc: number, curr: any) => acc + (curr[field] || 0), 0);
          setUnreadCount(total);
        }
      } catch (err) {
        console.error('Error fetching unread:', err);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 15000); // Check every 15s (Optimized from 5s)
    return () => clearInterval(interval);
  }, [user]);

  // Force unregister all service workers to kill PWA cache
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (let registration of registrations) {
            console.log('🗑️ Unregistering Service Worker:', registration);
            registration.unregister();
          }
        });
      });
    }
  }, []);

  // Pages that don't need authentication
  const noAuthPages = ['/login']
  const isNoAuthPage = noAuthPages.includes(router.pathname)

  // Apply theme color
  useEffect(() => {
    if (featureSettings?.system?.themeColor) {
      document.documentElement.setAttribute('data-theme', featureSettings.system.themeColor);
    }
  }, [featureSettings?.system?.themeColor]);

  // Redirect to login if not authenticated and not on login page
  useEffect(() => {
    if (!loading && !isAuthenticated && !isNoAuthPage) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, isNoAuthPage, router])

  const handleLogout = async () => {
    if (confirm('Apakah Anda yakin ingin logout?')) {
      try {
        await signOut()
        router.push('/login')
      } catch (error) {
        console.error('Logout error:', error)
      }
    }
  }

  const [showReload, setShowReload] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (loading) {
      timeout = setTimeout(() => {
        setShowReload(true);
      }, 5000); // Show reload option after 5 seconds of loading
    } else {
      setShowReload(false);
    }
    return () => clearTimeout(timeout);
  }, [loading]);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-sm w-full mx-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-6"></div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">Memuat Aplikasi</h3>


          {showReload && (
            <div className="text-center flex flex-col gap-3 animate-in fade-in duration-500">
              <div className="h-px bg-gray-100 w-full mb-2"></div>
              <p className="text-xs text-amber-600 font-medium flex items-center justify-center gap-1">
                ⚠️ Koneksi lambat atau terputus
              </p>

              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium transition-colors shadow-sm"
              >
                Muat Ulang Halaman
              </button>


            </div>
          )}
        </div>

      </div>
    )
  }

  // Login page - no layout
  if (isNoAuthPage) {
    return <Component {...pageProps} />
  }

  // Check if user has admin privileges (teacher, admin, or super_admin)
  const isAdminOrTeacher = user?.role === 'teacher' || user?.role === 'admin' || user?.isSuperAdmin;

  // Authenticated pages with layout
  if (isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          {/* Header with User Info and Logout */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm h-16 md:h-20 print:hidden">
            <div className={`flex items-center justify-between h-full px-4 md:px-6 ${isAdminOrTeacher ? 'md:ml-64' : ''} transition-all duration-300`}>
              {/* Mobile Hamburger Menu */}
              <div className="flex items-center gap-4">
                {isAdminOrTeacher && (
                  <button
                    onClick={() => setMobileSidebarOpen(!isMobileSidebarOpen)}
                    className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <Menu size={24} />
                  </button>
                )}

                {/* School Name Display in Header */}
                <div className="flex flex-col ml-2">
                  <span className="font-bold text-slate-800 text-sm md:text-base leading-tight">
                    {featureSettings?.system?.schoolName || 'BK Digital'}
                  </span>
                  <span className="text-[10px] md:text-xs text-slate-400 font-medium uppercase tracking-wider hidden sm:block">
                    Sistem Informasi Bimbingan Konseling
                  </span>
                </div>
              </div>

              {/* User Info and Logout */}
              <div className="flex items-center gap-4">
                {/* Notification Bell */}
                {/* Notification Bell & Dropdown */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className={`relative p-2 rounded-full transition-colors ${isNotificationOpen ? 'bg-slate-100 text-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}
                    title="Notifikasi Pesan"
                  >
                    <Bell size={20} className={unreadCount > 0 ? "animate-swing text-primary-600" : ""} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                    )}
                  </button>

                  {/* Dropdown Popup */}
                  {isNotificationOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h3 className="font-semibold text-slate-800 text-sm">Notifikasi</h3>
                        {unreadCount > 0 && (
                          <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">{unreadCount} Baru</span>
                        )}
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        {unreadCount > 0 ? (
                          <button
                            onClick={() => {
                              setCurrentPage('counseling-chat');
                              setIsNotificationOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-start gap-3 border-l-4 border-primary-500 bg-primary-50/10 group"
                          >
                            <div className="p-2 bg-white text-primary-600 rounded-lg shrink-0 shadow-sm border border-primary-100 group-hover:border-primary-200 transition-colors">
                              <MessageCircle size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">Pesan Konseling Baru</p>
                              <p className="text-xs text-slate-500 mt-1 leading-relaxed">Anda mendapat {unreadCount} pesan baru di sesi konseling.</p>
                              <p className="text-xs text-primary-600 font-bold mt-1.5 uppercase tracking-wide group-hover:tracking-wider transition-all">Buka Chat →</p>
                            </div>
                          </button>
                        ) : (
                          <div className="px-4 py-8 text-center text-slate-400">
                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Bell size={20} className="opacity-40" />
                            </div>
                            <p className="text-sm font-medium text-slate-600">Tidak ada notifikasi</p>
                            <p className="text-xs mt-1 text-slate-400">Pesan baru akan muncul di sini</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-xl transition-colors group"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md overflow-hidden ${user?.avatarUrl ? 'bg-white' : 'bg-gradient-to-br from-purple-500 to-pink-500'}`}>
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="font-medium text-gray-900 text-sm group-hover:text-primary-600 transition-colors">{user?.name}</p>
                  </div>
                </button>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </header>

          {isAdminOrTeacher && (
            <Sidebar
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              currentSubpage={currentSubpage}
              setCurrentSubpage={setCurrentSubpage}
              isMobileOpen={isMobileSidebarOpen}
              onMobileClose={() => setMobileSidebarOpen(false)}
            />
          )}

          <main className={`${isAdminOrTeacher ? 'md:ml-64 transition-all duration-300' : ''} ${currentPage === 'games' ? '' : 'pt-4'} print:ml-0 print:pt-0`}>
            <Component
              {...pageProps}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              currentSubpage={currentSubpage}
              setCurrentSubpage={setCurrentSubpage}
            />
          </main>

          {/* Floating Chat Button for Students */}
          {user?.role === 'student' && (
            <FloatingChatButton setCurrentPage={setCurrentPage} currentPage={currentPage} />
          )}
        </div>

        {user && (
          <ProfileEditModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            user={{
              id: user.id,
              name: user.name,
              email: user.email,
              avatarUrl: user.avatarUrl,
            }}
            onProfileUpdated={async () => {
              if (refreshProfile) await refreshProfile();
            }}
          />
        )}
      </>
    )
  }

  return null
}

export default function App({ Component, pageProps }: AppProps) {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [currentSubpage, setCurrentSubpage] = useState('daftar-asesmen')

  return (
    <FeatureSettingsProvider>
      <AuthProvider>
        <AppContent
          Component={Component}
          pageProps={pageProps}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          currentSubpage={currentSubpage}
          setCurrentSubpage={setCurrentSubpage}
        />
      </AuthProvider>
    </FeatureSettingsProvider>
  )
}
