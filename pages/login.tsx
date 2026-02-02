import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/authContextSupabase';
import { LogIn, BookOpen, AlertCircle, Eye, EyeOff } from 'lucide-react';

type LoginMode = 'selection' | 'teacher' | 'student';

export default function LoginPage() {
  const router = useRouter();
  const { signInWithEmail, loginAsStudent, isAuthenticated } = useAuth();

  const [mode, setMode] = useState<LoginMode>('selection');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Teacher login state
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Student login state
  const [studentName, setStudentName] = useState('');
  const [studentNIS, setStudentNIS] = useState('');

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmail(teacherEmail, teacherPassword);
      router.push('/');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Login gagal. Silahkan coba lagi.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await loginAsStudent(studentName, studentNIS);
      router.push('/');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Login gagal. Silahkan coba lagi.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Login Selection Screen
  if (mode === 'selection') {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{
          backgroundImage: 'url(/icons/bglogin.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Animated Flower Decoration */}
        <div className="absolute bottom-0 right-0 z-0 pointer-events-none">
          <img
            src="/icons/flower.png"
            alt="Flower decoration"
            className="h-48 md:h-64 lg:h-80 object-contain animate-flower-sway"
            style={{
              transformOrigin: 'bottom center',
              animation: 'flowerSway 3s ease-in-out infinite',
              transform: 'scaleX(-1)'
            }}
          />
        </div>

        {/* CSS Animation */}
        <style jsx>{`
          @keyframes flowerSway {
            0%, 100% {
              transform: scaleX(-1) rotate(-3deg);
            }
            50% {
              transform: scaleX(-1) rotate(3deg);
            }
          }
        `}</style>
        {/* Card Container - Positioned to the right */}
        <div className="w-full max-w-md mx-auto md:ml-auto md:mr-32 lg:mr-52">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <img
                src="/icons/logo.png"
                alt="RuangBK Logo"
                className="h-20 object-contain"
              />
            </div>

            {/* Login Options */}
            <div className="space-y-4">
              {/* Teacher Login Button */}
              <button
                onClick={() => setMode('teacher')}
                className="w-full bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                    <LogIn className="text-blue-600" size={22} />
                  </div>
                  <div className="text-left">
                    <h2 className="text-lg font-bold text-gray-900">
                      Login Guru BK
                    </h2>
                    <p className="text-gray-500 text-sm">
                      Gunakan username dan password
                    </p>
                  </div>
                </div>
              </button>

              {/* Student Login Button */}
              <button
                onClick={() => setMode('student')}
                className="w-full bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-green-400 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 transition-colors">
                    <BookOpen className="text-green-600" size={22} />
                  </div>
                  <div className="text-left">
                    <h2 className="text-lg font-bold text-gray-900">
                      Login Siswa
                    </h2>
                    <p className="text-gray-500 text-sm">
                      Klik di sini untuk masuk sebagai siswa
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-[#1e3a5f] rounded-xl p-4">
              <p className="text-white text-sm text-center">
                💡 Guru BK: Gunakan akun Anda untuk memanajement kesiswaan
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Teacher Login Screen
  if (mode === 'teacher') {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{
          backgroundImage: 'url(/icons/bglogin.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Animated Flower Decoration */}
        <div className="absolute bottom-0 right-0 z-0 pointer-events-none">
          <img
            src="/icons/flower.png"
            alt="Flower decoration"
            className="h-48 md:h-64 lg:h-80 object-contain"
            style={{
              transformOrigin: 'bottom center',
              animation: 'flowerSway 3s ease-in-out infinite',
              transform: 'scaleX(-1)'
            }}
          />
        </div>

        {/* CSS Animation */}
        <style jsx>{`
          @keyframes flowerSway {
            0%, 100% {
              transform: scaleX(-1) rotate(-3deg);
            }
            50% {
              transform: scaleX(-1) rotate(3deg);
            }
          }
        `}</style>
        {/* Card Container - Positioned to the right */}
        <div className="w-full max-w-md mx-auto md:ml-auto md:mr-32 lg:mr-52">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* Back Button */}
            <button
              onClick={() => {
                setMode('selection');
                setError('');
                setTeacherEmail('');
                setTeacherPassword('');
              }}
              className="text-gray-600 hover:text-gray-800 font-medium text-sm mb-6 flex items-center gap-1"
            >
              ← Kembali
            </button>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Guru BK</h1>
            <p className="text-gray-500 mb-6">
              Masukkan username dan password Anda
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleTeacherLogin} className="space-y-5">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  placeholder="Alamat Email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 pr-10"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !teacherEmail || !teacherPassword}
                className="w-full py-3 bg-[#1e3a5f] text-white font-semibold rounded-lg hover:bg-[#2a4a73] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Memproses...' : 'Login'}
              </button>
            </form>

            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 text-sm font-medium mb-1">
                🎉 Gunakan email dan password akun Anda
              </p>
              <p className="text-amber-700 text-xs">
                Jika belum memiliki akun, hubungi administrator untuk membuat akun baru
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Student Login Screen
  if (mode === 'student') {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{
          backgroundImage: 'url(/icons/bglogin.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Animated Flower Decoration */}
        <div className="absolute bottom-0 right-0 z-0 pointer-events-none">
          <img
            src="/icons/flower.png"
            alt="Flower decoration"
            className="h-48 md:h-64 lg:h-80 object-contain"
            style={{
              transformOrigin: 'bottom center',
              animation: 'flowerSway 3s ease-in-out infinite',
              transform: 'scaleX(-1)'
            }}
          />
        </div>

        {/* CSS Animation */}
        <style jsx>{`
          @keyframes flowerSway {
            0%, 100% {
              transform: scaleX(-1) rotate(-3deg);
            }
            50% {
              transform: scaleX(-1) rotate(3deg);
            }
          }
        `}</style>
        {/* Card Container - Positioned to the right */}
        <div className="w-full max-w-md ml-auto mr-8 md:mr-16 lg:mr-24">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* Back Button */}
            <button
              onClick={() => {
                setMode('selection');
                setError('');
                setStudentName('');
                setStudentNIS('');
              }}
              className="text-gray-600 hover:text-gray-800 font-medium text-sm mb-6 flex items-center gap-1"
            >
              ← Kembali
            </button>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Login Siswa
            </h1>
            <p className="text-gray-500 mb-6">
              Silahkan masukkan nama Anda untuk mulai belajar
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleStudentLogin} className="space-y-5">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  NIS (Nomor Induk Siswa)
                </label>
                <input
                  type="text"
                  value={studentNIS}
                  onChange={(e) => setStudentNIS(e.target.value)}
                  placeholder="Masukkan NIS"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                  disabled={loading}
                  required
                />
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800 flex gap-2">
                  <span className="text-lg">💡</span>
                  <span>
                    Pastikan Nama dan NIS sesuai dengan data yang terdaftar di sistem.
                  </span>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !studentName || !studentNIS}
                className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Memverifikasi...' : 'Mulai Belajar'}
              </button>
            </form>

            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">
                ✨ Cukup masukkan nama Anda untuk memulai asesmen
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
