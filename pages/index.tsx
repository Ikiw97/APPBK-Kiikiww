import React, { useState, useEffect } from 'react';
import {
  BookOpen, BarChart3, Settings, Eye, AlertCircle, Users, Activity,
  FileText, Calendar, Database, Gamepad2, PenTool, CheckSquare, UserCog, Clock
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useAuth } from '@/lib/authContextSupabase';
import AssessmentList from '@/components/AssessmentList';
import AKPDAssessmentForm from '@/components/AKPDAssessmentForm';
import AssessmentForm from '@/components/AssessmentForm';
import ResultsView from '@/components/ResultsView';
import QuestionEditor from '@/components/QuestionEditor';
import GameQuestionEditor from '@/components/GameQuestionEditor';
import AbsensiSMP from '@/components/AbsensiSMP';
import AdminSettings from '@/components/AdminSettings';
import AdminAccountManagement from '@/components/AdminAccountManagement';
import StudentDashboard from '@/components/StudentDashboard';
import GameSelector from '@/components/GameSelector';

import PsikotestForm from '@/components/PsikotestForm'; // Keep for reference or if used elsewhere, but mainly replaced by ExerciseSelector
import ExerciseSelector from '@/components/ExerciseSelector';
import CaseManagement from '@/components/CaseManagement';
import CounselingSchedule from '@/components/CounselingSchedule';
import ManajemenSiswaKelas from '@/components/ManajemenSiswaKelas';
import SociometryWrapper from '@/components/SociometryWrapper';
import RPLGenerator from '@/components/RPLGenerator';
import CounselingReport from '@/components/CounselingReport';
import ParentGuestBook from '@/components/ParentGuestBook';
import { useFeatureSettings } from '@/lib/useFeatureSettings';
import { saveFeatureSettings } from '@/lib/featureSettings';
import type { SchoolMode } from '@/lib/classHelper';
import { getAllSiswaData } from '@/lib/siswaStorage';

interface HomeProps {
  currentPage?: string;
  setCurrentPage?: (page: string) => void;
  currentSubpage?: string;
  setCurrentSubpage?: (subpage: string) => void;
}

