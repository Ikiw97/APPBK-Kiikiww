import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/authContextSupabase';
import { BookOpen, LogIn, AlertCircle } from 'lucide-react';
import ParticleBackground from '@/components/ParticleBackground';

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
      <div className="min-h-screen bg-[#6953F7] flex items-center justify-center p-4 relative overflow-hidden">
        <ParticleBackground className="z-0" particleColor="rgba(255, 255, 255, 0.4)" particleCount={500} />
        <div className="w-full max-w-md relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center -mb-20 mt-6 md:-mb-28 md:mt-10">
              <img src="/icons/logo.png" alt="Logo" className="w-60 h-60 md:w-80 md:h-80 object-contain" />
            </div>
            {/* Title Removed */}
            <p className="text-blue-100 font-medium relative z-10 text-lg">Platform Manajement Guru BK</p>
          </div>

          {/* Login Options */}
          <div className="space-y-4">
            {/* Teacher Login Button */}
            <button
              onClick={() => setMode('teacher')}
              className="w-full bg-white text-gray-900 rounded-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <LogIn className="text-blue-600" size={24} />
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    Login Guru BK
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Gunakan username dan password
                  </p>
                </div>
              </div>
            </button>

            {/* Student Login Button */}
            <button
              onClick={() => setMode('student')}
              className="w-full bg-white text-gray-900 rounded-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="text-green-600" size={24} />
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    Login Siswa
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Klik di sini untuk masuk sebagai siswa
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-900 bg-opacity-50 border border-blue-400 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-blue-100 text-sm text-center">
              💡 Guru BK: Gunakan akun Anda untuk memanajement kesiswaan
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Teacher Login Screen
  if (mode === 'teacher') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-4 relative overflow-hidden">
        <ParticleBackground className="z-0" particleColor="rgba(255, 255, 255, 0.3)" particleCount={2000} />
        <div className="w-full max-w-md relative z-10">
          <div className="card p-8 shadow-2xl backdrop-blur-sm bg-white/95">
            {/* Back Button */}
            <button
              onClick={() => {
                setMode('selection');
                setError('');
                setTeacherEmail('');
                setTeacherPassword('');
              }}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm mb-6 flex items-center gap-1"
            >
              ← Kembali
            </button>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Guru BK</h1>
            <p className="text-gray-600 mb-6">
              Masukkan username dan password Anda
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleTeacherLogin} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  placeholder="Masukkan email"
                  className="input-field w-full"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={teacherPassword}
                  onChange={(e) => setTeacherPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="input-field w-full"
                  disabled={loading}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !teacherEmail || !teacherPassword}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Memproses...' : 'Login'}
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-900 text-xs font-medium mb-2">
                📝 Gunakan email dan password akun Anda
              </p>
              <p className="text-blue-800 text-xs">
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
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center p-4 relative overflow-hidden">
        <ParticleBackground className="z-0" particleColor="rgba(255, 255, 255, 0.3)" particleCount={2000} />
        <div className="w-full max-w-md relative z-10">
          <div className="card p-8 shadow-2xl backdrop-blur-sm bg-white/95">
            {/* Back Button */}
            <button
              onClick={() => {
                setMode('selection');
                setError('');
                setStudentName('');
                setStudentNIS('');
              }}
              className="text-green-600 hover:text-green-700 font-medium text-sm mb-6 flex items-center gap-1"
            >
              ← Kembali
            </button>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Login Siswa
            </h1>
            <p className="text-gray-600 mb-6">
              Silahkan masukkan nama Anda untuk mulai belajar
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  NIS (Nomor Induk Siswa)
                </label>
                <input
                  type="text"
                  value={studentNIS}
                  onChange={(e) => setStudentNIS(e.target.value)}
                  placeholder="Masukkan NIS"
                  className="input-field w-full"
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
                  className="input-field w-full"
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
                className="w-full btn-primary bg-green-600 hover:bg-green-700 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Memverifikasi...' : 'Mulai Belajar'}
              </button>
            </form>

            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-900 text-sm">
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
