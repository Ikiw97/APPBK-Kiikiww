import React, { useState, useEffect } from 'react';
import { Eye, Calculator, TrendingUp, Search, Trash2, Download, ChevronLeft } from 'lucide-react';
import * as XLSX from 'xlsx';
import { getAssessmentResults, deleteAssessmentResult } from '@/lib/supabaseClient';
import AKPDResultView from './AKPDResultView';
import { calculateAKPDResult, AKPDResult } from '@/lib/akpdResultCalculator';
import { getAKPDQuestionsWithCustom } from '@/lib/akpdQuestions';

export default function AKPDResultsList({ onBack }: { onBack?: () => void }) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<AKPDResult | null>(null);
  const [showAggregation, setShowAggregation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [classAggregations, setClassAggregations] = useState<{
    [key: string]: {
      className: string;
      totalStudents: number;
      averagePercentage: number;
      totalProblems: number;
      students: {
        name: string;
        gender: string;
        problemCount: number;
        percentage: number;
        fields: {
          pribadi: number;
          sosial: number;
          belajar: number;
          karir: number;
        }
      }[];
    };
  }>({});

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    setLoading(true);
    try {
      console.log(`📋 Loading AKPD results...`);
      const data = await getAssessmentResults('akpd');
      console.log(`📊 Setting results state with ${data.length} items:`, data.map((d: any) => ({ id: d.id, name: d.student_name, class: d.class })));
      setResults(data);
      console.log(`✅ Results state updated`);
    } catch (error) {
      console.error('❌ Error loading AKPD results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResult = (result: any) => {
    const questions = getAKPDQuestionsWithCustom();
    const akpdResult = calculateAKPDResult(
      result.student_name,
      result.class,
      result.gender || '',
      result.answers,
      questions
    );
    setSelectedResult(akpdResult);
  };

  const handleDeleteResult = async (resultId: string, studentName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus hasil asesmen ${studentName}?`)) {
      return;
    }

    try {
      console.log(`🗑️ Attempting to delete: ${resultId}`);
      const deleteResult = await deleteAssessmentResult(resultId);
      console.log(`✅ Delete API returned: ${deleteResult}`);

      // Get fresh data directly from server
      console.log(`🔄 Fetching fresh data from server...`);
      const freshData = await getAssessmentResults('akpd');
      console.log(`📊 Fresh data from server has ${freshData.length} items`);

      // Verify the item is actually gone from database
      const stillExists = freshData.some((r: any) => r.id === resultId);
      console.log(`🔍 Verification: Item still in database? ${stillExists}`);

      if (!stillExists) {
        // Item successfully deleted from database
        setResults(freshData);
        console.log(`✅ State updated with fresh data`);
        alert('Hasil asesmen berhasil dihapus');
      } else {
        console.error(`❌ Item still exists in database after delete!`);
        alert('Peringatan: Item mungkin tidak berhasil dihapus. Silakan refresh halaman.');
        setResults(freshData);
      }
    } catch (error) {
      console.error('❌ Error in delete flow:', error);
      alert(`Gagal menghapus hasil asesmen: ${error instanceof Error ? error.message : 'Kesalahan tidak diketahui'}`);

      // Try to reload to ensure UI is in sync
      try {
        console.log(`🔄 Attempting recovery: reloading data...`);
        await loadResults();
      } catch (reloadError) {
        console.error('❌ Recovery failed:', reloadError);
      }
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

  const handleCalculateAggregation = () => {
    const questions = getAKPDQuestionsWithCustom();
    const aggregation: typeof classAggregations = {};

    results.forEach((result) => {
      const className = result.class;
      if (!aggregation[className]) {
        aggregation[className] = {
          className,
          totalStudents: 0,
          averagePercentage: 0,
          totalProblems: 0,
          students: [],
        };
      }

      const akpdResult = calculateAKPDResult(
        result.student_name,
        result.class,
        result.gender || '',
        result.answers,
        questions
      );

      // Extract field scores
      const getFieldPercentage = (name: string) =>
        akpdResult.fieldScores.find(f => f.fieldName === name)?.categoryPercentage || 0;

      aggregation[className].students.push({
        name: result.student_name,
        gender: result.gender || '',
        problemCount: akpdResult.totalProblems,
        percentage: akpdResult.problemPercentage,
        fields: {
          pribadi: getFieldPercentage('Bidang Pribadi'),
          sosial: getFieldPercentage('Bidang Sosial'),
          belajar: getFieldPercentage('Bidang Belajar'),
          karir: getFieldPercentage('Bidang Karir')
        }
      });
      aggregation[className].totalProblems += akpdResult.totalProblems;
      aggregation[className].totalStudents += 1;
    });


    // Calculate averages
    Object.keys(aggregation).forEach((className) => {
      const classData = aggregation[className];
      const percentages = classData.students.map((s) => s.percentage);
      classData.averagePercentage = Math.round(
        percentages.reduce((a, b) => a + b, 0) / percentages.length
      );
    });

    setClassAggregations(aggregation);
    setShowAggregation(true);
  };

  const handleDownloadAggregationExcel = () => {
    try {
      // Prepare data for Excel
      const allData: any[] = [];
      let nomor = 1;

      Object.values(classAggregations)
        .sort((a, b) => a.className.localeCompare(b.className))
        .forEach((classData) => {
          // Add student rows
          classData.students
            .sort((a, b) => b.percentage - a.percentage)
            .forEach((student) => {
              allData.push({
                'NOMOR': nomor,
                'NAMA SISWA': student.name,
                'KELAS': classData.className,
                'L/P': student.gender === 'L' ? 'L' : student.gender === 'P' ? 'P' : '-',
                'JUMLAH MASALAH': student.problemCount || 0,
                '%': `${student.percentage}%`,
                'BIDANG PRIBADI': `${student.fields?.pribadi ?? 0}%`,
                'BIDANG SOSIAL': `${student.fields?.sosial ?? 0}%`,
                'BIDANG BELAJAR': `${student.fields?.belajar ?? 0}%`,
                'BIDANG KARIR': `${student.fields?.karir ?? 0}%`
              });
              nomor++;
            });
        });

      // Create workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(allData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Agregasi AKPD');

      // Set column widths
      worksheet['!cols'] = [
        { wch: 8 },    // NOMOR
        { wch: 30 },   // NAMA SISWA
        { wch: 12 },   // KELAS
        { wch: 5 },    // L/P
        { wch: 15 },   // JUMLAH MASALAH
        { wch: 8 },    // %
        { wch: 15 },   // BIDANG PRIBADI
        { wch: 15 },   // BIDANG SOSIAL
        { wch: 15 },   // BIDANG BELAJAR
        { wch: 15 }    // BIDANG KARIR
      ];

      // Generate filename with date
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const filename = `Agregasi-AKPD-${dateStr}.xlsx`;

      // Download the file
      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Gagal mengunduh file Excel');
    }
  };

  if (selectedResult) {
    return (
      <AKPDResultView
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

  if (showAggregation) {
    return (
      <div className="px-6 md:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => setShowAggregation(false)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium"
            >
              ← Kembali ke Daftar
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Agregasi Hasil AKPD per Kelas</h1>
            <p className="text-gray-600">Ringkasan hasil asesmen berdasarkan kelas</p>
          </div>
          <button
            onClick={handleDownloadAggregationExcel}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium whitespace-nowrap"
          >
            <Download size={18} />
            Download Excel
          </button>
        </div>

        <div className="card p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300 bg-gray-100">
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Kelas</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Nama Siswa</th>
                  <th className="text-center py-2 px-3 font-semibold text-gray-700">L/P</th>
                  <th className="text-center py-2 px-3 font-semibold text-gray-700">Jumlah Masalah</th>
                  <th className="text-center py-2 px-3 font-semibold text-gray-700">%</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(classAggregations)
                  .sort((a, b) => a.className.localeCompare(b.className))
                  .flatMap((classData) =>
                    classData.students
                      .sort((a, b) => b.percentage - a.percentage)
                      .map((student, index) => {
                        const getProblemLevelColor = (percentage: number) => {
                          if (percentage > 50) return 'text-red-600 font-semibold';
                          if (percentage > 30) return 'text-yellow-600 font-semibold';
                          return 'text-green-600 font-semibold';
                        };

                        return (
                          <tr key={`${classData.className}-${index}`} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-2 px-3 text-gray-700">{classData.className}</td>
                            <td className="py-2 px-3 text-gray-900">{student.name}</td>
                            <td className="py-2 px-3 text-center text-gray-700">{student.gender === 'L' ? 'L' : student.gender === 'P' ? 'P' : '-'}</td>
                            <td className="py-2 px-3 text-center text-gray-700">{student.problemCount || 0}</td>
                            <td className={`py-2 px-3 text-center ${getProblemLevelColor(student.percentage)}`}>
                              {student.percentage}%
                            </td>
                          </tr>
                        );
                      })
                  )}
              </tbody>
            </table>
          </div>
          {Object.keys(classAggregations).length === 0 && (
            <p className="text-center text-gray-600 py-4">Tidak ada data untuk agregasi</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-8 py-8">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium"
        >
          <ChevronLeft size={20} />
          Kembali
        </button>
      )}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Hasil Asesmen AKPD
        </h1>
        <p className="text-gray-600">
          Total peserta yang mengisi asesmen: {results.length}
        </p>
      </div>

      {results.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-600">Belum ada hasil asesmen AKPD</p>
        </div>
      ) : (
        <>
          <div className="card p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daftar Hasil AKPD</h3>

            {/* Search and Filter Section */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
              {/* Search Input */}
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

              {/* Class Filter */}
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

            {/* Results Info */}
            <div className="mb-4 text-sm text-gray-600">
              Menampilkan {getFilteredResults().length} dari {results.length} hasil
            </div>

            {getFilteredResults().length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <p>Tidak ada hasil asesmen yang sesuai dengan kriteria pencarian</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">No</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Nama Siswa</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Kelas</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Jenis Kelamin</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Tingkat Masalah</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredResults().map((result, index) => {
                      const questions = getAKPDQuestionsWithCustom();
                      const akpdResult = calculateAKPDResult(
                        result.student_name,
                        result.class,
                        result.gender || '',
                        result.answers,
                        questions
                      );

                      const getStatusColor = (percentage: number) => {
                        if (percentage > 50) return 'text-red-600 bg-red-50';
                        if (percentage > 30) return 'text-yellow-600 bg-yellow-50';
                        return 'text-green-600 bg-green-50';
                      };

                      return (
                        <tr key={result.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-700">{index + 1}</td>
                          <td className="py-3 px-4 text-gray-900 font-medium">{result.student_name}</td>
                          <td className="py-3 px-4 text-gray-700">{result.class}</td>
                          <td className="py-3 px-4 text-gray-700">{result.gender === 'L' ? 'Laki-laki' : result.gender === 'P' ? 'Perempuan' : '-'}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                                akpdResult.problemPercentage
                              )}`}
                            >
                              {akpdResult.problemPercentage}%
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewResult(result)}
                                className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              >
                                <Eye size={16} />
                                Lihat
                              </button>
                              <button
                                onClick={() => handleDeleteResult(result.id, result.student_name)}
                                className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Hapus hasil asesmen"
                              >
                                <Trash2 size={16} />
                                Hapus
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

          <button
            onClick={handleCalculateAggregation}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <Calculator size={18} />
            Hitung Agregasi per Kelas
          </button>
        </>
      )}
    </div>
  );
}
