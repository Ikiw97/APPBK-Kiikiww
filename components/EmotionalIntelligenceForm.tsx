import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, AlertCircle, Download, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { generateClasses, type SchoolMode } from '@/lib/classHelper';
import { submitAssessmentResult } from '@/lib/supabaseClient';
import { getAssessmentQuestions } from '@/lib/assessmentQuestionsDB';
import { Question } from '@/lib/assessmentQuestions';

interface EIResult {
  dimension: string;
  score: number;
  maxScore: number;
  percentage: number;
  level: string;
  description: string;
  tips: string[];
}

interface FormData {
  nama: string;
  kelas: string;
  jenisKelamin: string;
  [key: string]: string | number;
}

const DIMENSION_INFO: Record<string, { label: string; description: string; minScore: number; maxScore: number }> = {
  'self-awareness': {
    label: '🪞 Kesadaran Diri',
    description: 'Kemampuan mengenali dan memahami emosi sendiri',
    minScore: 4,
    maxScore: 20
  },
  'self-regulation': {
    label: '🎯 Pengelolaan Diri',
    description: 'Kemampuan mengelola dan mengontrol emosi',
    minScore: 4,
    maxScore: 20
  },
  'empathy': {
    label: '💝 Empati',
    description: 'Kemampuan memahami perasaan orang lain',
    minScore: 4,
    maxScore: 20
  },
  'relationship': {
    label: '🤝 Hubungan Sosial',
    description: 'Kemampuan membangun dan memelihara hubungan baik',
    minScore: 4,
    maxScore: 20
  },
  'motivation': {
    label: '⚡ Motivasi',
    description: 'Kemampuan termotivasi dan bersikap optimis',
    minScore: 4,
    maxScore: 20
  }
};

interface EmotionalIntelligenceFormProps {
  onBack?: () => void;
  schoolMode?: SchoolMode;
}

