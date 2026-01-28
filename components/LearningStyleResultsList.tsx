import React, { useState, useEffect } from 'react';
import { Eye, Search, Trash2, ChevronLeft, BookOpen, Music, Activity } from 'lucide-react';
import { getAssessmentResults, deleteAssessmentResult } from '@/lib/supabaseClient';

interface ResultDetail {
    id: string;
    student_name: string;
    class: string;
    gender: string;
    answers: Record<string, any>;
    created_at: string;
}

interface ProcessedResult {
    id: string;
    studentName: string;
    class: string;
    gender: string;
    visual: number;
    auditory: number;
    kinesthetic: number;
    dominant: string;
    date: string;
}

const STYLE_LABELS = {
    V: 'Visual',
    A: 'Auditorial',
    K: 'Kinestetik'
};

const STYLE_COLORS = {
    V: 'text-blue-600 bg-blue-50',
    A: 'text-green-600 bg-green-50',
    K: 'text-orange-600 bg-orange-50'
};

export default function LearningStyleResultsList({ onViewDetail, onBack }: { onViewDetail?: (result: any) => void; onBack?: () => void }) {
    const [results, setResults] = useState<ResultDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedResult, setSelectedResult] = useState<ProcessedResult | null>(null);

    useEffect(() => {
        loadResults();
    }, []);

    const loadResults = async () => {
        setLoading(true);
        try {
            console.log(`📋 Loading Learning Style results...`);
            const data = await getAssessmentResults('gaya_belajar');
            console.log(`📊 Loaded ${data.length} results`);
            setResults(data);
        } catch (error) {
            console.error('❌ Error loading results:', error);
        } finally {
            setLoading(false);
        }
    };

    const processResult = (result: ResultDetail): ProcessedResult => {
        // The answers object might contain the summary fields if we saved them 
        // (which we tried to do in the form component)
        // If not, we recalculate from the raw "1": "V", "2": "A", etc.

        let v = 0, a = 0, k = 0;

        // Check if summary exists in answers
        if (result.answers.summary_v !== undefined) {
            v = Number(result.answers.summary_v);
            a = Number(result.answers.summary_a);
            k = Number(result.answers.summary_k);
        } else {
            // Recalculate
            Object.values(result.answers).forEach((val: any) => {
                if (val === 'V') v++;
                if (val === 'A') a++;
                if (val === 'K') k++;
            });
        }

        let dominant = 'V';
        let max = v;
        if (a > max) { max = a; dominant = 'A'; }
        if (k > max) { max = k; dominant = 'K'; }

        return {
            id: result.id,
            studentName: result.student_name,
            class: result.class,
            gender: result.gender,
            visual: v,
            auditory: a,
            kinesthetic: k,
            dominant: dominant,
            date: new Date(result.created_at).toLocaleDateString('id-ID')
        };
    };

    const handleDeleteResult = async (resultId: string, studentName: string) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus hasil asesmen ${studentName}?`)) {
            return;
        }

        try {
            await deleteAssessmentResult(resultId);
            // Refresh
            const freshData = await getAssessmentResults('gaya_belajar');
            setResults(freshData);
            alert('Hasil asesmen berhasil dihapus');
        } catch (error) {
            console.error('❌ Error deleting result:', error);
            alert('Gagal menghapus hasil asesmen');
        }
    };

    const getUniqueClasses = () => {
        const classes = [...new Set(results.map(r => r.class))];
        return classes.sort();
    };

    const getFilteredResults = () => {
        return results
            .filter(result => {
                const matchesSearch = result.student_name.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesClass = selectedClass === '' || result.class === selectedClass;
                return matchesSearch && matchesClass;
            })
            .map(processResult)
            .sort((a, b) => a.class.localeCompare(b.class) || a.studentName.localeCompare(b.studentName));
    };

    if (selectedResult) {
        // Detail View
        return (
            <div className="flex justify-center min-h-screen bg-gray-50 py-8">
                <div className="w-full max-w-4xl px-6 md:px-8">
                    <button
                        onClick={() => setSelectedResult(null)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
                    >
                        <ChevronLeft size={20} /> Kembali ke Daftar
                    </button>

                    <div className="card p-8 bg-white shadow-xl relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-full h-2 ${selectedResult.dominant === 'V' ? 'bg-blue-500' : selectedResult.dominant === 'A' ? 'bg-green-500' : 'bg-orange-500'}`}></div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedResult.studentName}</h2>
                        <div className="text-gray-500 mb-6 flex gap-4 text-sm">
                            <span>Kelas: {selectedResult.class}</span>
                            <span>•</span>
                            <span>{selectedResult.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                            <span>•</span>
                            <span>{selectedResult.date}</span>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
                            <div className="flex-1 text-center">
                                <div className="text-sm text-gray-500 uppercase tracking-widest mb-2">Gaya Belajar Dominan</div>
                                <div className={`text-4xl font-extrabold mb-2 ${selectedResult.dominant === 'V' ? 'text-blue-600' : selectedResult.dominant === 'A' ? 'text-green-600' : 'text-orange-600'}`}>
                                    {STYLE_LABELS[selectedResult.dominant as 'V' | 'A' | 'K']}
                                </div>
                                {selectedResult.dominant === 'V' && <BookOpen size={48} className="mx-auto text-blue-400 mt-4" />}
                                {selectedResult.dominant === 'A' && <Music size={48} className="mx-auto text-green-400 mt-4" />}
                                {selectedResult.dominant === 'K' && <Activity size={48} className="mx-auto text-orange-400 mt-4" />}
                            </div>

                            <div className="flex-1 w-full space-y-4">
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="font-semibold text-gray-700">Visual</span>
                                        <span className="font-bold text-gray-900">{selectedResult.visual}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-4">
                                        <div className="bg-blue-500 h-4 rounded-full" style={{ width: `${(selectedResult.visual / 30) * 100}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="font-semibold text-gray-700">Auditorial</span>
                                        <span className="font-bold text-gray-900">{selectedResult.auditory}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-4">
                                        <div className="bg-green-500 h-4 rounded-full" style={{ width: `${(selectedResult.auditory / 30) * 100}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="font-semibold text-gray-700">Kinestetik</span>
                                        <span className="font-bold text-gray-900">{selectedResult.kinesthetic}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-4">
                                        <div className="bg-orange-500 h-4 rounded-full" style={{ width: `${(selectedResult.kinesthetic / 30) * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="font-bold text-gray-900 mb-2">💡 Rekomendasi</h3>
                            {selectedResult.dominant === 'V' && <p>Siswa ini belajar paling efektif dengan melihat gambar, diagram, dan membaca teks. Gunakan materi visual yang menarik.</p>}
                            {selectedResult.dominant === 'A' && <p>Siswa ini belajar paling efektif dengan mendengarkan. Diskusi dan penjelasan lisan sangat membantu.</p>}
                            {selectedResult.dominant === 'K' && <p>Siswa ini belajar paling efektif dengan melakukan. Berikan kesempatan untuk praktik dan bergerak.</p>}
                        </div>

                        {/* Dynamic Assessment Descriptions */}
                        {(() => {
                            const { ASSESSMENT_DESCRIPTIONS } = require('@/lib/assessmentDescriptions');
                            const descriptionData = ASSESSMENT_DESCRIPTIONS['gaya_belajar'];

                            if (descriptionData) {
                                return (
                                    <div className="mt-8 pt-6 border-t border-blue-200 text-left">
                                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            📖 {descriptionData.title}
                                        </h3>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {descriptionData.items.map((item: any) => (
                                                <div key={item.label} className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                                                    <strong className="text-blue-700 block mb-1">{item.label}</strong>
                                                    <p className="text-xs text-slate-600 leading-snug">{item.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })()}
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <p className="text-gray-600">Memuat data...</p>
                </div>
            </div>
        );
    }

    const processedResults = getFilteredResults();

    return (
        <div className="flex justify-center min-h-screen bg-gray-50 py-8">
            <div className="w-full px-6 md:px-8">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium"
                    >
                        <ChevronLeft size={20} /> Kembali
                    </button>
                )}

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Hasil Asesmen Gaya Belajar</h1>
                    <p className="text-gray-600">Total peserta: {results.length}</p>
                </div>

                <div className="card p-6 w-full">
                    <div className="mb-6 flex flex-col md:flex-row gap-4 w-full">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Cari nama siswa..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 md:w-48"
                        >
                            <option value="">Semua Kelas</option>
                            {getUniqueClasses().map((kelas) => (
                                <option key={kelas} value={kelas}>{kelas}</option>
                            ))}
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">No</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Nama Siswa</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Kelas</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">L/P</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Gaya Belajar</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {processedResults.map((r, idx) => (
                                    <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-gray-700">{idx + 1}</td>
                                        <td className="py-3 px-4 text-gray-900 font-medium">{r.studentName}</td>
                                        <td className="py-3 px-4 text-gray-700">{r.class}</td>
                                        <td className="py-3 px-4 text-gray-700">{r.gender === 'L' ? 'L' : 'P'}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${STYLE_COLORS[r.dominant as 'V' | 'A' | 'K']}`}>
                                                {STYLE_LABELS[r.dominant as 'V' | 'A' | 'K']}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => setSelectedResult(r)} className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded" title="Lihat">
                                                    <Eye size={16} /> Lihat
                                                </button>
                                                <button onClick={() => handleDeleteResult(r.id, r.studentName)} className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded" title="Hapus">
                                                    <Trash2 size={16} /> Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
