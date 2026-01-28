import { useRouter } from 'next/router';
import { useAuth, UserRole } from './authContextSupabase';
import React from 'react';

interface WithAuthProps {
  requiredRole?: UserRole[];
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: WithAuthProps
) {
  return function ProtectedComponent(props: P) {
    const router = useRouter();
    const { user, loading } = useAuth();

    React.useEffect(() => {
      if (loading) return; // Still loading auth state

      if (!user) {
        // Not authenticated, redirect to login
        router.push('/login');
        return;
      }

      // Check if required role matches
      if (options?.requiredRole && !options.requiredRole.includes(user.role)) {
        // User doesn't have required role
        router.push('/');
        return;
      }
    }, [user, loading, router]);

    // Show nothing while loading or redirecting
    if (loading || !user) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat...</p>
          </div>
        </div>
      );
    }

    // Check if user has required role
    if (options?.requiredRole && !options.requiredRole.includes(user.role)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Akses Ditolak
            </h1>
            <p className="text-gray-600 mb-6">
              Anda tidak memiliki akses ke halaman ini
            </p>
            <button
              onClick={() => router.push('/')}
              className="btn-primary"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// Hook to check if user has specific role
export function useIsRole(role: UserRole) {
  const { user } = useAuth();
  return user?.role === role;
}

// Hook to check if user is teacher
export function useIsTeacher() {
  return useIsRole('teacher');
}

// Hook to check if user is student
export function useIsStudent() {
  return useIsRole('student');
}
