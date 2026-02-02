import React, { useState, useEffect } from 'react';
import {
    Search, Eye, Trash2, ChevronLeft, Calendar,
    ArrowLeft, Printer, AlertTriangle, BarChart3,
    Shield, Info, Heart, Users
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from 'recharts';
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
        // Special handling for bullying assessment
        if (assessmentId === 'bullying') {
            const bullyingResult = selectedDetailResult.calculated_result || {};

            // Reconstruct result info matching the form's logic
            const BULLYING_DIMENSIONS = {
                knowledge: { label: 'Pengetahuan Bullying', icon: Shield, color: '#3b82f6', description: 'Pemahaman tentang apa itu bullying, jenis-jenisnya, dan dampaknya' },
                attitude: { label: 'Sikap Terhadap Bullying', icon: Info, color: '#f59e0b', description: 'Pandangan dan sikap pribadi terhadap perilaku bullying' },
                empathy: { label: 'Empati', icon: Heart, color: '#ec4899', description: 'Kemampuan memahami dan merasakan perasaan korban bullying' },
                bystander: { label: 'Perilaku Bystander', icon: Users, color: '#8b5cf6', description: 'Tindakan yang diambil saat menyaksikan bullying' },
                experience: { label: 'Pengalaman Pribadi', icon: Eye, color: '#10b981', description: 'Pengalaman langsung atau tidak langsung dengan bullying' }
            };

            const ChartData = bullyingResult.scores ? [
                { name: 'Pengetahuan', score: bullyingResult.scores.knowledge || 0, fill: BULLYING_DIMENSIONS.knowledge.color },
                { name: 'Sikap', score: bullyingResult.scores.attitude || 0, fill: BULLYING_DIMENSIONS.attitude.color },
                { name: 'Empati', score: bullyingResult.scores.empathy || 0, fill: BULLYING_DIMENSIONS.empathy.color },
                { name: 'Bystander', score: bullyingResult.scores.bystander || 0, fill: BULLYING_DIMENSIONS.bystander.color },
                { name: 'Pengalaman', score: bullyingResult.scores.experience || 0, fill: BULLYING_DIMENSIONS.experience.color },
            ] : [];

            // Get recommendations and description based on level (matching BullyingAssessmentForm.tsx)
            let recommendations: string[] = [];
            let description = '';

            if (bullyingResult.level === 'Tinggi') {
                description = 'Anda memiliki pemahaman yang baik tentang bullying dan sikap yang positif. Anda menunjukkan empati tinggi terhadap korban dan siap mengambil tindakan untuk mencegah bullying.';
                recommendations = [
                    'Terus pertahankan sikap positif Anda',
                    'Jadilah role model bagi teman-teman',
                    'Aktif dalam program anti-bullying di sekolah',
                    'Bantu teman yang membutuhkan dukungan'
                ];
            } else if (bullyingResult.level === 'Sedang') {
                description = 'Anda memiliki pemahaman yang cukup tentang bullying, namun masih ada ruang untuk peningkatan dalam sikap dan tindakan Anda.';
                recommendations = [
                    'Tingkatkan pemahaman tentang dampak bullying',
                    'Latih empati dengan mencoba memahami perasaan orang lain',
                    'Jangan ragu untuk melaporkan jika melihat bullying',
                    'Ikuti program atau seminar tentang anti-bullying'
                ];
            } else {
                description = 'Pemahaman Anda tentang bullying masih terbatas. Penting untuk meningkatkan kesadaran dan mengubah sikap terhadap bullying.';
                recommendations = [
                    'Konsultasi dengan guru BK untuk pemahaman lebih lanjut',
                    'Pelajari tentang jenis-jenis bullying dan dampaknya',
                    'Refleksikan perilaku Anda terhadap teman-teman',
                    'Ikuti program intervensi anti-bullying di sekolah',
                    'Kembangkan empati dan kepedulian terhadap orang lain'
                ];
            }

            return (
                <div className="min-h-screen bg-slate-50 py-8 print:bg-white print:py-0">
                    <div className="max-w-5xl mx-auto px-4 print:px-0">
                        {/* Header Navigation */}
                        <div className="flex justify-between items-center mb-8 print:hidden">
                            <button
                                onClick={() => setSelectedDetailResult(null)}
                                className="flex items-center gap-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                            >
                                <ArrowLeft size={20} /> Kembali ke Daftar
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium shadow-sm transition-colors"
                            >
                                <Printer size={18} /> Cetak Hasil
                            </button>
                        </div>

                        {/* Result Content */}
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden print:shadow-none print:rounded-none">
                            {/* Header Banner */}
                            <div className="bg-gradient-to-r from-primary-500 to-indigo-600 p-8 text-white text-center print:bg-none print:text-black print:border-b print:p-4">
                                <h1 className="text-3xl font-bold mb-2">Hasil Asesmen Bullying</h1>
                                <div className="flex justify-center gap-6 text-primary-100 font-medium print:text-slate-600 print:text-sm">
                                    <span>Nama: {selectedDetailResult.student_name}</span>
                                    <span>•</span>
                                    <span>Kelas: {selectedDetailResult.class}</span>
                                </div>
                            </div>

                            <div className="p-8 print:p-4">
                                {/* Top Result Section */}
                                <div className="text-center mb-12 print:mb-6">
                                    <p className="text-slate-500 mb-4 font-medium uppercase tracking-wider text-sm text-center">Tingkat Pemahaman</p>
                                    <div className={`inline-block px-12 py-5 rounded-2xl mb-6 shadow-sm ${bullyingResult.level === 'Tinggi' ? 'bg-green-100 text-green-700' :
                                            bullyingResult.level === 'Sedang' ? 'bg-yellow-100/80 text-yellow-800' :
                                                'bg-red-100 text-red-700'
                                        }`}>
                                        <span className="text-5xl font-black">{bullyingResult.level || '-'}</span>
                                    </div>
                                    <p className="text-lg text-slate-600 mb-2">Total Skor: <span className="font-bold text-2xl text-slate-800">{bullyingResult.total_score || 0}</span> / 150</p>
                                    <p className="text-slate-600 max-w-3xl mx-auto leading-relaxed text-lg italic">
                                        "{description}"
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12 print:grid-cols-1 print:gap-6">
                                    {/* Chart Section */}
                                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 print:bg-white print:border-slate-200">
                                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                            <BarChart3 size={20} className="text-primary-500" />
                                            Profil Skor per Dimensi
                                        </h3>
                                        <div className="h-[300px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={ChartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                                    <XAxis type="number" hide />
                                                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: '#64748b' }} interval={0} />
                                                    <Tooltip
                                                        cursor={{ fill: 'transparent' }}
                                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                                    />
                                                    <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={24}>
                                                        {ChartData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Dimension Details */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-slate-800 mb-2">Detail Dimensi</h3>
                                        {bullyingResult.scores && Object.entries(bullyingResult.scores).map(([key, score]) => {
                                            const info = BULLYING_DIMENSIONS[key as keyof typeof BULLYING_DIMENSIONS];
                                            if (!info) return null;
                                            return (
                                                <div key={key} className="flex gap-4 p-4 rounded-xl border border-slate-100 hover:border-primary-200 hover:shadow-sm transition-all bg-white">
                                                    <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: info.color }}>
                                                        <info.icon size={24} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <h4 className="font-bold text-slate-800">{info.label}</h4>
                                                            <span className="text-lg font-bold text-slate-700">{String(score)}/30</span>
                                                        </div>
                                                        <p className="text-sm text-slate-500 leading-snug">{info.description}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Recommendations */}
                                <div className="border-t border-slate-100 pt-8 print:pt-4">
                                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                        <AlertTriangle size={22} className="text-primary-500" />
                                        Rekomendasi
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {recommendations.map((rec, idx) => (
                                            <div key={idx} className="flex gap-3 p-4 bg-primary-50/50 border border-primary-100 rounded-xl">
                                                <div className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                                    {idx + 1}
                                                </div>
                                                <p className="text-slate-700 font-medium">{rec}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Print Footer */}
                                <div className="hidden print:block mt-8 text-center text-xs text-slate-400 border-t pt-4">
                                    Dicetak dari Aplikasi BK - {new Date().toLocaleDateString('id-ID')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

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

        // Safety check for chartData
        if (!analysis.chartData || !Array.isArray(analysis.chartData)) {
            return (
                <div className="w-full">
                    <button
                        onClick={() => setSelectedDetailResult(null)}
                        className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 font-medium"
                    >
                        <ChevronLeft size={20} />
                        Kembali ke Daftar
                    </button>
                    <div className="card p-8 bg-white shadow-xl">
                        <p className="text-red-600">Data hasil tidak lengkap atau format tidak sesuai.</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="w-full">
                <button
                    onClick={() => setSelectedDetailResult(null)}
                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 font-medium"
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

                    <div className="bg-primary-50 rounded-xl p-6 border border-primary-100 mb-6">
                        <h4 className="text-lg font-semibold text-primary-900 mb-2 text-center">Hasil Dominan</h4>
                        <p className="text-4xl font-bold text-primary-700 mb-2 text-center">{analysis.dominant}</p>
                        <p className="text-lg font-semibold text-primary-600 mb-4 text-center">
                            {(() => {
                                const dominantData = analysis.chartData.find((d: any) => d.label === analysis.dominant);
                                if (dominantData && dominantData.fullMark > 0) {
                                    return `${Math.round((dominantData.value / dominantData.fullMark) * 100)}%`;
                                }
                                return '';
                            })()}
                        </p>
                        <p className="text-sm text-primary-800 text-center">
                            Hasil ini menunjukkan kecenderungan dominan berdasarkan jawaban yang diberikan.
                        </p>

                        {assessmentId === 'temperament' && TEMPERAMENT_DESCRIPTIONS[analysis.dominant] && (
                            <div className="mt-4 p-4 bg-white rounded-lg border border-primary-200 text-sm text-gray-700 text-left">
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
                                            <span className="font-medium text-primary-700">{percentage}%</span>
                                        </div>
                                        <div className="w-full bg-white rounded-full h-2.5">
                                            <div
                                                className="bg-primary-500 h-2.5 rounded-full transition-all"
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
                                    <div className="mt-8 pt-6 border-t border-primary-200 text-left">
                                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            📖 {descriptionData.title}
                                        </h3>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {descriptionData.items.map((item: any) => (
                                                <div key={item.label} className="bg-white p-3 rounded-lg border border-primary-100 shadow-sm">
                                                    <strong className="text-primary-700 block mb-1">{item.label}</strong>
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
                            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
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
                className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 font-medium"
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
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 md:w-48"
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
                                    if (assessmentId === 'bullying') {
                                        // For bullying, show level instead of dominant
                                        if (result.calculated_result && result.calculated_result.level) {
                                            dominantText = result.calculated_result.level;
                                        }
                                    } else if (result.calculated_result && result.calculated_result.dominant) {
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
                                                <span className="inline-block px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
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
                                                        className="flex items-center gap-1 text-primary-600 hover:text-primary-800 px-2 py-1 rounded hover:bg-primary-50 transition-colors"
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