export default function EmotionalIntelligenceForm({ onBack, schoolMode = 'smp' }: EmotionalIntelligenceFormProps) {
  const [step, setStep] = useState<'info' | 'questions' | 'result'>('info');
  const [formData, setFormData] = useState<FormData>({ nama: '', kelas: '', jenisKelamin: '' });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [eiResults, setEiResults] = useState<EIResult[] | null>(null);

  const classOptions = generateClasses(schoolMode);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setQuestionsLoading(true);
        const data = await getAssessmentQuestions('emotional_intelligence') as Question[];
        setQuestions(data);
      } catch (error) {
        console.error("Error loading questions:", error);
      } finally {
        setQuestionsLoading(false);
      }
    };
    loadQuestions();
  }, []);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progressPercentage = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  const handleInfoChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStartQuestions = () => {
    if (!formData.nama.trim() || !formData.kelas.trim() || !formData.jenisKelamin.trim()) {
      alert('Mohon isi nama, kelas, dan jenis kelamin terlebih dahulu');
      return;
    }
    if (questions.length === 0) {
      alert('Gagal memuat pertanyaan. Silakan coba muat ulang halaman.');
      return;
    }
    setStep('questions');
  };

  const handleAnswer = async (scoreIndex: number) => {
    if (!currentQuestion) return;

    // Default scores 1-5 if not specified
    const scores = currentQuestion.scores || [1, 2, 3, 4, 5];
    const score = scores[scoreIndex];

    const newAnswers = {
      ...answers,
      [currentQuestion.id]: score
    };
    setAnswers(newAnswers);

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Save results to Supabase
      setLoading(true);
      try {
        // Create formData with answers for submission
        const submitData = {
          nama: formData.nama,
          kelas: formData.kelas,
          jenisKelamin: formData.jenisKelamin,
          ...newAnswers
        };

        // Create a simplified questions array for EI assessment history if needed
        const eiQuestionsForSubmit = questions.map((q) => ({
          id: q.id,
          question: q.text,
          dimension: q.dimension || q.category
        }));

        // Save to Supabase
        await submitAssessmentResult('emotional_intelligence', submitData, eiQuestionsForSubmit as any);

        // Calculate and display results
        const results = calculateResultsWithAnswers(newAnswers, questions);
        setEiResults(results);
        setShowResults(true);
      } catch (error) {
        console.error('Error saving results:', error);
        alert('Terjadi kesalahan saat menyimpan hasil. Hasil masih ditampilkan di layar.');
        // Show results anyway even if save failed
        const results = calculateResultsWithAnswers(newAnswers, questions);
        setEiResults(results);
        setShowResults(true);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleReset = () => {
    setFormData({ nama: '', kelas: '', jenisKelamin: '' });
    setAnswers({});
    setCurrentQuestionIndex(0);
    setStep('info');
    setShowResults(false);
    setEiResults(null);
  };

  const calculateResultsWithAnswers = (answersToUse: Record<string, number>, questionsList: Question[]): EIResult[] => {
    const results: EIResult[] = [];

    Object.keys(DIMENSION_INFO).forEach(dimension => {
      const dimensionQuestions = questionsList.filter(q => (q.dimension || q.category.toLowerCase()) === dimension);
      let totalScore = 0;
      let answeredCount = 0;

      dimensionQuestions.forEach(q => {
        if (answersToUse[q.id]) {
          totalScore += answersToUse[q.id];
          answeredCount++;
        }
      });

      const maxScore = dimensionQuestions.length * 5;
      const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

      let level = '';
      let tips: string[] = [];

      if (percentage >= 80) {
        level = 'Sangat Baik';
        tips = ['Teruskan! Emosi Anda sudah berkembang dengan baik.', 'Jadilah mentor bagi teman yang masih berkembang.'];
      } else if (percentage >= 65) {
        level = 'Baik';
        tips = ['Anda sudah menunjukkan tanda-tanda positif.', 'Terus latih kemampuan ini agar semakin kuat.'];
      } else if (percentage >= 50) {
        level = 'Cukup';
        tips = ['Ada ruang besar untuk improvement.', 'Mulai dengan satu aspek kecil dan tingkatkan secara bertahap.'];
      } else {
        level = 'Perlu Dikembangkan';
        tips = ['Ini adalah area penting untuk fokus.', 'Minta bantuan guru BK atau mentor untuk pengembangan lebih lanjut.'];
      }

      results.push({
        dimension,
        score: totalScore,
        maxScore,
        percentage,
        level,
        description: DIMENSION_INFO[dimension].description,
        tips
      });
    });

    return results;
  };

  const getOverallLevel = (results: EIResult[]): { label: string; color: string; icon: string } => {
    if (results.length === 0) {
      return { label: 'Belum Tersedia', color: 'bg-gray-100 border-gray-300 text-gray-900', icon: '○' };
    }
    const avgPercentage = results.reduce((sum, r) => sum + r.percentage, 0) / results.length;
    if (avgPercentage >= 80) return { label: 'Sangat Baik', color: 'bg-green-100 border-green-300 text-green-900', icon: '⭐⭐⭐' };
    if (avgPercentage >= 65) return { label: 'Baik', color: 'bg-blue-100 border-blue-300 text-blue-900', icon: '⭐⭐' };
    if (avgPercentage >= 50) return { label: 'Cukup', color: 'bg-yellow-100 border-yellow-300 text-yellow-900', icon: '⭐' };
    return { label: 'Perlu Dikembangkan', color: 'bg-red-100 border-red-300 text-red-900', icon: '◐' };
  };

  // Show info step
  if (step === 'info') {
    return (
      <div className="px-6 md:px-8 py-8 max-w-2xl mx-auto">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-pink-600 hover:text-pink-700 mb-8 font-medium"
          >
            <ChevronLeft size={20} />
            Kembali
          </button>
        )}

        <div className="card p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Assessment Kecerdasan Emosi</h1>
          <p className="text-gray-600 mb-8">
            Silakan isi data diri Anda terlebih dahulu sebelum mengisi assessment
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Masukkan nama lengkap"
                value={formData.nama}
                onChange={(e) => handleInfoChange('nama', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Kelas
              </label>
              <select
                className="input-field"
                value={formData.kelas}
                onChange={(e) => handleInfoChange('kelas', e.target.value)}
              >
                <option value="">Pilih Kelas</option>
                {classOptions.map((cls) => (
                  <option key={cls.value} value={cls.value}>
                    {cls.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Jenis Kelamin
              </label>
              <select
                className="input-field"
                value={formData.jenisKelamin}
                onChange={(e) => handleInfoChange('jenisKelamin', e.target.value)}
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>

            <button
              onClick={handleStartQuestions}
              disabled={questionsLoading}
              className="btn-primary w-full py-3 flex justify-center items-center gap-2"
            >
              {questionsLoading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
                  Memuat Pertanyaan...
                </>
              ) : 'Mulai Asesmen'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state for questions
  if (questionsLoading && !showResults) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat pertanyaan...</p>
        </div>
      </div>
    );
  }

  // Show questions and results
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-8">
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
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium mb-4 transition-colors"
            >
              <ArrowLeft size={20} />
              Kembali
            </button>
          )}
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Assessment Kecerdasan Emosi</h1>
          <p className="text-gray-600">Pahami kecerdasan emosi dan identifikasi area pengembangan diri Anda</p>
        </div>

        {!showResults && currentQuestion ? (
          <div className="card p-8 shadow-xl">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-gray-700">
                  Pertanyaan {currentQuestionIndex + 1} dari {totalQuestions}
                </span>
                <span className="text-sm font-semibold text-pink-600">
                  {progressPercentage.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Dimension Badge */}
            <div className="mb-8">
              <div className="inline-block bg-pink-100 text-pink-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                {currentQuestion.dimension ? DIMENSION_INFO[currentQuestion.dimension]?.label || currentQuestion.category : currentQuestion.category}
              </div>

              {currentQuestion.scenario && (
                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 font-semibold">📖 Skenario:</p>
                  <p className="text-gray-800 mt-2">{currentQuestion.scenario}</p>
                </div>
              )}

              <h2 className="text-2xl font-bold text-gray-900">
                {currentQuestion.text}
              </h2>
              <p className="text-gray-600 text-sm mt-2">
                {currentQuestion.dimension && DIMENSION_INFO[currentQuestion.dimension] ? DIMENSION_INFO[currentQuestion.dimension].description : ''}
              </p>
            </div>

            {/* Answer Options */}
            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((answer, index) => {
                const currentScore = currentQuestion.scores ? currentQuestion.scores[index] : index + 1;
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${answers[currentQuestion.id] === currentScore
                      ? 'border-pink-500 bg-pink-50 text-pink-900 font-semibold'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-pink-300 hover:bg-pink-50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${answers[currentQuestion.id] === currentScore
                        ? 'border-pink-500 bg-pink-500'
                        : 'border-gray-300'
                        }`}>
                        {answers[currentQuestion.id] === currentScore && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span>{answer}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${currentQuestionIndex === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                ← Sebelumnya
              </button>
              <button
                disabled={!answers[currentQuestion.id] || loading}
                // Auto advance logic is in handleAnswer, but if user wants to click "Next" explicitly...
                // The original form used auto advance on click, so this button also triggers "Next" if answer selected?
                // Original logic for "Next" button: calls handleAnswer with CURRENT selected answer.
                onClick={() => {
                  const scores = currentQuestion.scores || [1, 2, 3, 4, 5];
                  const currentScore = answers[currentQuestion.id];
                  if (currentScore !== undefined) {
                    const index = scores.indexOf(currentScore);
                    if (index !== -1) handleAnswer(index);
                  }
                }}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${!answers[currentQuestion.id] || loading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-lg'
                  }`}
              >
                {loading ? 'Menyimpan...' : currentQuestionIndex === totalQuestions - 1 ? 'Selesai' : 'Berikutnya →'}
              </button>
            </div>
          </div>
        ) : showResults ? (
          <div className="space-y-6">
            {/* Results Header */}
            <div className="card p-8 bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Heart size={32} />
                <div>
                  <h2 className="text-2xl font-bold">Assessment Selesai!</h2>
                  <p className="text-pink-100">Hasil assessment kecerdasan emosi Anda telah dianalisis</p>
                </div>
              </div>
            </div>

            {/* Student Info */}
            <div className="card p-6 bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Data Peserta</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nama</p>
                  <p className="font-semibold text-gray-900">{formData.nama}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Kelas</p>
                  <p className="font-semibold text-gray-900">{formData.kelas}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Jenis Kelamin</p>
                  <p className="font-semibold text-gray-900">{formData.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                </div>
              </div>
            </div>

            {/* Overall Score */}
            <div className={`card p-8 border-2 ${getOverallLevel(eiResults || []).color}`}>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Kecerdasan Emosi Keseluruhan</p>
                <div className="text-5xl font-bold mb-2" style={{
                  color: getOverallLevel(eiResults || []).color.includes('green') ? '#059669' :
                    getOverallLevel(eiResults || []).color.includes('blue') ? '#2563eb' :
                      getOverallLevel(eiResults || []).color.includes('yellow') ? '#d97706' : '#dc2626'
                }}>
                  {getOverallLevel(eiResults || []).icon}
                </div>
                <p className="text-2xl font-semibold text-gray-900">
                  {getOverallLevel(eiResults || []).label}
                </p>
              </div>
            </div>

            {/* Actions: Print/PDF */}
            <div className="flex justify-center gap-4 mb-2 print:hidden">
              <button
                onClick={() => {
                  alert("Untuk mengunduh PDF: \n1. Jendela cetak akan terbuka\n2. Pada bagian 'Tujuan' atau 'Destination', pilih 'Save as PDF' atau 'Simpan sebagai PDF'\n3. Klik Simpan/Save");
                  window.print();
                }}
                className="flex items-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors shadow-sm font-medium"
              >
                <Download size={20} />
                Unduh PDF / Cetak
              </button>
            </div>

            {/* Detailed Results */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Detail Per Dimensi</h3>
              {eiResults?.map((result, idx) => (
                <div key={idx} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-pink-600 font-semibold mb-1">{DIMENSION_INFO[result.dimension]?.label}</div>
                      <p className="text-gray-600 text-sm">{result.description}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${result.level === 'Sangat Baik' ? 'bg-green-100 text-green-800' :
                      result.level === 'Baik' ? 'bg-blue-100 text-blue-800' :
                        result.level === 'Cukup' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {result.level}
                    </div>
                  </div>

                  <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                    <div
                      className={`h-2 rounded-full ${result.percentage >= 80 ? 'bg-green-500' :
                        result.percentage >= 65 ? 'bg-blue-500' :
                          result.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      style={{ width: `${result.percentage}%` }}
                    ></div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-900 mb-2">💡 Tips Pengembangan:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {result.tips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

          </div>
        ) : null}
      </div>
    </div>
  );
}
