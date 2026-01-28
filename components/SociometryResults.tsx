import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ArrowLeft, Users, Download, Grid, List } from 'lucide-react';
import { getSociometrySessions, getSociometryResponses, SociometrySession, SociometryResponse, analyzeSociometry } from '@/lib/sociometryDB';

interface SociometryResultsProps {
    sessionId: string;
    onBack: () => void;
}

export default function SociometryResults({ sessionId, onBack }: SociometryResultsProps) {
    const [session, setSession] = useState<SociometrySession | null>(null);
    const [responses, setResponses] = useState<SociometryResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'ranking' | 'matrix'>('ranking');
    const [analysis, setAnalysis] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, [sessionId]);

    const loadData = async () => {
        setLoading(true);
        const sessions = await getSociometrySessions();
        const currentSession = sessions.find(s => s.id === sessionId);
        setSession(currentSession || null);

        if (currentSession) {
            const resp = await getSociometryResponses(sessionId);
            setResponses(resp);

            // Fetch student master data for name mapping
            try {
                const studentsResponse = await fetch('/api/students/get-all');
                const studentsResult = await studentsResponse.json();

                const classStudents = studentsResult.success && studentsResult.data
                    ? (studentsResult.data[currentSession.class_id] || [])
                    : [];

                // Calculate with student data
                const calculated = analyzeSociometry(resp, classStudents);
                setAnalysis(calculated);
            } catch (err) {
                console.error('Failed to load student data:', err);
                // Fallback to analysis without student data
                const calculated = analyzeSociometry(resp, []);
                setAnalysis(calculated);
            }
        }
        setLoading(false);
    };

    if (loading) return <div className="p-10 text-center text-slate-500">Memuat analisis...</div>;
    if (!session) return <div>Data tidak ditemukan</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} className="text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{session.title}</h1>
                        <p className="text-slate-500">Target Kelas: {session.class_id} • {responses.length} Responden</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('ranking')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'ranking' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <List size={16} /> Peringkat
                    </button>
                    <button
                        onClick={() => setViewMode('matrix')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'matrix' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Grid size={16} /> Matriks Tabulasi
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main View */}
                <div className="lg:col-span-2 space-y-6">

                    {viewMode === 'ranking' && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800">Popularitas Siswa (Star)</h3>
                                <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">Berdasarkan total pilihan</span>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {analysis?.rankedStudents.map((item: any, idx: number) => (
                                    <div key={idx} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${idx < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0 pr-4">
                                            <h4 className="font-medium text-slate-900 mb-1">{item.name || 'Unknown Student'}</h4>
                                            <div className="w-full bg-slate-100 rounded-full h-1.5">
                                                <div
                                                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                                    style={{ width: `${Math.min((item.count / (responses.length || 1)) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <span className="block text-lg font-bold text-blue-600">{item.count}</span>
                                            <span className="text-xs text-slate-400">Dipilih</span>
                                        </div>
                                    </div>
                                ))}
                                {analysis?.rankedStudents.length === 0 && (
                                    <div className="p-8 text-center text-slate-500">Belum ada data yang cukup untuk dianalisis.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {viewMode === 'matrix' && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-5 border-b border-slate-100 bg-slate-50">
                                <h3 className="font-bold text-slate-800">Matriks Arah Pilihan</h3>
                            </div>
                            <div className="overflow-x-auto p-4">
                                <table className="w-full text-xs font-mono border-collapse" style={{ minWidth: '600px' }}>
                                    <thead>
                                        <tr>
                                            <th className="p-2 border bg-slate-100 text-left">Siswa \ Pilihan</th>
                                            {responses.map((r, i) => (
                                                <th key={i} className="p-2 border bg-slate-50 w-8 text-center" title={r.student_name}>
                                                    {i + 1}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {responses.map((rowStudent, rowIdx) => (
                                            <tr key={rowIdx} className="hover:bg-slate-50">
                                                <td className="p-2 border font-medium">
                                                    <span className="mr-2 text-slate-400">({rowIdx + 1})</span>
                                                    {rowStudent.student_name}
                                                </td>
                                                {responses.map((colStudent, colIdx) => {
                                                    // Check if rowStudent chose colStudent
                                                    // Need to check specific question or aggregate? Let's aggregate for matrix overview
                                                    let isChosen = false;
                                                    rowStudent.answers.forEach(ans => {
                                                        // This comparison is tricky without IDs. Assuming names match or ID match.
                                                        // Currently our answers store ID. colStudent has ID.
                                                        // Ideally we match IDs.
                                                        if (ans.selected_students.includes(colStudent.student_id)) {
                                                            isChosen = true;
                                                        }
                                                    });

                                                    return (
                                                        <td key={colIdx} className={`p-2 border text-center ${isChosen ? 'bg-blue-100 text-blue-700 font-bold' : ''}`}>
                                                            {rowIdx === colIdx ? '-' : (isChosen ? '1' : '')}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 text-xs text-slate-500 border-t border-slate-100">
                                * Angka 1 menunjukkan siswa di baris memilih siswa di kolom.
                            </div>
                        </div>
                    )}

                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4">Detail Sesi</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between pb-2 border-b border-slate-50">
                                <span className="text-slate-500">Status</span>
                                <span className="font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">Aktif</span>
                            </div>
                            <div className="flex justify-between pb-2 border-b border-slate-50">
                                <span className="text-slate-500">Dibuat</span>
                                <span className="font-medium text-slate-900">{new Date(session.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between pb-2 border-b border-slate-50">
                                <span className="text-slate-500">Total Responden</span>
                                <span className="font-medium text-slate-900">{responses.length} Siswa</span>
                            </div>
                        </div>

                        <button className="w-full mt-6 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition flex items-center justify-center gap-2">
                            <Download size={16} /> Export CSV
                        </button>
                    </div>

                    <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                        <h4 className="font-bold text-blue-800 mb-2">Interpretasi Singkat</h4>
                        <p className="text-xs text-blue-700 leading-relaxed">
                            Siswa dengan "Popularitas" tertinggi dapat dijadikan ketua kelompok atau tutor sebaya.
                            Perhatikan siswa dengan skor 0 (Isolate) untuk pendekatan konseling lebih lanjut.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
