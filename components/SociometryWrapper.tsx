import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContextSupabase';
import { Plus, Users, ArrowLeft, BarChart2, CheckCircle, Trash2, Network, Sparkles, ArrowRight, RefreshCw, UserPlus } from 'lucide-react';
import { getSociometrySessions, SociometrySession } from '@/lib/sociometryDB';

// Sub-components (Will be moved to separate files later for cleanliness)
// Placeholder imports
import SociometryBuilder from './SociometryBuilder';
import SociometryStudentForm from './SociometryStudentForm';
import SociometryResults from './SociometryResults';

interface SociometryWrapperProps {
    schoolMode?: 'smp' | 'sma_smk';
}

export default function SociometryWrapper({ schoolMode = 'smp' }: SociometryWrapperProps) {
    const { user } = useAuth();
    const [view, setView] = useState<'list' | 'create' | 'fill' | 'results'>('list');
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [sessions, setSessions] = useState<SociometrySession[]>([]);
    const [loading, setLoading] = useState(false);

    // Load sessions
    useEffect(() => {
        loadSessions();
    }, [user]);

    const loadSessions = async () => {
        setLoading(true);
        try {
            const data = await getSociometrySessions();
            console.log('Wrapper received sessions:', data);
            setSessions(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        setView('create');
    };

    const handleBack = () => {
        setView('list');
        setSelectedSessionId(null);
        loadSessions(); // Reload list
    };

    const handleViewResults = (id: string) => {
        setSelectedSessionId(id);
        setView('results');
    };

    const handleFillSurvey = (id: string) => {
        setSelectedSessionId(id);
        setView('fill');
    };

    const handleDeleteSession = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus sosiometri ini? Semua data respons akan ikut terhapus.')) {
            return;
        }

        try {
            const response = await fetch(`/api/sociometry/delete-session?session_id=${id}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Gagal menghapus sosiometri');
            }

            // Reload sessions after successful deletion
            await loadSessions();
            alert('Sosiometri berhasil dihapus');
        } catch (err) {
            console.error('Delete error:', err);
            alert('Gagal menghapus sosiometri: ' + (err as Error).message);
        }
    };

    // Render List
    const renderList = () => (
        <div className="space-y-8">
            {/* Hero Header - Clean Light Design */}
            <div className="relative mb-8 p-6 md:p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
                {/* Content */}
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-5">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest">Analisis Sosial</span>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
                                Sosiometri
                            </h1>
                            <p className="text-slate-600 text-lg max-w-xl">
                                Analisis hubungan sosial antar siswa di kelas untuk memahami dinamika kelompok.
                            </p>
                        </div>

                        {(user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'super_admin') && (
                            <button
                                onClick={handleCreateNew}
                                className="group flex items-center gap-3 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-100 hover:shadow-xl hover:scale-105"
                            >
                                <Plus size={20} />
                                <span>Buat Sosiometri Baru</span>
                                <ArrowRight size={18} className="opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                            </button>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 mt-8">
                        <div className="bg-slate-50 border border-slate-200 rounded-full px-4 py-2 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse"></span>
                            <span className="text-sm font-medium text-slate-700">{sessions.filter(s => s.status === 'active').length} Sesi Aktif</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-full px-4 py-2 flex items-center gap-2">
                            <Users size={14} className="text-slate-500" />
                            <span className="text-sm font-medium text-slate-700">{sessions.length} Total Sesi</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Session Cards */}
            {loading ? (
                <div className="text-center py-16">
                    <div className="relative inline-block mb-4">
                        <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-indigo-500 animate-spin"></div>
                        <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-indigo-500" size={24} />
                    </div>
                    <p className="text-slate-500 font-medium">Memuat sesi sosiometri...</p>
                </div>
            ) : sessions.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
                        <Network className="text-indigo-500" size={36} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Sosiometri</h3>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                        {(user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'super_admin')
                            ? 'Mulai dengan membuat sosiometri baru untuk menganalisis hubungan sosial di kelas.'
                            : 'Belum ada sesi sosiometri yang aktif untuk saat ini.'}
                    </p>

                    {user?.role === 'student' && (
                        <div className="max-w-md mx-auto mb-6 bg-amber-50 p-4 rounded-xl border border-amber-100 text-sm text-amber-700">
                            <p className="font-semibold mb-1">💡 Tips</p>
                            <p>Hubungi guru BK Anda jika sosiometri tidak muncul.</p>
                        </div>
                    )}

                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={loadSessions}
                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
                        >
                            <RefreshCw size={16} />
                            Refresh
                        </button>


                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sessions.map((session, index) => (
                        <div
                            key={session.id}
                            className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 hover:-translate-y-1"
                            style={{ animationDelay: `${index * 75}ms` }}
                        >
                            {/* Gradient Accent */}
                            <div className={`h-1.5 w-full bg-gradient-to-r ${session.status === 'active' ? 'from-emerald-400 to-teal-500' : 'from-slate-300 to-slate-400'}`}></div>

                            <div className="p-6">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                        <Network size={24} />
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${session.status === 'active'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        {session.status === 'active' ? '● Aktif' : 'Selesai'}
                                    </span>
                                </div>

                                {/* Content */}
                                <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-700 transition-colors">
                                    {session.title}
                                </h3>
                                <div className="flex flex-wrap gap-2 mb-5">
                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                                        <UserPlus size={12} />
                                        Kelas {session.class_id}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">
                                        {session.questions.length} Pertanyaan
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="pt-4 border-t border-slate-100 flex gap-2">
                                    {(user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'super_admin') ? (
                                        <>
                                            <button
                                                onClick={() => handleViewResults(session.id)}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-200 transition-all text-sm font-semibold"
                                            >
                                                <BarChart2 size={16} />
                                                Lihat Hasil
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSession(session.id)}
                                                className="flex items-center justify-center p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 hover:text-red-600 transition-colors"
                                                title="Hapus Sosiometri"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => handleFillSurvey(session.id)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-200 transition-all text-sm font-semibold"
                                        >
                                            <CheckCircle size={16} />
                                            Isi Survei
                                            <ArrowRight size={14} className="ml-1" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="px-6 md:px-8 py-8 min-h-screen bg-[#FAFAFA]">
            {view === 'list' && renderList()}

            {view === 'create' && (
                <SociometryBuilder onBack={handleBack} schoolMode={schoolMode} />
            )}

            {view === 'fill' && selectedSessionId && (
                <SociometryStudentForm sessionId={selectedSessionId} onBack={handleBack} />
            )}

            {view === 'results' && selectedSessionId && (
                <SociometryResults sessionId={selectedSessionId} onBack={handleBack} />
            )}
        </div>
    );
}

