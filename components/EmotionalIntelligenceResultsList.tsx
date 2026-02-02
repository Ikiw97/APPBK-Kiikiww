import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, FileText, Trash2, Eye } from 'lucide-react';
import { getAssessmentResults, deleteAssessmentResult } from '@/lib/supabaseClient';
import { calculateEIResult } from '@/lib/eiResultCalculator';

interface EmotionalIntelligenceResultsListProps {
    onBack: () => void;
    onViewDetail?: (result: any) => void;
}

export default function EmotionalIntelligenceResultsList({ onBack, onViewDetail }: EmotionalIntelligenceResultsListProps) {
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [classFilter, setClassFilter] = useState('');
    const [selectedResult, setSelectedResult] = useState<any | null>(null);

    useEffect(() => {
        loadResults();
    }, []);

    const loadResults = async () => {
        setLoading(true);
        try {
            const data = await getAssessmentResults('emotional_intelligence');
            setResults(data);
        } catch (error) {
            console.error('Error loading results:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Apakah Anda yakin ingin menghapus hasil ini?')) {
            try {
                const success = await deleteAssessmentResult(id); // Using the correct ID argument signature
                if (success) {
                    setResults(prev => prev.filter(r => r.id !== id));
                } else {
                    alert('Gagal menghapus data');
                }
            } catch (error) {
                console.error('Error deleting result:', error);
                alert('Gagal menghapus data');
            }
        }
    };

    const filteredResults = results.filter(result => {
        const matchesSearch = result.student_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = classFilter ? result.class === classFilter : true;
        return matchesSearch && matchesClass;
    });

    const uniqueClasses = Array.from(new Set(results.map(r => r.class))).sort();

    if (selectedResult) {
        const analysis = calculateEIResult(
            selectedResult.student_name,
            selectedResult.class,
            selectedResult.gender || 'Unknown',
            selectedResult.answers
        );

        return (
            <div className="animate-in slide-in-from-right duration-300">
                <button
                    onClick={() => setSelectedResult(null)}
                    className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Kembali ke Daftar</span>
                </button>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50">
                        <h2 className="text-xl font-bold text-slate-900">Detail Hasil Kecerdasan Emosional</h2>
                        <p className="text-slate-500">{analysis.studentName} - {analysis.class}</p>
                    </div>

                    <div className="p-6">
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-4">Skor Total: {analysis.overallScore} / {analysis.overallMaxScore} ({Math.round(analysis.overallPercentage)}%)</h3>
                            <div className="p-4 bg-blue-50 text-blue-800 rounded-lg">
                                <p className="font-medium">Kategori: {analysis.overallLevel}</p>
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold mb-3">Analisis Per Aspek</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {analysis.dimensions.map((dim: any, idx: number) => (
                                <div key={idx} className="border border-slate-200 rounded-lg p-4">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-medium text-slate-700">{dim.label}</span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold 
                      ${dim.percentage >= 80 ? 'bg-green-100 text-green-700' :
                                                dim.percentage >= 65 ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'}`}
                                        >
                                            {Math.round(dim.percentage)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                                        <div
                                            className={`h-2 rounded-full ${dim.percentage >= 80 ? 'bg-green-500' : dim.percentage >= 65 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                            style={{ width: `${dim.percentage}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 font-semibold">{dim.level}</p>
                                    <ul className="mt-2 text-xs text-slate-600 list-disc ml-4 space-y-1">
                                        {dim.tips.map((tip: string, tIdx: number) => (
                                            <li key={tIdx}>{tip}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="text-slate-600" size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Hasil Kecerdasan Emosional</h1>
                    <p className="text-slate-500">Daftar hasil asesmen kecerdasan emosional siswa</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Cari nama siswa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <select
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                    <option value="">Semua Kelas</option>
                    {uniqueClasses.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="text-center py-12 text-slate-500">Memuat data...</div>
            ) : filteredResults.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                    <FileText className="mx-auto text-slate-400 mb-2" size={32} />
                    <p className="text-slate-600">Belum ada data hasil asesmen</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Nama Siswa</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Kelas</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Tanggal</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredResults.map((result) => (
                                    <tr key={result.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">{result.student_name}</td>
                                        <td className="px-6 py-4 text-slate-600">{result.class}</td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {new Date(result.completed_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedResult(result)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Lihat Detail"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(result.id, e)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
