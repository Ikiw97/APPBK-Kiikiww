/**
 * ⚠️ DEPRECATED: This file is deprecated and no longer used.
 *
 * The project now uses `authContextSupabase.tsx` for authentication.
 * This file is kept for reference only.
 *
 * Do NOT import from this file. Use:
 * - import { useAuth, AuthProvider } from '@/lib/authContextSupabase'
 *
 * This file will be removed in a future version.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'teacher' | 'student' | null;

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  loginAsTeacher: (username: string, password: string) => Promise<void>;
  loginAsStudent: (studentName: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('bk_auth_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading stored user:', error);
        localStorage.removeItem('bk_auth_user');
      }
    }
    setLoading(false);
  }, []);

  const loginAsTeacher = async (username: string, password: string) => {
    setLoading(true);
    try {
      // Try Supabase first
      try {
        const { supabase } = await import('./supabaseClient');

        // Query teachers table
        const { data, error } = await supabase
          .from('teachers')
          .select('*')
          .eq('username', username)
          .eq('password', password)
          .single();

        if (error || !data) {
          throw new Error('Username atau password salah');
        }

        const teacher: AuthUser = {
          id: data.id,
          name: data.name || username,
          role: 'teacher',
        };

        setUser(teacher);
        localStorage.setItem('bk_auth_user', JSON.stringify(teacher));
        return;
      } catch (supabaseError: any) {
        // If Supabase is not available, use demo account
        if (username === 'teacher' && password === 'password123') {
          const teacher: AuthUser = {
            id: 'demo_teacher_1',
            name: 'Guru BK Demo',
            role: 'teacher',
          };

          setUser(teacher);
          localStorage.setItem('bk_auth_user', JSON.stringify(teacher));
          return;
        }

        throw new Error('Username atau password salah');
      }
    } finally {
      setLoading(false);
    }
  };

  const loginAsStudent = async (studentName: string) => {
    setLoading(true);
    try {
      if (!studentName.trim()) {
        throw new Error('Nama siswa tidak boleh kosong');
      }

      // Create a unique ID for the student (can be deterministic or UUID)
      const studentId = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const student: AuthUser = {
        id: studentId,
        name: studentName.trim(),
        role: 'student',
      };

      setUser(student);
      localStorage.setItem('bk_auth_user', JSON.stringify(student));
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bk_auth_user');
  };

  const value: AuthContextType = {
    user,
    loading,
    loginAsTeacher,
    loginAsStudent,
    logout,
    isAuthenticated: user !== null,
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
