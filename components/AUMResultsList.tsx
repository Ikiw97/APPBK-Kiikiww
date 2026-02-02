import React, { useState, useEffect } from 'react';
import { Eye, Trash2, ChevronLeft, Search } from 'lucide-react';
import { getAssessmentResults, deleteAssessmentResult } from '@/lib/supabaseClient';
import { AUMResult, calculateAUMResult } from '@/lib/aumResultCalculator';
import AUMResultView from './AUMResultView';

export default function AUMResultsList({ onBack }: { onBack?: () => void }) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<AUMResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    setLoading(true);
    try {
      const data = await getAssessmentResults('aum');
      setResults(data);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
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
      .sort((a, b) => a.class.localeCompare(b.class) || a.student_name.localeCompare(b.student_name));
  };

  const handleViewResult = (result: any) => {
    let aumResult: AUMResult;

    if (result.calculated_result) {
      // Use pre-calculated result
      aumResult = result.calculated_result;
    } else {
      // Recalculate from answers if not available
      aumResult = calculateAUMResult(result.student_name, result.class, result.gender || '', result.answers);
    }

    setSelectedResult(aumResult);
  };

  const handleDeleteResult = async (resultId: string, studentName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus hasil asesmen ${studentName}?`)) {
      return;
    }

    try {
      await deleteAssessmentResult(resultId);

      // Refresh data
      const data = await getAssessmentResults('aum');
      setResults(data);
      alert('Hasil asesmen berhasil dihapus');
    } catch (error) {
      console.error('Error deleting result:', error);
      alert('Gagal menghapus hasil asesmen');
    }
  };

  if (selectedResult) {
    return (
      <AUMResultView
        result={selectedResult}
        onBack={() => setSelectedResult(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="px-6 md:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-8 py-8">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-2 font-medium"
        >
          <ChevronLeft size={20} />
          Kembali
        </button>
      )}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Hasil Asesmen AUM
        </h1>
        <p className="text-gray-600">
          Total peserta yang mengisi asesmen: {results.length}
        </p>
      </div>

      {results.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-600">Belum ada hasil asesmen AUM</p>
        </div>
      ) : (
        <>
          <div className="card p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daftar Hasil AUM</h3>

            <div className="flex flex-col md:flex-row gap-4">
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
                  <option key={kelas} value={kelas}>
                    {kelas}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              Menampilkan {getFilteredResults().length} dari {results.length} hasil
            </div>
          </div>

          <div className="card overflow-hidden">
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 p-4">
              {getFilteredResults().map((result) => {
                let aumResult: AUMResult;
                if (result.calculated_result) {
                  aumResult = result.calculated_result;
                } else {
                  aumResult = calculateAUMResult(result.student_name, result.class, result.gender || '', result.answers);
                }
                const dominant = aumResult.categoryScores.sort((a, b) => b.percentage - a.percentage)[0];

                return (
                  <div key={result.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900">{result.student_name}</h3>
                        <p className="text-sm text-gray-600">
                          {result.class} • {result.gender === 'L' ? 'Laki-laki' : result.gender === 'P' ? 'Perempuan' : '-'}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(result.completed_at).toLocaleDateString('id-ID')}
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Masalah Dominan:</p>
                      {dominant ? (
                        <span className={`${dominant.severity.color} px-2 py-1 rounded text-xs font-semibold inline-block`}>
                          {dominant.categoryName} ({dominant.percentage}%)
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </div>

                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleViewResult(result)}
                        className="flex-1 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye size={16} />
                        Detail
                      </button>
                      <button
                        onClick={() => handleDeleteResult(result.id, result.student_name)}
                        className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                        title="Hapus Hasil"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">No</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">
                      Nama Siswa
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">
                      Kelas
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">
                      L/P
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">
                      Bidang Masalah Dominan
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">
                      Tanggal Selesai
                    </th>
                    <th className="text-center py-4 px-6 font-medium text-gray-700">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredResults().map((result, index) => (
                    <tr
                      key={result.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="py-4 px-6 text-gray-700">{index + 1}</td>
                      <td className="py-4 px-6 text-gray-900 font-medium">
                        {result.student_name}
                      </td>
                      <td className="py-4 px-6 text-gray-700">{result.class}</td>
                      <td className="py-4 px-6 text-gray-700">
                        {result.gender === 'L' ? 'L' : result.gender === 'P' ? 'P' : '-'}
                      </td>
                      <td className="py-4 px-6 text-gray-700">
                        {(() => {
                          let aumResult: AUMResult;
                          if (result.calculated_result) {
                            aumResult = result.calculated_result;
                          } else {
                            aumResult = calculateAUMResult(result.student_name, result.class, result.gender || '', result.answers);
                          }
                          const dominant = aumResult.categoryScores.sort((a, b) => b.percentage - a.percentage)[0];
                          return dominant ? (
                            <span className={`${dominant.severity.color} px-2 py-1 rounded text-xs font-semibold`}>
                              {dominant.categoryName} ({dominant.percentage}%)
                            </span>
                          ) : '-';
                        })()}
                      </td>
                      <td className="py-4 px-6 text-gray-700">
                        {new Date(result.completed_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewResult(result)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                            title="Lihat Detail Hasil"
                          >
                            <Eye size={16} />
                            Detail
                          </button>
                          <button
                            onClick={() => handleDeleteResult(result.id, result.student_name)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Hapus Hasil"
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
        </>
      )}
    </div>
  );
}
