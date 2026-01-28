import React, { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle } from 'lucide-react';
import { getAssessmentQuestions } from '@/lib/assessmentQuestionsDB';
import { Question } from '@/lib/assessmentQuestions';
import { submitAssessmentResult } from '@/lib/supabaseClient';
import AUMAssessmentForm from './AUMAssessmentForm';
import { generateClasses, type SchoolMode } from '@/lib/classHelper';
import { getSiswaByKelas } from '@/lib/siswaStorage';
import { TEMPERAMENT_DESCRIPTIONS } from '@/lib/assessmentConstants';
import type { SiswaAbsensi } from '@/lib/absensiTypes';

interface AssessmentFormProps {
  assessmentId: string;
  onBack: () => void;
  schoolMode: SchoolMode;
}

interface FormData {
  nama: string;
  kelas: string;
  jenisKelamin: string;
  [key: string]: string | number;
}

export default function AssessmentForm({ assessmentId, onBack, schoolMode }: AssessmentFormProps) {
  if (assessmentId === 'aum') {
    return <AUMAssessmentForm onBack={onBack} schoolMode={schoolMode} />;
  }

  const [step, setStep] = useState<'info' | 'questions' | 'result'>('info');
  const [formData, setFormData] = useState<FormData>({ nama: '', kelas: '', jenisKelamin: '' });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  // Data for Dropdowns
  const classOptions = generateClasses(schoolMode);
  const [studentOptions, setStudentOptions] = useState<SiswaAbsensi[]>([]);

  useEffect(() => {
    const loadQuestions = async () => {
      setQuestionsLoading(true);
      try {
        const data = await getAssessmentQuestions(assessmentId);
        setQuestions(data as Question[]);
      } catch (error) {
        console.error("Error loading questions:", error);
      } finally {
        setQuestionsLoading(false);
      }
    };
    loadQuestions();
  }, [assessmentId]);

  // Update student options when class changes
  useEffect(() => {
    const loadStudents = async () => {
      if (formData.kelas) {
        const students = await getSiswaByKelas(formData.kelas);
        setStudentOptions(students);
        // Reset name if class changes, but only if name isn't in new list (simple reset is safer)
        if (!students.some(s => s.nama === formData.nama)) {
          setFormData(prev => ({ ...prev, nama: '', jenisKelamin: '' }));
        }
      } else {
        setStudentOptions([]);
      }
    };
    loadStudents();
  }, [formData.kelas]);

  // Handle Name Selection
  const handleNameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    const student = studentOptions.find(s => s.nama === selectedName);

    setFormData(prev => ({
      ...prev,
      nama: selectedName,
      jenisKelamin: student ? student.jenisKelamin : ''
    }));
  }

  const totalQuestions = questions.length || 0;
  const progress = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;

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

  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) {
      alert('Pilih jawaban terlebih dahulu');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [questions[currentQuestion].id]: selectedAnswer,
    }));

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      handleSubmitAssessment();
    }
  };

  const handleSubmitAssessment = async () => {
    setLoading(true);
    try {
      await submitAssessmentResult(assessmentId, formData, questions);
      setStep('result');
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Terjadi kesalahan saat menyimpan hasil asesmen');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
      const prevAnswer = formData[questions[currentQuestion - 1].id];
      setSelectedAnswer(prevAnswer ? String(prevAnswer) : null);
    }
  };

  if (questionsLoading && step !== 'result') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat pertanyaan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-purple-50 py-4 md:py-8">
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
      <div className="container max-w-2xl px-4 mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium active:scale-95 transition-transform"
        >
          <ChevronLeft size={20} />
          Kembali ke Daftar Asesmen
        </button>

        {step === 'info' && (
          <div className="card p-4 md:p-8 shadow-sm">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Mulai Asesmen
            </h1>
            <p className="text-gray-600 mb-6 text-sm md:text-base">
              Silakan pilih kelas dan nama Anda sebelum memulai asesmen
            </p>

            <div className="space-y-4 md:space-y-6">

              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm md:text-base">
                  Kelas
                </label>
                <select
                  className="input-field w-full"
                  value={formData.kelas}
                  onChange={(e) => handleInfoChange('kelas', e.target.value)}
                >
                  <option value="">Pilih Kelas</option>
                  {classOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm md:text-base">
                  Nama Lengkap
                </label>
                {formData.kelas ? (
                  studentOptions.length > 0 ? (
                    <select
                      className="input-field w-full"
                      value={formData.nama}
                      onChange={handleNameChange}
                    >
                      <option value="">Pilih Siswa</option>
                      {studentOptions.map(student => (
                        <option key={student.id} value={student.nama}>{student.nama}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-red-500 text-sm italic">
                      Belum ada data siswa di kelas ini. Silakan input di "Manajemen Siswa".
                    </p>
                  )
                ) : (
                  <select disabled className="input-field w-full bg-gray-100 cursor-not-allowed">
                    <option>Pilih Kelas terlebih dahulu</option>
                  </select>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm md:text-base">
                  Jenis Kelamin
                </label>
                <input
                  type="text"
                  value={formData.jenisKelamin === 'L' ? 'Laki-laki' : formData.jenisKelamin === 'P' ? 'Perempuan' : ''}
                  disabled
                  className="input-field w-full bg-gray-100 text-gray-500 cursor-not-allowed"
                  placeholder="Otomatis terisi"
                />
              </div>

              <button
                onClick={handleStartQuestions}
                disabled={!formData.nama || !formData.kelas}
                className="btn-primary w-full text-base md:text-lg py-3 mt-4 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mulai Asesmen
              </button>
            </div>
          </div>
        )}

        {step === 'questions' && (
          <div className="card p-4 md:p-8 shadow-sm">
            {totalQuestions === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                  Tidak ada pertanyaan tersedia
                </h2>
                <p className="text-gray-600 mb-6">
                  Asesmen ini tidak memiliki pertanyaan. Hubungi administrator.
                </p>
                <button
                  onClick={onBack}
                  className="btn-primary w-full md:w-auto"
                >
                  Kembali
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6 md:mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xs md:text-sm font-medium text-gray-700">
                      Pertanyaan {currentQuestion + 1} dari {totalQuestions}
                    </h2>
                    <span className="text-xs md:text-sm font-medium text-blue-600">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {questions[currentQuestion] && (
                  <div className="animate-fade-in">
                    <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-6 md:mb-8 leading-snug">
                      {questions[currentQuestion].text}
                    </h3>

                    <div className="space-y-3">
                      {questions[currentQuestion].options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelectAnswer(option)}
                          disabled={loading}
                          className={`w-full p-4 text-left border-2 rounded-xl transition-all duration-200 active:scale-[0.99] touch-manipulation ${selectedAnswer === option
                            ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200 ring-opacity-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                            } disabled:opacity-50`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 border-2 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${selectedAnswer === option
                                ? 'border-blue-600 bg-blue-600'
                                : 'border-gray-400'
                                }`}
                            >
                              {selectedAnswer === option && (
                                <div className="w-2 h-2 bg-white rounded-full" />
                              )}
                            </div>
                            <span className="text-gray-900 font-medium text-sm md:text-base">{option}</span>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-3 md:gap-4 mt-8 pt-4 border-t border-gray-100">
                      <button
                        onClick={handlePreviousQuestion}
                        disabled={currentQuestion === 0 || loading}
                        className="btn-secondary flex-1 disabled:opacity-50 py-3 text-sm md:text-base"
                      >
                        ← Sebelumnya
                      </button>
                      <button
                        onClick={handleNextQuestion}
                        disabled={selectedAnswer === null || loading}
                        className="btn-primary flex-1 disabled:opacity-50 py-3 text-sm md:text-base shadow-md disabled:shadow-none"
                      >
                        {currentQuestion === totalQuestions - 1 ? 'Selesai' : 'Lanjutkan →'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {step === 'result' && submitted && (
          <div className="card p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={40} />
                </div>

              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Asesmen Selesai!
              </h1>
              <p className="text-gray-600">
                Terima kasih {formData.nama}. Berikut adalah gambaran hasil asesmen Anda.
              </p>
            </div>

            {(() => {
              const answers: Record<string, string> = {};
              questions.forEach((q) => {
                const val = formData[q.id];
                if (val) answers[q.id] = String(val);
              });

              const { calculateGenericResult } = require('@/lib/genericResultCalculator');
              const analysis = calculateGenericResult(answers, questions);

              return (
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 mb-8 text-center max-w-lg mx-auto">
                  <h2 className="text-lg font-semibold text-blue-900 mb-2">Hasil Dominan Anda</h2>
                  <p className="text-4xl font-bold text-blue-700 mb-2">{analysis.dominant}</p>
                  <p className="text-lg font-semibold text-blue-600 mb-4">
                    {(() => {
                      const dominantData = analysis.chartData.find((d: any) => d.label === analysis.dominant);
                      if (dominantData && dominantData.fullMark > 0) {
                        return `${Math.round((dominantData.value / dominantData.fullMark) * 100)}%`;
                      }
                      return '';
                    })()}
                  </p>
                  <p className="text-sm text-blue-800">
                    Diskusikan hasil ini dengan guru BK untuk pemahaman lebih lanjut.
                  </p>

                  {assessmentId === 'temperament' && TEMPERAMENT_DESCRIPTIONS[analysis.dominant] && (
                    <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200 text-sm text-gray-700 text-left">
                      <p><strong>💡 Tentang {analysis.dominant}:</strong></p>
                      <p className="italic">{TEMPERAMENT_DESCRIPTIONS[analysis.dominant]}</p>
                    </div>
                  )}

                  <div className="mt-6 text-left space-y-3">
                    <h3 className="font-semibold text-gray-700">Rincian Skor:</h3>
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
              );
            })()}

            <div className="flex justify-center gap-4 mb-6 print:hidden">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                🖨️ Cetak Hasil
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={onBack}
                className="btn-primary"
              >
                Kembali ke Daftar Asesmen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
