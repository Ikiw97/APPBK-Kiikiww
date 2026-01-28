import React from 'react';
import { Download, ChevronLeft, BarChart3 } from 'lucide-react';
import { AUMResult } from '@/lib/aumResultCalculator';

interface AUMResultViewProps {
  result: AUMResult;
  onBack: () => void;
}

export default function AUMResultView({ result, onBack }: AUMResultViewProps) {
  const handleDownloadPDF = () => {
    alert("Untuk mengunduh PDF: \n1. Jendela cetak akan terbuka\n2. Pada bagian 'Tujuan' atau 'Destination', pilih 'Save as PDF' atau 'Simpan sebagai PDF'\n3. Klik Simpan/Save");
    window.print();
  };

  const handlePrint = () => {
    window.print();
  };

  const getFrequencyEmoji = (frequency: string): string => {
    const emojiMap: Record<string, string> = {
      'Tidak Pernah': '⏹️',
      'Kadang-kadang': '⚠️',
      'Sering': '🔴',
      'Selalu': '🚨',
    };
    return emojiMap[frequency] || '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 print:py-0 print:bg-white px-4 md:px-8 print:px-0">
      <div className="max-w-4xl mx-auto print:max-w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ChevronLeft size={20} />
            Kembali
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download size={18} />
              Unduh PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <BarChart3 size={18} />
              Cetak
            </button>
          </div>
        </div>

        {/* Main Report Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden print:shadow-none print:rounded-none">
          {/* Header Section */}
          <div className="bg-blue-50 text-blue-900 p-6 print:p-2 print:bg-white print:text-black print:border-b-2 print:border-gray-800">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 print:mb-1 print:text-xl print:text-center uppercase text-center text-blue-900">Hasil Asesmen AUM Umum</h1>

            <div className="grid grid-cols-3 gap-6 print:gap-2 print:flex print:justify-between print:text-sm">
              <div className="print:flex print:gap-1">
                <p className="text-blue-600 text-sm print:text-gray-600">Nama:</p>
                <p className="text-xl font-bold print:text-gray-900 print:text-base print:font-bold">{result.studentName}</p>
              </div>
              <div className="print:flex print:gap-1">
                <p className="text-blue-600 text-sm print:text-gray-600">Kelas:</p>
                <p className="text-xl font-bold print:text-gray-900 print:text-base print:font-bold">{result.class}</p>
              </div>
              <div className="print:flex print:gap-1">
                <p className="text-blue-600 text-sm print:text-gray-600">JK:</p>
                <p className="text-xl font-bold print:text-gray-900 print:text-base print:font-bold">{result.gender === 'L' ? 'L' : 'P'}</p>
              </div>
              <div className="print:flex print:gap-1 hidden print:block">
                <p className="text-gray-600">Tgl:</p>
                <span className="font-bold text-gray-900">{new Date(result.completedAt).toLocaleDateString('id-ID')}</span>
              </div>
            </div>

            <div className="text-blue-600 text-sm mt-2 print:hidden">
              Tanggal Pengisian:{' '}
              {new Date(result.completedAt).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 md:p-8 space-y-6 print:p-0 print:space-y-3">
            {/* Skor Per Bidang */}
            <section className="print:mb-2">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 print:text-sm print:mb-1 print:uppercase print:bg-gray-100 print:p-1">
                📈 Skor Per Bidang
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 print:grid-cols-4 print:gap-2">
                {result.categoryScores.map((category) => (
                  <div
                    key={category.categoryId}
                    className={`p-3 rounded-lg border-2 ${category.severity.color} print:border print:p-1 print:rounded-sm`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-sm print:text-[10px] truncate" title={category.categoryName}>{category.categoryName}</h3>
                      <span className="text-xl print:text-xs">{category.severity.emoji}</span>
                    </div>
                    <p className="text-lg font-bold mb-1 print:text-xs">
                      {category.totalScore}/{category.maxScore} <span className="text-sm font-normal text-gray-600">({Math.round((category.totalScore / category.maxScore) * 100)}%)</span>
                    </p>
                    <div className="w-full bg-gray-300 rounded-full h-2 mb-1 print:h-1">
                      <div
                        className={`h-2 print:h-1 rounded-full ${category.severity.emoji === '🟢'
                          ? 'bg-green-500'
                          : category.severity.emoji === '🟡'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                          }`}
                        style={{
                          width: `${(category.totalScore / category.maxScore) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 3 Masalah Terbesar */}
            <section className="print:mb-2">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 print:text-sm print:mb-1 print:uppercase print:bg-gray-100 print:p-1">
                🎯 3 Masalah Terbesar
              </h2>

              <div className="space-y-3 print:grid print:grid-cols-3 print:space-y-0 print:gap-2">
                {result.categoryScores
                  .sort((a, b) => b.totalScore - a.totalScore)
                  .slice(0, 3)
                  .map((category, index) => (
                    <div
                      key={category.categoryId}
                      className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200 print:bg-white print:border-red-300 print:p-2 print:block"
                    >
                      <span className="text-xl font-bold text-red-600 flex-shrink-0 print:text-sm print:inline-block print:mr-1">
                        {index + 1}.
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm print:text-[10px] truncate">{category.categoryName}</p>
                        <p className="text-xs text-gray-700 mt-1 print:text-[10px]">
                          Skor: <strong>{category.totalScore}/{category.maxScore}</strong>
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </section>

            {/* Masalah Terbesar Per Bidang - Combined with above or separate? Let's keep separate but very compact */}
            <section className="print:mb-2 print:break-inside-avoid">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 print:text-sm print:mb-1 print:uppercase print:bg-gray-100 print:p-1">
                🔍 Masalah Terbesar Per Bidang
              </h2>

              <div className="space-y-3 print:grid print:grid-cols-2 print:space-y-0 print:gap-2">
                {Object.entries(result.topProblemPerCategory).map(([categoryId, problem]) => (
                  <div key={categoryId} className="p-3 bg-orange-50 rounded-lg border border-orange-200 print:bg-white print:border-gray-200 print:p-1">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm print:text-[10px] leading-tight">
                          <span className="text-orange-600">[{problem.category}]</span> {problem.questionText}
                        </p>
                        <p className="text-xs text-gray-700 mt-1 print:text-[9px]">
                          Freq: {problem.frequency}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 15 Masalah Utama Siswa */}
            <section className="print:mb-2 text-sm print:text-[10px]">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 print:text-sm print:mb-1 print:uppercase print:bg-gray-100 print:p-1">
                ⚠️ Detail 15 Masalah Utama
              </h2>

              <div className="space-y-2 print:grid print:grid-cols-2 print:space-y-0 print:gap-x-4 print:gap-y-1">
                {result.topFifteenProblems.map((problem, index) => (
                  <div key={`${problem.questionId}_${index}`} className="p-2 bg-gray-50 rounded border border-gray-200 print:bg-transparent print:border-none print:p-0 print:mb-0">
                    <div className="flex gap-2 items-start">
                      <span className="font-bold text-blue-600 flex-shrink-0 w-5 text-xs print:w-4 print:text-[9px]">{index + 1}.</span>
                      <div className="flex-1">
                        <p className="text-gray-900 leading-tight print:leading-tight">
                          <span className="font-semibold text-gray-700">[{problem.category}]</span> {problem.questionText}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Rekomendasi */}
            <section className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg print:p-2 print:bg-white print:border-gray-300 print:border text-sm print:text-[10px] print:break-inside-avoid">
              <h2 className="text-lg font-bold text-blue-900 mb-2 print:text-xs print:mb-1">💡 REKOMENDASI</h2>
              <ul className="text-blue-900 space-y-1 print:space-y-0 print:grid print:grid-cols-2 print:gap-x-4">
                <li>• Konsultasikan hasil dengan guru BK</li>
                <li>• Cari solusi bersama keluarga & sekolah</li>
                <li>• Lakukan tindakan proaktif</li>
                <li>• Ikuti bimbingan konseling di sekolah</li>
              </ul>
            </section>

          
            {/* Dynamic Assessment Descriptions */}
            {(() => {
              const { ASSESSMENT_DESCRIPTIONS } = require('@/lib/assessmentDescriptions');
              const descriptionData = ASSESSMENT_DESCRIPTIONS['aum'];

              if (descriptionData) {
                return (
                  <div className="bg-white border-l-4 border-blue-500 p-4 rounded-lg mt-6 print:border-l-2 print:text-sm shadow-sm md:shadow-none border border-gray-100 md:border-none print:break-inside-avoid">
                    <h3 className="text-base font-bold text-gray-900 mb-4 print:text-sm print:mb-1 flex items-center gap-2">
                      📖 {descriptionData.title}
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {descriptionData.items.map((item: any) => (
                        <div key={item.label} className="bg-blue-50 p-3 rounded-lg border border-blue-100 print:bg-white print:border-gray-200">
                          <strong className="text-blue-700 block mb-1">{item.label}</strong>
                          <p className="text-xs text-gray-600 leading-snug">{item.description}</p>
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

        {/* Footer */}
        <div className="mt-4 text-center text-gray-600 text-sm print:text-[9px] print:mt-2">
          <p>© BK Dashboard - Dicetak pada {new Date().toLocaleDateString('id-ID')}</p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0;
            size: A4 portrait;
          }
          body {
            background: white;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            padding: 15mm;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
