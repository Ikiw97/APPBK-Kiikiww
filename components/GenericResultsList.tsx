import React, { useState, useEffect } from 'react';
import { Search, Eye, Trash2, ChevronLeft, Calendar } from 'lucide-react';
import { getAssessmentResults, deleteAssessmentResult } from '@/lib/supabaseClient';
import { ASSESSMENT_TITLES, TEMPERAMENT_DESCRIPTIONS } from '@/lib/assessmentConstants';
import { getAssessmentQuestions } from '@/lib/assessmentQuestions';

interface GenericResultDetail {
    id: string;
    student_name: string;
    class: string;
    gender: string;
    answers: Record<string, any>;
    calculated_result?: any;
    completed_at: string;
}

interface GenericResultsListProps {
    assessmentId: string;
    onBack: () => void;
}

export default function GenericResultsList({ assessmentId, onBack }: GenericResultsListProps) {
    const [results, setResults] = useState<GenericResultDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedDetailResult, setSelectedDetailResult] = useState<GenericResultDetail | null>(null);

    const title = ASSESSMENT_TITLES[assessmentId] || assessmentId;
    const questions = getAssessmentQuestions(assessmentId);

    useEffect(() => {
        loadResults();
    }, [assessmentId]);

    const loadResults = async () => {
        setLoading(true);
        try {
            const data = await getAssessmentResults(assessmentId);
            setResults(data);
        } catch (error) {
            console.error('Error loading results:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteResult = async (resultId: string, studentName: string) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus hasil asesmen ${studentName}?`)) {
            return;
        }

        try {
            await deleteAssessmentResult(resultId);
            setResults(results.filter(r => r.id !== resultId));
            alert('Hasil asesmen berhasil dihapus');
        } catch (error) {
            console.error('Error deleting result:', error);
            alert('Gagal menghapus hasil asesmen');
        }
    };

    const getUniqueClasses = () => {
        const classes = [...new Set(results.map(r => r.class))];
        return classes.sort();
    };

    const getFilteredResults = () => {
        return results.filter(result => {
            const matchesSearch = result.student_name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesClass = selectedClass === '' || result.class === selectedClass;
            return matchesSearch && matchesClass;
        })
            .sort((a, b) => a.class.localeCompare(b.class) || a.student_name.localeCompare(b.student_name));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <p className="text-gray-500">Memuat data...</p>
            </div>
        );
    }

    if (selectedDetailResult) {
        // Use stored calculated result if available, otherwise calculate from answers
        let analysis;

        if (selectedDetailResult.calculated_result) {
            // Use the pre-calculated result from database
            analysis = selectedDetailResult.calculated_result;
        } else {
            // Fallback: Calculate the analysis result from answers
            // Answers are now stored with question.id as keys
            const answers: Record<string, string> = {};
            questions.forEach((q) => {
                const answer = selectedDetailResult.answers[q.id];
                if (answer) answers[q.id] = String(answer);
            });

            const { calculateGenericResult } = require('@/lib/genericResultCalculator');
            analysis = calculateGenericResult(answers, questions);
        }

        return (
            <div className="w-full">
                <button
                    onClick={() => setSelectedDetailResult(null)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
                >
                    <ChevronLeft size={20} />
                    Kembali ke Daftar
                </button>

                <div className="card p-8 bg-white shadow-xl mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
                    <div className="flex flex-wrap gap-6 mt-6">
                        <div>
                            <span className="block text-sm text-gray-500">Nama Siswa</span>
                            <span className="text-lg font-semibold">{selectedDetailResult.student_name}</span>
                        </div>
                        <div>
                            <span className="block text-sm text-gray-500">Kelas</span>
                            <span className="text-lg font-semibold">{selectedDetailResult.class}</span>
                        </div>
                        <div>
                            <span className="block text-sm text-gray-500">Jenis Kelamin</span>
                            <span className="text-lg font-semibold">
                                {selectedDetailResult.gender === 'L' ? 'Laki-laki' : selectedDetailResult.gender === 'P' ? 'Perempuan' : '-'}
                            </span>
                        </div>
                        <div>
                            <span className="block text-sm text-gray-500">Tanggal</span>
                            <span className="text-lg font-semibold">
                                {new Date(selectedDetailResult.completed_at).toLocaleDateString('id-ID', {
                                    day: 'numeric', month: 'long', year: 'numeric'
                                })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Analysis Result Card */}
                <div className="card p-8 mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Hasil Analisis</h3>

                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 mb-6">
                        <h4 className="text-lg font-semibold text-blue-900 mb-2 text-center">Hasil Dominan</h4>
                        <p className="text-4xl font-bold text-blue-700 mb-2 text-center">{analysis.dominant}</p>
                        <p className="text-lg font-semibold text-blue-600 mb-4 text-center">
                            {(() => {
                                const dominantData = analysis.chartData.find((d: any) => d.label === analysis.dominant);
                                if (dominantData && dominantData.fullMark > 0) {
                                    return `${Math.round((dominantData.value / dominantData.fullMark) * 100)}%`;
                                }
                                return '';
                            })()}
                        </p>
                        <p className="text-sm text-blue-800 text-center">
                            Hasil ini menunjukkan kecenderungan dominan berdasarkan jawaban yang diberikan.
                        </p>

                        {assessmentId === 'temperament' && TEMPERAMENT_DESCRIPTIONS[analysis.dominant] && (
                            <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200 text-sm text-gray-700 text-left">
                                <p><strong>💡 Tentang {analysis.dominant}:</strong></p>
                                <p className="italic">{TEMPERAMENT_DESCRIPTIONS[analysis.dominant]}</p>
                            </div>
                        )}

                        <div className="mt-6 space-y-3">
                            <h5 className="font-semibold text-gray-700">Rincian Skor:</h5>
                            {analysis.chartData.map((d: any) => {
                                const percentage = d.fullMark > 0 ? Math.round((d.value / d.fullMark) * 100) : 0;
                                return (
                                    <div key={d.label}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>{d.label}</span>
                                            <span className="font-medium text-blue-700">{percentage}%</span>
                                        </div>
                                        <div className="w-full bg-white rounded-full h-2.5">
                                            <div
                                                className="bg-blue-500 h-2.5 rounded-full transition-all"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Dynamic Assessment Descriptions */}
                        {(() => {
                            const { ASSESSMENT_DESCRIPTIONS } = require('@/lib/assessmentDescriptions');
                            // Check for direct match or partial match (for specialized IDs like 'minat')
                            const descKey = Object.keys(ASSESSMENT_DESCRIPTIONS).find(key => assessmentId.includes(key));
                            const descriptionData = descKey ? ASSESSMENT_DESCRIPTIONS[descKey] : null;

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

                    {/* Print Button */}
                    <div className="flex justify-center gap-4 mb-6 print:hidden">
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            🖨️ Cetak Hasil
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
            >
                <ChevronLeft size={20} />
                Kembali
            </button>

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
                <p className="text-gray-600">Total Peserta: {results.length}</p>
            </div>

            <div className="card p-6">
                <div className="mb-6 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
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
                        {getUniqueClasses().map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                {getFilteredResults().length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        Tidak ada data yang ditemukan.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">No</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Nama Siswa</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Kelas</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Jenis Kelamin</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Dominan</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tanggal</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {getFilteredResults().map((result, idx) => {
                                    // Get dominant result if available
                                    let dominantText = '-';
                                    if (result.calculated_result && result.calculated_result.dominant) {
                                        dominantText = result.calculated_result.dominant;
                                    }

                                    return (
                                        <tr key={result.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 text-gray-600">{idx + 1}</td>
                                            <td className="py-3 px-4 text-gray-900 font-medium">{result.student_name}</td>
                                            <td className="py-3 px-4 text-gray-600">{result.class}</td>
                                            <td className="py-3 px-4 text-gray-600">
                                                {result.gender === 'L' ? 'Laki-laki' : result.gender === 'P' ? 'Perempuan' : '-'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                                                    {dominantText}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">
                                                {new Date(result.completed_at).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setSelectedDetailResult(result)}
                                                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                                                        title="Lihat Detail"
                                                    >
                                                        <Eye size={18} />
                                                        <span className="hidden md:inline">Lihat</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteResult(result.id, result.student_name)}
                                                        className="flex items-center gap-1 text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                                                        title="Hapus Data"
                                                    >
                                                        <Trash2 size={18} />
                                                        <span className="hidden md:inline">Hapus</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
