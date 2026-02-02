import React, { useState, useEffect } from 'react';
import { Eye, Trash2, Search, ChevronLeft, Download } from 'lucide-react';
import { getAssessmentResults, deleteAssessmentResult } from '@/lib/supabaseClient';
import HollandRIASECResultView from './HollandRIASECResultView';
import * as XLSX from 'xlsx';

export default function HollandRIASECResultsList({ onBack }: { onBack?: () => void }) {
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedResult, setSelectedResult] = useState<any | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClass, setSelectedClass] = useState('');

    useEffect(() => {
        loadResults();
    }, []);

    const loadResults = async () => {
        setLoading(true);
        try {
            // 'riasec' is the table key used in HollandRIASECForm
            const data = await getAssessmentResults('riasec');

            // Transform data to extract scores from calculated_result
            const transformedData = data.map((result: any) => {
                const calculatedResult = result.calculated_result || {};
                return {
                    ...result,
                    score_r: calculatedResult.score_r || 0,
                    score_i: calculatedResult.score_i || 0,
                    score_a: calculatedResult.score_a || 0,
                    score_s: calculatedResult.score_s || 0,
                    score_e: calculatedResult.score_e || 0,
                    score_c: calculatedResult.score_c || 0,
                    holland_code: calculatedResult.holland_code || ''
                };
            });

            setResults(transformedData);
        } catch (error) {
            console.error('Error loading RIASEC results:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteResult = async (resultId: string, studentName: string) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus hasil asesmen ${studentName}?`)) {
            return;
        }

        try {
            const success = await deleteAssessmentResult(resultId);
            if (success) {
                setResults(results.filter(r => r.id !== resultId));
                alert('Hasil asesmen berhasil dihapus');
            } else {
                // Retry fetch if delete appeared to fail but might have worked or state is stale
                loadResults();
            }
        } catch (error) {
            console.error('Error deleting result:', error);
            alert('Gagal menghapus hasil asesmen');
        }
    };

    const handleDownloadExcel = () => {
        try {
            const dataToExport = getFilteredResults().map((r, index) => ({
                'No': index + 1,
                'Nama Siswa': r.student_name,
                'Kelas': r.class,
                'Jenis Kelamin': r.gender || '-',
                'Tanggal': new Date(r.created_at).toLocaleDateString('id-ID'),
                'Kode Holland': r.holland_code || '-',
                'Realistis (R)': r.score_r,
                'Investigatif (I)': r.score_i,
                'Artistik (A)': r.score_a,
                'Sosial (S)': r.score_s,
                'Enterprising (E)': r.score_e,
                'Konvensional (C)': r.score_c
            }));

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Hasil RIASEC');
            XLSX.writeFile(workbook, `Hasil_Asesmen_RIASEC_${new Date().toISOString().split('T')[0]}.xlsx`);

        } catch (error) {
            console.error("Error exporting excel", error);
            alert("Gagal mengunduh Excel");
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
        });
    };

    if (selectedResult) {
        return (
            <HollandRIASECResultView
                result={selectedResult}
                onBack={() => setSelectedResult(null)}
            />
        );
    }

    if (loading) {
        return (
            <div className="px-6 md:px-8 py-8 text-center text-slate-500">
                Memuat data hasil asesmen...
            </div>
        );
    }

    return (
        <div className="px-6 md:px-8 py-8">
            {onBack && (
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium transition-colors"
                >
                    <ChevronLeft size={20} />
                    Kembali
                </button>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">
                        Hasil Asesmen RIASEC
                    </h1>
                    <p className="text-slate-500">
                        Total hasil tersimpan: {results.length}
                    </p>
                </div>
                <button
                    onClick={handleDownloadExcel}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                >
                    <Download size={18} /> Download Excel
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Cari nama siswa..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                            />
                        </div>

                        {/* Filter Class */}
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white md:w-48"
                        >
                            <option value="">Semua Kelas</option>
                            {getUniqueClasses().map((cls) => (
                                <option key={cls} value={cls}>{cls}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 w-16">No</th>
                                <th className="px-6 py-4">Nama Siswa</th>
                                <th className="px-6 py-4">Kelas</th>
                                <th className="px-6 py-4">Tanggal</th>
                                <th className="px-6 py-4">Kode Holland</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {getFilteredResults().length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        Tidak ada data yang ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                getFilteredResults().map((result, index) => (
                                    <tr key={result.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-slate-500">{index + 1}</td>
                                        <td className="px-6 py-4 font-medium text-slate-900">{result.student_name}</td>
                                        <td className="px-6 py-4 text-slate-600">{result.class}</td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {new Date(result.created_at).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-bold text-xs">
                                                {result.holland_code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => setSelectedResult(result)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Lihat Detail"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteResult(result.id, result.student_name)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
