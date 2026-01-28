import React, { useState } from 'react';
import { BarChart3, BookOpen, Settings, ChevronLeft, ChevronRight, Menu, X, ChevronDown, Code, Users, Zap, Gamepad2, Shield, ClipboardList, Database, Calendar } from 'lucide-react';
import { useFeatureSettings } from '@/lib/useFeatureSettings';

interface SidebarProps {
  currentPage: string;
  currentSubpage?: string;
  setCurrentPage: (page: string) => void;
  setCurrentSubpage?: (subpage: string) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

import { useAuth } from '@/lib/authContextSupabase';

export default function Sidebar({
  currentPage,
  currentSubpage,
  setCurrentPage,
  setCurrentSubpage,
  isMobileOpen = false,
  onMobileClose
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>('assessment');

  const { settings } = useFeatureSettings();
  const { user } = useAuth();

  // Helper to determine visibility
  const isFeatureVisible = (isVisibleFn: () => boolean) => {
    // If user is admin or teacher, always show (or you can create specific admin logic)
    // Assuming 'student' is the role to restrict.
    const role = user?.role as string;
    if (role === 'admin' || role === 'teacher' || role === 'super_admin') {
      return true;
    }
    // For students (or guests), check settings
    return isVisibleFn();
  };

  // Organization of sidebar items
  const navGroups = [
    {
      title: 'Menu Utama',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: BarChart3,
          submenu: null,
          visible: true
        }
      ]
    },
    {
      title: 'Instrumen & Media',
      items: [
        {
          id: 'assessment',
          label: 'Assessment',
          icon: BookOpen,
          submenu: [
            { id: 'daftar-asesmen', label: 'Daftar Asesmen' },
            { id: 'hasil-asesmen', label: 'Hasil Asesmen' },
          ],
          visible: isFeatureVisible(() => settings ? Object.values(settings.assessments).some(v => v) : true)
        },
        {
          id: 'sosiometri',
          label: 'Sosiometri',
          icon: Users,
          submenu: null,
          visible: isFeatureVisible(() => settings ? settings.assessments.sociometry : true)
        },
        {
          id: 'games',
          label: 'Games',
          icon: Gamepad2,
          submenu: null,
          visible: isFeatureVisible(() => settings ? Object.values(settings.games).some(v => v) : true)
        },
        {
          id: 'latihan-tes',
          label: 'Latihan Tes',
          icon: Zap,
          submenu: null,
          visible: isFeatureVisible(() => settings ? Object.values(settings.exercises).some(v => v) : true)
        }
      ]
    },
    {
      title: 'Layanan BK',
      items: [
        {
          id: 'rpl',
          label: 'RPL',
          icon: Code,
          submenu: null,
          visible: true
        },
        {
          id: 'case-management',
          label: 'Manajemen Kasus',
          icon: ClipboardList,
          submenu: null,
          visible: true
        },
        {
          id: 'counseling-schedule',
          label: 'Jadwal Konseling',
          icon: Calendar,
          submenu: null,
          visible: true
        },
        {
          id: 'absensi',
          label: 'Absensi Siswa',
          icon: Users,
          submenu: null,
          visible: true
        },
        {
          id: 'counseling-report',
          label: 'Laporan Bimbingan Konseling',
          icon: ClipboardList,
          submenu: null,
          visible: true
        },
        {
          id: 'parent-guest-book',
          label: 'Buku Tamu Ortu',
          icon: Users,
          submenu: null,
          visible: true
        }
      ]
    },
    {
      title: 'Pengaturan System',
      items: [
        {
          id: 'data-master',
          label: 'Data Master',
          icon: Database,
          submenu: [
            { id: 'data-siswa', label: 'Data Siswa' }
          ],
          visible: true
        },
        {
          id: 'admin-accounts',
          label: 'Manajemen Admin',
          icon: Shield,
          submenu: null,
          visible: true
        },
        {
          id: 'pengaturan',
          label: 'Pengaturan',
          icon: Settings,
          submenu: null,
          visible: true
        }
      ]
    }
  ];

  const handleNavClick = (pageId: string, subpageId?: string) => {
    setCurrentPage(pageId);
    if (setCurrentSubpage) {
      setCurrentSubpage(subpageId || '');
    }
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const toggleMenu = (menuId: string) => {
    setExpandedMenu(expandedMenu === menuId ? null : menuId);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-40"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-slate-900 text-slate-300 shadow-xl transition-all duration-300 z-50 flex flex-col ${isCollapsed ? 'w-20' : 'w-64'
          } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 border-r border-slate-800 print:hidden`}
      >
        {/* Logo Section */}
        <div className="p-6 flex items-center justify-center min-h-[5rem]">
          <div className="flex items-center justify-center w-full">
            <div className={`transition-all duration-300 ${isCollapsed ? 'w-12 h-12' : 'w-40 h-auto'}`}>
              <img src="/icons/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto custom-scrollbar">
          {navGroups.map((group, groupIndex) => {
            // Filter visible items first
            const visibleItems = group.items.filter(item => item.visible);

            if (visibleItems.length === 0) return null;

            return (
              <div key={groupIndex} className="space-y-1">
                {!isCollapsed && group.title && (
                  <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    {group.title}
                  </h3>
                )}

                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  const isMenuExpanded = expandedMenu === item.id;
                  const hasSubmenu = item.submenu && item.submenu.length > 0;

                  return (
                    <div key={item.id}>
                      {/* Main Menu Item */}
                      <button
                        onClick={() => {
                          if (hasSubmenu) {
                            toggleMenu(item.id);
                          } else {
                            handleNavClick(item.id);
                          }
                        }}
                        className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive
                          ? 'bg-blue-600/10 text-blue-400'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                          }`}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <Icon size={20} className={`flex-shrink-0 transition-all duration-200 ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200 group-hover:scale-110 group-hover:-translate-y-0.5'}`} />
                        {!isCollapsed && (
                          <>
                            <span className={`font-medium flex-1 text-left text-sm ${isActive ? 'text-blue-100' : ''}`}>
                              {item.label}
                            </span>
                            {hasSubmenu && (
                              <ChevronDown
                                size={16}
                                className={`text-slate-500 transition-transform duration-200 ${isMenuExpanded ? 'rotate-180' : ''
                                  }`}
                              />
                            )}
                          </>
                        )}
                      </button>

                      {/* Submenu Items */}
                      {hasSubmenu && isMenuExpanded && !isCollapsed && (
                        <div className="ml-4 mt-1 space-y-0.5 border-l border-slate-800 pl-3 py-1">
                          {item.submenu!.map((subitem) => {
                            const isSubActive = currentPage === item.id && currentSubpage === subitem.id;
                            return (
                              <button
                                key={subitem.id}
                                onClick={() => handleNavClick(item.id, subitem.id)}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-200 ${isSubActive
                                  ? 'text-blue-400 font-medium bg-blue-600/5'
                                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                                  }`}
                              >
                                {subitem.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/50">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex w-full items-center justify-center gap-2 px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!isCollapsed && <span className="text-xs">Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