export default function Home({
  currentPage = 'dashboard',
  setCurrentPage,
  currentSubpage = 'daftar-asesmen',
  setCurrentSubpage
}: HomeProps) {
  const { user } = useAuth();
  const { settings: featureSettings, loading: settingsLoading } = useFeatureSettings();



  const [studentCurrentPage, setStudentCurrentPage] = useState<string>('dashboard');
  const [settingsSubMenu, setSettingsSubMenu] = useState<'main' | 'questions' | 'feature-access'>('main');
  const [gameEditorOpen, setGameEditorOpen] = useState(false);
  const [showStudentPreview, setShowStudentPreview] = useState(false);
  const [schoolMode, setSchoolMode] = useState<'smp' | 'sma_smk'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('schoolMode') as 'smp' | 'sma_smk') || 'smp';
    }
    return 'smp';
  });
  const [registeredStudentCount, setRegisteredStudentCount] = useState<number>(0);
  const [participatingStudentCount, setParticipatingStudentCount] = useState<number>(0);
  const [assessmentCount, setAssessmentCount] = useState<number>(0);
  const [counselingCount, setCounselingCount] = useState<number>(0);
  const [rplCount, setRplCount] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);


  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch registered student count from Data Master (siswaStorage)
        const allSiswa = await getAllSiswaData();
        const totalStudents = Object.values(allSiswa).reduce((sum, siswaList) => sum + siswaList.length, 0);
        setRegisteredStudentCount(totalStudents);

        // Fetch participating student count (Previously studentCount)
        const participatingRes = await fetch('/api/admin/get-student-count');
        const participatingData = await participatingRes.json();
        if (participatingData.success && participatingData.count !== undefined) {
          setParticipatingStudentCount(participatingData.count);
        }

        // Fetch assessment count (Total Submissions)
        const assessmentRes = await fetch('/api/admin/get-assessment-count');
        const assessmentData = await assessmentRes.json();
        if (assessmentData.success && assessmentData.count !== undefined) {
          setAssessmentCount(assessmentData.count);
        }

        // Fetch counseling count
        const counselingRes = await fetch('/api/admin/get-counseling-count');
        const counselingData = await counselingRes.json();
        if (counselingData.success && counselingData.count !== undefined) {
          setCounselingCount(counselingData.count);
        }

        // Fetch RPL count
        const rplRes = await fetch('/api/admin/get-rpl-count');
        const rplData = await rplRes.json();
        if (rplData.success && rplData.count !== undefined) {
          setRplCount(rplData.count);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    if (user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'super_admin') {
      fetchData();
    }
  }, [user]);

  const handleSetSchoolMode = (mode: SchoolMode) => {
    setSchoolMode(mode);
    localStorage.setItem('schoolMode', mode);
  };

  const handleSetCurrentPage = (page: string) => {
    if (setCurrentPage) {
      setCurrentPage(page);
    }
    // Clear subpage when changing main page to prevent stuck state
    if (setCurrentSubpage) {
      setCurrentSubpage('');
    }
  };

  const handleSetCurrentSubpage = (subpage: string) => {
    if (setCurrentSubpage) {
      setCurrentSubpage(subpage);
    }
  };

  // Dashboard view with statistics, charts, and categorized menu
  const renderDashboard = () => {
    // Dummy Data for Charts
    const activityData = [
      { name: 'Sen', value: 45 },
      { name: 'Sel', value: 52 },
      { name: 'Rab', value: 38 },
      { name: 'Kam', value: 65 },
      { name: 'Jum', value: 48 },
      { name: 'Sab', value: 25 },
    ];

    // Dynamic Assessment Status Data
    const notParticipatingCount = Math.max(0, registeredStudentCount - participatingStudentCount);
    const assessmentStatusData = [
      { name: 'Selesai', value: participatingStudentCount },
      { name: 'Belum', value: notParticipatingCount },
    ];
    const PIE_COLORS = ['#3b82f6', '#e2e8f0']; // Blue-500, Slate-200

    return (
      <div className="px-6 md:px-10 py-10 bg-[#FAFAFA] min-h-screen font-sans">
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
              Dashboard
            </h1>
            <p className="text-slate-500 font-medium">
              Ikhtisar aktivitas dan layanan Bimbingan Konseling.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              <Clock size={16} className="text-blue-600" />
              <span className="font-bold text-slate-900">
                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <div className="text-sm font-semibold text-slate-800 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              {currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Top Stats Cards - Simple & Elegant */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Siswa', value: registeredStudentCount || '0', sub: 'Terdaftar', icon: Users, color: 'text-blue-600' },
            { label: 'Asesmen', value: assessmentCount || '0', sub: 'Partisipasi', icon: BarChart3, color: 'text-emerald-600' },
            { label: 'Konseling', value: counselingCount || '0', sub: 'Total', icon: Calendar, color: 'text-violet-600' },
            { label: 'RPL', value: rplCount || '0', sub: 'Tersimpan', icon: FileText, color: 'text-amber-600' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-slate-500 text-sm font-semibold mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
                </div>
                <div className={`p-2.5 bg-slate-50 rounded-xl ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-400">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Trend Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800">Trend Aktivitas Siswa</h3>
              <select className="text-xs bg-slate-50 border-none rounded-lg px-3 py-1.5 text-slate-600 font-medium cursor-pointer focus:ring-0">
                <option>Minggu Ini</option>
                <option>Bulan Ini</option>
              </select>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Assessment Distribution Pie Chart */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Status Asesmen</h3>
            <p className="text-slate-400 text-xs mb-6">Partisipasi siswa dalam asesmen aktif</p>
            <div className="h-[200px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assessmentStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {assessmentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <span className="block text-2xl font-bold text-slate-800">
                  {registeredStudentCount > 0 ? Math.round((participatingStudentCount / registeredStudentCount) * 100) : 0}%
                </span>
                <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-wider">Selesai</span>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs text-slate-500">Sudah</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                <span className="text-xs text-slate-500">Belum</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Navigation - Simplified Lists */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-6 px-1">Menu Utama</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Group 1: Layanan */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Layanan</h3>
              {[
                { title: 'RPL Generator', page: 'rpl', icon: FileText, color: 'text-blue-600' },
                { title: 'Jadwal Konseling', page: 'counseling-schedule', icon: Calendar, color: 'text-violet-600' },
                { title: 'Buku Kasus', page: 'case-management', icon: AlertCircle, color: 'text-red-600' },
              ].map((item, i) => (
                <div key={i} onClick={() => handleSetCurrentPage(item.page)} className="group flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-sm cursor-pointer transition-all">
                  <div className={`p-2 rounded-lg bg-slate-50 group-hover:bg-white transition-colors ${item.color}`}>
                    <item.icon size={18} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">{item.title}</span>
                </div>
              ))}
            </div>

            {/* Group 2: Instrumen */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Instrumen</h3>
              {[
                { title: 'Bank Asesmen', page: 'assessment', icon: BookOpen, color: 'text-emerald-600' },
                { title: 'Hasil Asesmen', page: 'assessment', subpage: 'hasil-asesmen', icon: BarChart3, color: 'text-emerald-600' },
                { title: 'Sosiometri', page: 'sosiometri', icon: Users, color: 'text-emerald-600' },
              ].map((item, i) => (
                <div
                  key={i}
                  onClick={() => {
                    handleSetCurrentPage(item.page);
                    if (item.subpage) handleSetCurrentSubpage(item.subpage);
                  }}
                  className="group flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 hover:border-emerald-200 hover:shadow-sm cursor-pointer transition-all"
                >
                  <div className={`p-2 rounded-lg bg-slate-50 group-hover:bg-white transition-colors ${item.color}`}>
                    <item.icon size={18} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">{item.title}</span>
                </div>
              ))}
            </div>

            {/* Group 3: Media */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Media & Siswa</h3>
              {[
                { title: 'Games', page: 'games', icon: Gamepad2, color: 'text-orange-500' },
                { title: 'Latihan Tes', page: 'latihan-tes', icon: PenTool, color: 'text-orange-500' },
                { title: 'Absensi', page: 'absensi', icon: CheckSquare, color: 'text-orange-500' },
              ].map((item, i) => (
                <div key={i} onClick={() => handleSetCurrentPage(item.page)} className="group flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 hover:border-amber-200 hover:shadow-sm cursor-pointer transition-all">
                  <div className={`p-2 rounded-lg bg-slate-50 group-hover:bg-white transition-colors ${item.color}`}>
                    <item.icon size={18} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">{item.title}</span>
                </div>
              ))}
            </div>

            {/* Group 4: Sistem */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Sistem</h3>
              {[
                { title: 'Manajemen User', page: 'admin-accounts', icon: UserCog, color: 'text-slate-600' },
                { title: 'Settings', page: 'pengaturan', icon: Settings, color: 'text-slate-600' },
                { title: 'Preview Siswa', action: () => setShowStudentPreview(true), icon: Eye, color: 'text-purple-600' },
              ].map((item, i) => (
                <div key={i} onClick={item.action || (() => handleSetCurrentPage(item.page))} className="group flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 hover:border-slate-300 hover:shadow-sm cursor-pointer transition-all">
                  <div className={`p-2 rounded-lg bg-slate-50 group-hover:bg-white transition-colors ${item.color}`}>
                    <item.icon size={18} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">{item.title}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    );
  };

  // Assessment - Direct assessment form (when only one is enabled)
  const renderDirectAssessment = (assessmentId: string) => {
    const onBack = user?.role === 'student'
      ? () => handleSetCurrentPage('dashboard')
      : () => handleSetCurrentSubpage('daftar-asesmen');

    if (assessmentId === 'akpd') {
      return (
        <div className="px-6 md:px-8 py-8">
          <AKPDAssessmentForm
            onBack={onBack}
            schoolMode={schoolMode}
          />
        </div>
      );
    }

    return (
      <div className="px-6 md:px-8 py-8">
        <AssessmentForm
          assessmentId={assessmentId}
          onBack={onBack}
          schoolMode={schoolMode}
        />
      </div>
    );
  };

  // Assessment - Daftar Asesmen
  const renderDaftarAsesmen = () => (
    <div className="px-6 md:px-8 py-8">
      {user?.role === 'student' && (
        <button
          onClick={() => handleSetCurrentPage('dashboard')}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm mb-6 flex items-center gap-1"
        >
          ← Kembali
        </button>
      )}
      <AssessmentList schoolMode={schoolMode} />
    </div>
  );

  // Assessment - Hasil Asesmen
  const renderHasilAsesmen = () => (
    <div className="px-6 md:px-8 py-8">
      {user?.role === 'student' && (
        <button
          onClick={() => handleSetCurrentPage('dashboard')}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm mb-6 flex items-center gap-1"
        >
          ← Kembali ke Dashboard
        </button>
      )}
      <ResultsView />
    </div>
  );

  // Assessment - Settings
  const renderAssessmentSettings = () => (
    <div className="px-6 md:px-8 py-8">
      <AdminSettings onBack={() => handleSetCurrentSubpage('daftar-asesmen')} />
    </div>
  );

  // RPL view
  const renderRPL = () => (
    <RPLGenerator schoolMode={schoolMode} />
  );

  // Absensi Siswa view
  const renderAbsensi = () => (
    <AbsensiSMP schoolMode={schoolMode} />
  );

  // Latihan Tes view
  const renderLatihanTes = () => {
    // Admin/Teacher always have full access to exercises
    const isAdminOrTeacher = user?.isSuperAdmin || user?.role === 'admin' || user?.role === 'teacher';
    if (isAdminOrTeacher) {
      return (
        <React.Suspense fallback={<div>Loading...</div>}>
          <ExerciseSelector
            onBack={() => handleSetCurrentPage('dashboard')}
            initialExercise={currentSubpage}
          />
        </React.Suspense>
      );
    }

    if (!featureSettings) {
      return <div className="px-6 md:px-8 py-8 text-center">Memuat pengaturan...</div>;
    }
    const exercisesEnabled = featureSettings.exercises.psikotest || featureSettings.exercises.analogi || featureSettings.exercises.tiu;

    if (!exercisesEnabled) {
      return (
        <div className="px-6 md:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Latihan Tes</h1>
            <p className="text-gray-600">Persiapan dan latihan tes</p>
          </div>
          <div className="card p-12 text-center">
            <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Fitur Belum Diaktifkan</h2>
            <p className="text-gray-600 text-lg">Admin belum mengaktifkan fitur Latihan Tes. Silahkan hubungi administrator untuk mengaktifkan fitur ini.</p>
          </div>
        </div>
      );
    }

    return (
      <React.Suspense fallback={<div>Loading...</div>}>
        <ExerciseSelector
          onBack={() => handleSetCurrentPage('dashboard')}
          initialExercise={currentSubpage}
        />
      </React.Suspense>
    );
  };

  // Games view
  const renderGames = () => {
    // Show game question editor if requested
    if (gameEditorOpen) {
      return (
        <GameQuestionEditor onBack={() => setGameEditorOpen(false)} />
      );
    }

    // Admin/Teacher always have full access to games
    const isAdminOrTeacher = user?.isSuperAdmin || user?.role === 'admin' || user?.role === 'teacher';
    const canEditQuestions = user?.isSuperAdmin || user?.role === 'teacher';

    if (isAdminOrTeacher) {
      return (
        <GameSelector
          onBack={() => handleSetCurrentPage('dashboard')}
          onEditQuestions={canEditQuestions ? () => setGameEditorOpen(true) : undefined}
        />
      );
    }

    if (!featureSettings) {
      return <div className="px-6 md:px-8 py-8 text-center">Memuat pengaturan...</div>;
    }
    const gamesEnabled = featureSettings.games.vocabulary || featureSettings.games.puzzle || featureSettings.games.kahoot;

    if (!gamesEnabled) {
      return (
        <div className="px-6 md:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Games</h1>
            <p className="text-gray-600">Permainan edukasi interaktif</p>
          </div>
          <div className="card p-12 text-center">
            <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Fitur Belum Diaktifkan</h2>
            <p className="text-gray-600 text-lg">Admin belum mengaktifkan fitur Games. Silahkan hubungi administrator untuk mengaktifkan fitur ini.</p>
          </div>
        </div>
      );
    }

    return (
      <GameSelector
        onBack={() => handleSetCurrentPage('dashboard')}
      />
    );
  };

  // Admin Account Management view
  const renderAdminAccounts = () => (
    <AdminAccountManagement />
  );

  // Pengaturan view
  const renderPengaturan = () => {
    // Show AdminSettings if feature-access submenu is selected
    if (settingsSubMenu === 'feature-access') {
      return <AdminSettings onBack={() => setSettingsSubMenu('main')} />;
    }

    // Show main settings
    return (
      <div className="px-6 md:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Pengaturan</h1>

        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">⚙️ Kontrol Admin</h2>
          <div className="mb-6">
            <button
              onClick={() => setSettingsSubMenu('feature-access')}
              className="w-full card p-8 text-left hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 flex flex-col md:flex-row md:items-center justify-between gap-6 group"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="text-4xl w-16 h-16 flex items-center justify-center bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">🔐</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    Kontrol Akses Fitur
                  </h3>
                  <p className="text-gray-600">
                    Atur fitur mana saja yang tersedia untuk siswa di dashboard mereka
                  </p>
                </div>
              </div>
              <div className="text-purple-600 font-bold flex items-center gap-2 bg-white px-6 py-3 rounded-xl shadow-sm self-start md:self-auto group-hover:bg-purple-600 group-hover:text-white transition-all">
                Buka Pengaturan <span>→</span>
              </div>
            </button>
          </div>
        </div>

        <div className="card p-8 mb-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-blue-100 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Settings size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Pengaturan Tingkat Sekolah</h2>
          </div>

          <div className="space-y-4">
            <label className="block text-gray-700 font-medium mb-4">
              Pilih Tingkat Sekolah
            </label>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleSetSchoolMode('smp')}
                className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-between group/btn ${schoolMode === 'smp'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-white text-gray-700 border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50/30'
                  }`}
              >
                <span>SMP (Kelas VII-IX)</span>
                {schoolMode === 'smp' ? (
                  <span className="text-white animate-in zoom-in duration-300">✓</span>
                ) : (
                  <span className="opacity-0 group-hover/btn:opacity-30 transition-opacity">→</span>
                )}
              </button>
              <button
                onClick={() => handleSetSchoolMode('sma_smk')}
                className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-between group/btn ${schoolMode === 'sma_smk'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-white text-gray-700 border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50/30'
                  }`}
              >
                <span>SMA/SMK (Kelas X-XII)</span>
                {schoolMode === 'sma_smk' ? (
                  <span className="text-white animate-in zoom-in duration-300">✓</span>
                ) : (
                  <span className="opacity-0 group-hover/btn:opacity-30 transition-opacity">→</span>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    );
  };

  // Show student preview if enabled
  if (showStudentPreview) {
    return (
      <div>
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 md:px-8 py-4 shadow-lg z-40">
          <div className="flex items-center justify-between max-w-full">
            <div className="flex items-center gap-3">
              <Eye size={20} />
              <span className="font-semibold">Pratinjau Dashboard Siswa</span>
            </div>
            <button
              onClick={() => setShowStudentPreview(false)}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Tutup Pratinjau
            </button>
          </div>
        </div>
        <StudentDashboard setCurrentPage={handleSetCurrentPage} setCurrentSubpage={handleSetCurrentSubpage} />
      </div>
    );
  }

  // Students see StudentDashboard by default
  if (user?.role === 'student' && currentPage === 'dashboard') {
    return (
      <StudentDashboard
        setCurrentPage={handleSetCurrentPage}
        setCurrentSubpage={setCurrentSubpage}
      />
    );
  }



  // Render content based on current page
  if (currentPage === 'dashboard') {
    return renderDashboard();

  } else if (currentPage === 'assessment') {
    // Check if navigating directly to a specific assessment (e.g., 'direct-akpd')
    if (currentSubpage && currentSubpage.startsWith('direct-')) {
      const assessmentId = currentSubpage.replace('direct-', '');
      return renderDirectAssessment(assessmentId);
    } else if (currentSubpage === 'daftar-asesmen') {
      return renderDaftarAsesmen();
    } else if (currentSubpage === 'hasil-asesmen') {
      return renderHasilAsesmen();
    } else if (currentSubpage === 'assessment-settings') {
      return renderAssessmentSettings();
    }
    return renderDaftarAsesmen();
  } else if (currentPage === 'rpl') {
    return renderRPL();
  } else if (currentPage === 'absensi') {
    return renderAbsensi();
  } else if (currentPage === 'latihan-tes') {
    return renderLatihanTes();
  } else if (currentPage === 'games') {
    return renderGames();
  } else if (currentPage === 'admin-accounts') {
    return renderAdminAccounts();
  } else if (currentPage === 'case-management') {
    return <CaseManagement />;
  } else if (currentPage === 'counseling-schedule') {
    return <CounselingSchedule />;
  } else if (currentPage === 'data-master') {
    return <ManajemenSiswaKelas schoolMode={schoolMode} />;
  } else if (currentPage === 'sosiometri') {
    return <SociometryWrapper schoolMode={schoolMode} />;
  } else if (currentPage === 'counseling-report') {
    return <CounselingReport schoolMode={schoolMode} />;
  } else if (currentPage === 'parent-guest-book') {
    return <ParentGuestBook schoolMode={schoolMode} />;
  } else if (currentPage === 'pengaturan') {
    return renderPengaturan();
  }

  return renderDashboard();
}
