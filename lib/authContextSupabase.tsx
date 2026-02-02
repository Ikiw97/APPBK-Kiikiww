import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { verifyStudentCredentials } from './siswaStorage';

export type UserRole = 'admin' | 'teacher' | 'student' | 'super_admin' | null;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive?: boolean;
  isSuperAdmin?: boolean;
  avatarUrl?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  loadingMessage?: string;
  session: any;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  loginAsStudent: (studentName: string, nis: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Memuat sistem...');

  // Initialize auth state dari Supabase session
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing auth...');

        // Retrieve session with a timeout safety to prevent infinite loading (increased to 20s)
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth initialization timeout')), 20000)
        );

        const result: any = await Promise.race([sessionPromise, timeoutPromise]);
        const { data: { session }, error: sessionError } = result;

        if (sessionError) throw sessionError;

        if (session?.user) {
          console.log('✅ Session found, loading profile...');
          // Also wrap profile loading in a timeout race (separate 5s)
          try {
            await Promise.race([
              loadUserProfile(session.user.id, session.user.email || ''),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Profile load timeout')), 5000))
            ]);
          } catch (profileError) {
            console.error('Profile load warning:', profileError);
            // Fallback: create basic user object from session if profile fails
            if (!user) {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.email?.split('@')[0] || 'User',
                role: 'student', // default safe role
              });
            }
          }
          setSession(session);
        } else {
          console.log('ℹ️ No active session found');
        }
      } catch (error: any) {
        console.error('❌ Error initializing auth:', error);

        // Critical Fix: If timeout or error occurs, force clear everything to prevent infinite loading
        if (error.message === 'Auth initialization timeout' || error.message?.includes('timeout')) {
          console.warn('⚠️ Auth timeout detected. Performing aggressive recovery.');

          // 1. Force state to loaded (stops spinner)
          setUser(null);
          setSession(null);

          // 2. Nuclear Option: Clear ALL storage to remove any corrupted state/caches
          try {
            console.log('☢️ CLEARING ALL LOCAL STORAGE');
            localStorage.clear();
          } catch (e) {
            console.error('Error clearing storage:', e);
          }

          // 3. Attempt forced sign out
          try {
            await supabase.auth.signOut();
          } catch (e) {
            // Ignore signout errors
          }

          // 4. Stop loading to show error state instead of reloading
          if (mounted) setLoading(false);
          setLoadingMessage('Gagal memuat sesi. Silahkan muat ulang.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    // DISABLED: Auth state change listener causes re-authentication on tab switch
    // This was causing infinite loading and "Akses Ditolak" issues
    /*
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth state change event:', event);
        
        setSession(session);
        
        // Only reload profile on actual auth changes, not token refreshes
        if (event === 'SIGNED_IN' && session?.user) {
          // Only load if we don't have user data yet, or if user ID changed
          if (!user || user.id !== session.user.id) {
            console.log('👤 Loading user profile for SIGNED_IN event');
            await loadUserProfile(session.user.id, session.user.email || '');
          } else {
            console.log('✅ User already loaded, skipping profile reload');
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out, clearing user data');
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Token refreshed - session is still valid, no need to reload profile
          // Just update session, keep existing user data
          console.log('🔄 Token refreshed, keeping existing user data');
          // Session is already updated above, no need to reload profile
        } else if (event === 'USER_UPDATED' && session?.user) {
          // User data was updated, reload profile
          console.log('🔄 User updated, reloading profile');
          await loadUserProfile(session.user.id, session.user.email || '');
        }
      }
    );
    */

    return () => {
      mounted = false;
      // subscription?.unsubscribe(); // Disabled along with listener
    };
  }, []);

  const loadUserProfile = async (userId: string, email: string) => {
    try {
      // Special handling for students
      if (userId.startsWith('student_')) {
        const studentId = userId.replace('student_', '');
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('id', studentId)
          .maybeSingle();

        if (studentData) {
          setUser({
            id: userId,
            email: email,
            name: studentData.nama,
            role: 'student',
            isActive: true,
            avatarUrl: studentData.avatar_url || undefined,
          });
          return;
        }
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows, which is okay for first login
        throw error;
      }

      // Check if user is a super admin
      let isSuperAdmin = false;
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('is_super_admin')
        .eq('id', userId)
        .maybeSingle();

      isSuperAdmin = adminData?.is_super_admin || false;

      if (data) {
        setUser({
          id: userId,
          email: data.email,
          name: data.full_name || email,
          role: (data.role as UserRole) || 'student',
          isActive: data.is_active,
          isSuperAdmin,
          avatarUrl: data.avatar_url || undefined,
        });
      } else {
        // Profile doesn't exist yet (first login)
        setUser({
          id: userId,
          email: email,
          name: email.split('@')[0],
          role: 'student',
          isSuperAdmin,
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  // Refresh profile data (call after profile update)
  const refreshProfile = async () => {
    if (user?.id && user?.email) {
      await loadUserProfile(user.id, user.email);
    }
  };

  // Helper for nuclear reset
  const nuclearReset = async () => {
    console.warn('⚠️ Performing nuclear reset...');

    // 1. Force state to loaded (stops spinner)
    setUser(null);
    setSession(null);
    setLoadingMessage('Cleaning up...');

    // 2. Clear all storage
    try {
      console.log('☢️ CLEARING LOCAL & SESSION STORAGE');
      localStorage.clear();
      sessionStorage.clear();

      // Clear Cookies if possible (simple generic clear)
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Clear CacheStorage (PWA)
      if ('caches' in window) {
        console.log('☢️ CLEARING CACHE STORAGE');
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
      }
    } catch (e) {
      console.error('Error clearing storage:', e);
    }

    // 3. Attempt forced sign out
    try {
      await supabase.auth.signOut();
    } catch (e) { }

    // 4. Force Reload
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  // Helper for safe auth calls with timeout
  const safeAuthCall = async (promise: Promise<any>, errorMessage: string) => {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Auth timeout')), 5000)
      );
      return await Promise.race([promise, timeoutPromise]);
    } catch (error: any) {
      if (error.message === 'Auth timeout' || error.message?.includes('timeout')) {
        await nuclearReset();
        throw new Error('Connection timeout - Resetting application...');
      }
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    setLoadingMessage('Mendaftarkan akun...');
    try {
      // Sign up dengan Supabase Auth wrapped in safety timeout
      const { data, error } = await safeAuthCall(
        supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        }),
        'Sign up timeout'
      );

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        setLoadingMessage('Memuat profil...');
        // Tunggu user_profile dibuat via trigger
        await new Promise(resolve => setTimeout(resolve, 1000));
        await loadUserProfile(data.user.id, email);
      }

      console.log('✅ Sign up successful');
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      if (typeof window !== 'undefined') setLoading(false);
      setLoadingMessage('');
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setLoadingMessage('Masuk ke aplikasi...');
    try {
      const { data, error } = await safeAuthCall(
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        'Sign in timeout'
      );

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        setLoadingMessage('Memuat data pengguna...');
        await loadUserProfile(data.user.id, data.user.email || email);
      }

      console.log('✅ Sign in successful');
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      if (typeof window !== 'undefined') setLoading(false);
      setLoadingMessage('');
    }
  };

  const loginAsStudent = async (studentName: string, nis: string) => {
    setLoading(true);
    setLoadingMessage('Verifikasi data siswa...');
    try {
      await safeAuthCall(
        (async () => {
          if (!studentName.trim() || !nis.trim()) {
            throw new Error('Nama dan NIS tidak boleh kosong');
          }

          // Verify against master data
          const verifiedStudent = await verifyStudentCredentials(studentName, nis);

          if (!verifiedStudent) {
            throw new Error('Login gagal. Nama atau NIS tidak ditemukan di daftar siswa.');
          }

          setLoadingMessage('Masuk sebagai siswa...');

          // Use the real existing ID from the verify function but ensure session matches
          // For auth context simplicity we use a generated session ID but attach real verification data
          const sessionUserId = `student_${verifiedStudent.id}`;

          const student: AuthUser = {
            id: sessionUserId,
            email: `${verifiedStudent.nis}@student.local`, // Use NIS as fake email identifier
            name: verifiedStudent.nama,
            role: 'student',
            isActive: true,
            avatarUrl: (verifiedStudent as any).avatarUrl || undefined,
          };

          // Persist the real student data reference if needed later
          // For now, the user object is enough for the UI to know who is logged in

          setUser(student);
          console.log('✅ Student login verified and successful');
        })(),
        'Student login timeout'
      );
    } catch (error) {
      console.error('Student login error:', error);
      throw error;
    } finally {
      if (typeof window !== 'undefined') setLoading(false);
      setLoadingMessage('');
    }
  };

  const signOut = async () => {
    setLoading(true);
    setLoadingMessage('Keluar...');
    try {
      const { error } = await safeAuthCall(supabase.auth.signOut(), 'Sign out timeout');
      if (error) throw error;

      setUser(null);
      setSession(null);
      console.log('✅ Sign out successful');
    } catch (error) {
      console.error('Sign out error:', error);
      // Determine if we should nuclear reset on signout fail? Maybe not necessary, but safe.
      // throw error; 
    } finally {
      if (typeof window !== 'undefined') setLoading(false);
      setLoadingMessage('');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    loadingMessage,
    session,
    signUpWithEmail,
    signInWithEmail,
    loginAsStudent,
    signOut,
    refreshProfile,
    isAuthenticated: user !== null,
    isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Helper hooks
export function useIsAdmin() {
  const { isAdmin } = useAuth();
  return isAdmin;
}

export function useIsTeacher() {
  const { isTeacher } = useAuth();
  return isTeacher;
}

export function useIsStudent() {
  const { isStudent } = useAuth();
  return isStudent;
}
