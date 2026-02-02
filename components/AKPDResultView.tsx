import React from 'react';
import { ChevronLeft, Download, BarChart3 } from 'lucide-react';
import { AKPDResult } from '@/lib/akpdResultCalculator';

interface AKPDResultViewProps {
  result: AKPDResult;
  onBack: () => void;
}

export default function AKPDResultView({ result, onBack }: AKPDResultViewProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'akpd', result }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hasil-akpd-${result.studentName}.pdf`;
        a.click();
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Gagal mengunduh PDF');
    }
  };

  const getProblemLevelColor = (percentage: number) => {
    if (percentage > 50) return 'text-red-600';
    if (percentage > 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProblemLevelBg = (percentage: number) => {
    if (percentage > 50) return 'bg-red-50 border-red-300';
    if (percentage > 30) return 'bg-yellow-50 border-yellow-300';
    return 'bg-green-50 border-green-300';
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

        {/* Main Result Card */}
        <div className="card p-4 md:p-8 mb-8 print:p-0 print:shadow-none print:mb-0 print:border-none">
          {/* Title */}
          <div className="text-center print:text-left mb-6 print:mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 print:text-xl">
              Hasil Asesmen AKPD
            </h1>
            <p className="text-gray-600 print:text-sm">
              Angket Kebutuhan Peserta Didik
            </p>
          </div>

          {/* Student Info */}
          <div className="bg-gray-50 p-4 md:p-6 rounded-lg mb-6 md:mb-8 border border-gray-200 print:p-4 print:mb-4 print:bg-white print:border-gray-300">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
              <div>
                <p className="text-sm text-gray-600 print:text-xs">Nama Siswa</p>
                <p className="text-base md:text-lg font-semibold text-gray-900 print:text-sm truncate">{result.studentName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 print:text-xs">Kelas</p>
                <p className="text-base md:text-lg font-semibold text-gray-900 print:text-sm">{result.schoolClass}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 print:text-xs">Jenis Kelamin</p>
                <p className="text-base md:text-lg font-semibold text-gray-900 print:text-sm">{result.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 print:text-xs">Tanggal</p>
                <p className="text-base md:text-lg font-semibold text-gray-900 print:text-sm">
                  {new Date(result.submittedAt).toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>
          </div>

          {/* Main Score - Compact for Print */}
          {(() => {
            // Find the highest scoring bidang
            const highestBidang = result.fieldScores.reduce((max, field) =>
              field.categoryPercentage > max.categoryPercentage ? field : max
              , result.fieldScores[0]);

            return (
              <div className={`p-6 rounded-lg border-2 mb-6 md:mb-8 print:p-4 print:mb-4 print:border ${getProblemLevelBg(result.problemPercentage)}`}>
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 print:flex-row print:gap-8 print:justify-start">
                  {/* Tingkat Masalah */}
                  <div className="text-center print:text-left">
                    <p className="text-gray-700 mb-1 font-medium print:text-sm">Tingkat Masalah</p>
                    <div className={`text-4xl md:text-5xl font-bold ${getProblemLevelColor(result.problemPercentage)} print:text-3xl`}>
                      {result.problemPercentage}%
                    </div>
                  </div>

                  <div className="hidden md:block print:block w-px h-16 bg-gray-300"></div>

                  {/* Level Info */}
                  <div className="text-center md:text-left print:text-left">
                    <p className="text-base md:text-lg text-gray-700 font-semibold print:text-sm">
                      {result.totalProblems} dari 50 pertanyaan
                    </p>
                    <p className="text-gray-600 mt-1 text-sm print:text-xs">
                      {result.problemPercentage > 50
                        ? `⚠️ Level TINGGI - Butuh perhatian khusus`
                        : result.problemPercentage > 30
                          ? `⚠️ Level SEDANG - Perlu bimbingan`
                          : '✓ Level RENDAH - Kondisi baik'}
                    </p>
                  </div>

                  <div className="hidden md:block print:block w-px h-16 bg-gray-300"></div>

                  {/* Bidang Tertinggi */}
                  {highestBidang && (
                    <div className="text-center md:text-left print:text-left bg-white/50 p-3 rounded-lg border border-gray-200/50">
                      <p className="text-gray-600 text-xs font-medium mb-1 print:text-[10px]">📊 Bidang Level Tertinggi</p>
                      <p className="text-base md:text-lg font-bold text-gray-900 print:text-sm">
                        {highestBidang.fieldName}
                      </p>
                      <p className={`text-sm font-semibold ${getProblemLevelColor(highestBidang.categoryPercentage)} print:text-xs`}>
                        {highestBidang.categoryPercentage}% ({highestBidang.problemCount} masalah)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Category Breakdown */}
          <h2 className="text-xl font-bold text-gray-900 mb-4 print:text-lg print:mb-2">Analisis per Kategori</h2>

          {/* Field Summary - Grid Layout optimization */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 print:grid-cols-4 print:gap-2 print:mb-4">
            {result.fieldScores.map((field, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-200 print:bg-white print:border-gray-200 print:p-2">
                <p className="text-xs font-semibold text-gray-700 mb-1 truncate" title={field.fieldName}>{field.fieldName}</p>
                <div className="flex items-end gap-2">
                  <p className="text-xl font-bold text-blue-600 print:text-lg">{field.categoryPercentage}%</p>
                  <p className="text-[10px] text-gray-600 pb-1">({field.problemCount})</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg print:bg-white print:border-gray-300 print:p-3 print:border-l-2 print:text-sm">
            <h3 className="text-base font-bold text-blue-900 mb-2 print:text-sm print:mb-1">💡 REKOMENDASI</h3>
            <ul className="text-blue-900 space-y-1 text-sm print:text-xs print:text-gray-800">
              {result.problemPercentage > 50 ? (
                <>
                  <li>• Segera konsultasikan dengan guru BK</li>
                  <li>• Identifikasi masalah utama di {result.fieldScores[0]?.fieldName}</li>
                  <li>• Ikuti program bimbingan intensif</li>
                  <li>• Melibatkan orang tua dalam proses</li>
                </>
              ) : result.problemPercentage > 30 ? (
                <>
                  <li>• Konsultasi dengan guru BK</li>
                  <li>• Identifikasi area masalah di {result.fieldScores[0]?.fieldName}</li>
                  <li>• Tingkatkan kesadaran diri</li>
                </>
              ) : (
                <>
                  <li>• Pertahankan kondisi kesehatan mental</li>
                  <li>• Berpartisipasi aktif dalam kegiatan sekolah</li>
                  <li>• Konsultasi jika ada perubahan kondisi</li>
                </>
              )}
            </ul>
          </div>


          {/* Dynamic Assessment Descriptions */}
          {(() => {
            const { ASSESSMENT_DESCRIPTIONS } = require('@/lib/assessmentDescriptions');
            const descriptionData = ASSESSMENT_DESCRIPTIONS['akpd'];

            if (descriptionData) {
              return (
                <div className="bg-white border-l-4 border-purple-500 p-4 rounded-lg mt-6 print:hidden shadow-sm md:shadow-none border border-gray-100 md:border-none">
                  <h3 className="text-base font-bold text-gray-900 mb-4 print:text-sm print:mb-1 flex items-center gap-2">
                    📖 {descriptionData.title}
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {descriptionData.items.map((item: any) => (
                      <div key={item.label} className="bg-purple-50 p-3 rounded-lg border border-purple-100 print:bg-white print:border-gray-200">
                        <strong className="text-purple-700 block mb-1">{item.label}</strong>
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

        {/* Footer */}
        <div className="mt-4 text-center text-gray-400 text-xs print:mt-8 print:text-[10px]">
          <p>© BK Dashboard - Dicetak pada {new Date().toLocaleDateString('id-ID')}</p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0 !important;
            size: A4 portrait;
          }
          
          /* Hide browser headers and footers */
          html {
            margin: 0 !important;
            padding: 0 !important;
          }
          
          body {
            background: white !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            padding: 10mm !important;
            margin: 0 !important;
            font-size: 11px !important;
          }
          
          /* Hide navigation and non-essential elements */
          .print\\:hidden {
            display: none !important;
          }
          
          /* Override sidebar and other page elements */
          nav, header, footer, aside {
            display: none !important;
          }
          
          /* Compact spacing for one page */
          .print\\:p-4 {
            padding: 8px !important;
          }
          
          .print\\:mb-4 {
            margin-bottom: 8px !important;
          }
          
          .print\\:gap-2 {
            gap: 6px !important;
          }
          
          /* Ensure content fits on one page */
          .max-w-4xl {
            max-width: 100% !important;
          }
          
          /* Hide URL and page info */
          title, link[rel="canonical"] {
            display: none !important;
          }
        }
        
        /* Additional rule to disable headers/footers in most browsers */
        @page {
          margin: 0;
        }
      `}</style>
    </div>
  );
}
