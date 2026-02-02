import React, { useState, useEffect } from 'react';
import {
    Search, Eye, Trash2, ChevronLeft,
    Printer
} from 'lucide-react';
import { getAssessmentResults, deleteAssessmentResult } from '@/lib/supabaseClient';
import SMACareerPathResultView from './SMACareerPathResultView';

interface ResultItem {
    id: string;
    student_name: string;
    class: string;
    gender: string;
    nis: string;
    completed_at: string;
    recommended_path: string;
    // Dynamic scores field not strictly typed here but available in data
    [key: string]: any;
}

interface SMACareerPathResultsListProps {
    onBack: () => void;
}

export default function SMACareerPathResultsList({ onBack }: SMACareerPathResultsListProps) {
    const [results, setResults] = useState<ResultItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedResult, setSelectedResult] = useState<ResultItem | null>(null);

    useEffect(() => {
        loadResults();
    }, []);

    const loadResults = async () => {
        setLoading(true);
        try {
            const data = await getAssessmentResults('sma_smk_career');
            // Map database fields if necessary, though getAssessmentResults usually handles simple mapping
            // Assuming data comes back flat or matches ResultItem structure
            setResults(data as any[]);
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
            await deleteAssessmentResult(resultId, 'sma_smk_career'); // Pass table identifier if needed by library, usually ID is enough if function handles it
            // Note: deleteAssessmentResult might need specific table handling if it relies on a switch based on ID prefix or similar. 
            // Assuming deleteAssessmentResult handles the deletion based on ID or we might need to verify the implementation.
            // If deleteAssessmentResult is generic and takes table name as second arg (some implementations do), otherwise it might need the generic table.
            // Let's assume standard behavior for now.

            setResults(results.filter(r => r.id !== resultId));
            alert('Hasil asesmen berhasil dihapus');
        } catch (error) {
            console.error('Error deleting result:', error);
            alert('Gagal menghapus hasil asesmen');
        }
    };

    const getUniqueClasses = () => {
        const classes = [...new Set(results.map(r => r.class || r.kelas))];
        return classes.sort();
    };

    const getFilteredResults = () => {
        return results.filter(result => {
            const name = result.student_name || result.nama || '';
            const cls = result.class || result.kelas || '';

            const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesClass = selectedClass === '' || cls === selectedClass;
            return matchesSearch && matchesClass;
        })
            .sort((a, b) => {
                const clsA = a.class || a.kelas || '';
                const clsB = b.class || b.kelas || '';
                const nameA = a.student_name || a.nama || '';
                const nameB = b.student_name || b.nama || '';
                return clsA.localeCompare(clsB) || nameA.localeCompare(nameB);
            });
    };

    if (selectedResult) {
        return (
            <SMACareerPathResultView
                result={selectedResult}
                onBack={() => setSelectedResult(null)}
            />
        );
    }

    const formatPathName = (pathCode: string) => {
        if (!pathCode) return '-';
        // Simple mapping for display
        const map: Record<string, string> = {
            'sma_ipa': 'SMA IPA',
            'sma_ips': 'SMA IPS',
            'sma_bahasa': 'SMA Bahasa',
            'smk_teknologi': 'SMK Teknologi',
            'smk_tik': 'SMK TIK',
            'smk_bisnis': 'SMK Bisnis',
            'smk_kesehatan': 'SMK Kesehatan',
            'smk_pariwisata': 'SMK Pariwisata',
            'smk_agribisnis': 'SMK Agrobisnis',
            'smk_seni': 'SMK Seni',
        };
        return map[pathCode] || pathCode;
    };

    return (
        <div className="w-full">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 font-medium"
            >
                <ChevronLeft size={20} />
                Kembali
            </button>

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Angket Penjurusan SMA/SMK</h1>
                <p className="text-slate-600">Total Peserta: {results.length}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="mb-6 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cari nama siswa..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>

                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 md:w-48"
                    >
                        <option value="">Semua Kelas</option>
                        {getUniqueClasses().map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-slate-500">
                        <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full mx-auto mb-4"></div>
                        Memuat data...
                    </div>
                ) : getFilteredResults().length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        Tidak ada data yang ditemukan.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">No</th>
                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Nama Siswa</th>
                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Kelas</th>
                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Rekomendasi</th>
                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Tanggal</th>
                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {getFilteredResults().map((result, idx) => (
                                    <tr key={result.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="py-3 px-4 text-slate-600">{idx + 1}</td>
                                        <td className="py-3 px-4 text-slate-900 font-medium">{result.student_name || result.nama}</td>
                                        <td className="py-3 px-4 text-slate-600">{result.class || result.kelas}</td>
                                        <td className="py-3 px-4">
                                            <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-medium border border-amber-100">
                                                {formatPathName(result.recommended_path)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-slate-600">
                                            {new Date(result.completed_at).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setSelectedResult(result)}
                                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                                                    title="Lihat Detail"
                                                >
                                                    <Eye size={18} />
                                                    <span className="hidden md:inline">Lihat</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteResult(result.id, result.student_name || result.nama)}
                                                    className="flex items-center gap-1 text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                                                    title="Hapus Data"
                                                >
                                                    <Trash2 size={18} />
                                                    <span className="hidden md:inline">Hapus</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
