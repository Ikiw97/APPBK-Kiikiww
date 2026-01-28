import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AKPD_QUESTIONS, getAKPDQuestionsWithCustom, type AKPDQuestion } from '@/lib/akpdQuestions';
import { getAssessmentQuestions } from '@/lib/assessmentQuestionsDB';
import { calculateAKPDResult, AKPDResult } from '@/lib/akpdResultCalculator';
import { submitAssessmentResult } from '@/lib/supabaseClient';
import AKPDResultView from './AKPDResultView';
import { generateClasses, type SchoolMode } from '@/lib/classHelper';
import { getSiswaByKelas } from '@/lib/siswaStorage';
import type { SiswaAbsensi } from '@/lib/absensiTypes';

interface AKPDAssessmentFormProps {
  onBack: () => void;
  schoolMode: SchoolMode;
}

interface FormData {
  nama: string;
  kelas: string;
  jenisKelamin: string;
  [key: string]: string;
}

export default function AKPDAssessmentForm({ onBack, schoolMode }: AKPDAssessmentFormProps) {
  const [step, setStep] = useState<'info' | 'questions' | 'result'>('info');
  const [formData, setFormData] = useState<FormData>({ nama: '', kelas: '', jenisKelamin: '' });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [akpdResult, setAkpdResult] = useState<AKPDResult | null>(null);
  const [questions, setQuestions] = useState<AKPDQuestion[]>([]);
  const [studentOptions, setStudentOptions] = useState<SiswaAbsensi[]>([]);

  const classOptions = generateClasses(schoolMode);
  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = questions.length > 0 ? Math.round(((currentQuestionIndex + 1) / questions.length) * 100) : 0;

  // Load questions from Supabase (DB)
  useEffect(() => {
    const loadQuestions = async () => {
      setQuestionsLoading(true);
      try {
        const data = await getAssessmentQuestions('akpd');
        setQuestions(data as AKPDQuestion[]);
      } catch (error) {
        console.error("Error loading AKPD questions:", error);
        // Fallback to local storage/static if DB fails (handled by getAssessmentQuestions really but being safe)
        setQuestions(getAKPDQuestionsWithCustom());
      } finally {
        setQuestionsLoading(false);
      }
    };
    loadQuestions();
    loadQuestions();
  }, []);

  // Update student options when class changes
  useEffect(() => {
    const loadStudents = async () => {
      if (formData.kelas) {
        const students = await getSiswaByKelas(formData.kelas);
        setStudentOptions(students);
        // Reset name if class changes
        if (!students.some(s => s.nama === formData.nama)) {
          setFormData(prev => ({ ...prev, nama: '', jenisKelamin: '' }));
        }
      } else {
        setStudentOptions([]);
      }
    };
    loadStudents();
  }, [formData.kelas]);

  const handleNameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    const student = studentOptions.find(s => s.nama === selectedName);

    setFormData(prev => ({
      ...prev,
      nama: selectedName,
      jenisKelamin: student ? student.jenisKelamin : ''
    }));
  };

  const handleInfoChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStartQuestions = () => {
    if (!formData.nama.trim() || !formData.kelas.trim() || !formData.jenisKelamin.trim()) {
      alert('Mohon isi nama, kelas, dan jenis kelamin terlebih dahulu');
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
      [currentQuestion.id]: selectedAnswer,
    }));

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      handleSubmitAKPD();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setSelectedAnswer(formData[questions[currentQuestionIndex - 1].id] || null);
    }
  };

  const handleSubmitAKPD = async () => {
    setLoading(true);
    try {
      const result = calculateAKPDResult(
        formData.nama as string,
        formData.kelas as string,
        formData.jenisKelamin as string,
        formData,
        questions
      );
      setAkpdResult(result);

      // Save to Supabase
      await submitAssessmentResult('akpd', formData, questions as any);
      setStep('result');
    } catch (error) {
      console.error('Error submitting AKPD:', error);
      alert('Terjadi kesalahan saat menyimpan hasil');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'result' && akpdResult) {
    return <AKPDResultView result={akpdResult} onBack={onBack} />;
  }

  if (questionsLoading) {
    return (
      <div className="px-6 md:px-8 py-8 max-w-2xl mx-auto">
        <div className="card p-8 text-center">
          <p className="text-gray-600">Memuat pertanyaan...</p>
        </div>
      </div>
    );
  }

  if (step === 'info') {
    return (
      <div className="px-6 md:px-8 py-8 max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-medium"
        >
          <ChevronLeft size={20} />
          Kembali
        </button>

        <div className="card p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Angket Kebutuhan Peserta Didik (AKPD)</h1>
          <p className="text-gray-600 mb-8">
            Silakan isi data diri Anda terlebih dahulu sebelum mengisi angket
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Nama Lengkap
              </label>
              {formData.kelas ? (
                studentOptions.length > 0 ? (
                  <select
                    className="input-field"
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
                    Belum ada data siswa di kelas ini. Silakan input di "Data Master".
                  </p>
                )
              ) : (
                <select disabled className="input-field w-full bg-gray-100 cursor-not-allowed">
                  <option>Pilih Kelas terlebih dahulu</option>
                </select>
              )}
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
              className="btn-primary w-full py-3"
            >
              Mulai Asesmen
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="px-6 md:px-8 py-8 max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-medium"
        >
          <ChevronLeft size={20} />
          Kembali
        </button>

        <div className="card p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Tidak ada pertanyaan tersedia
          </h2>
          <p className="text-gray-600 mb-6">
            Asesmen AKPD tidak memiliki pertanyaan. Hubungi administrator.
          </p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="px-6 md:px-8 py-8 max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-medium"
        >
          <ChevronLeft size={20} />
          Kembali
        </button>

        <div className="card p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Pertanyaan tidak ditemukan
          </h2>
          <p className="text-gray-600 mb-6">
            Terjadi kesalahan saat memuat pertanyaan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-purple-50 py-4 md:py-8">
      <div className="px-4 md:px-8 max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium text-sm md:text-base active:scale-95 transition-transform"
        >
          <ChevronLeft size={20} />
          Kembali
        </button>

        <div className="card p-4 md:p-8 shadow-sm">
          {/* Progress Bar */}
          <div className="mb-6 md:mb-8">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xs md:text-sm font-medium text-gray-700">
                Pertanyaan {currentQuestionIndex + 1} dari {questions.length}
              </h2>
              <span className="text-xs md:text-sm font-bold text-blue-600">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Current Question */}
          <div className="mb-8">
            <div className="mb-4 inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs md:text-sm font-medium">
              {currentQuestion.category}
            </div>
            <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-6 leading-snug animate-fade-in">
              {currentQuestion.text}
            </h3>

            {/* Answer Options */}
            <div className="space-y-3">
              {['Ya', 'Tidak'].map((answer) => (
                <button
                  key={answer}
                  onClick={() => handleSelectAnswer(answer)}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all active:scale-[0.99] touch-manipulation ${selectedAnswer === answer
                    ? 'border-blue-600 bg-blue-50 text-gray-900 font-medium ring-2 ring-blue-200 ring-opacity-50'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selectedAnswer === answer
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-400'
                        }`}
                    >
                      {selectedAnswer === answer && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-sm md:text-base">{answer}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3 md:gap-4 mt-8 pt-4 border-t border-gray-100">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex items-center justify-center gap-2 px-4 py-3 flex-1 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base active:scale-95"
            >
              <ChevronLeft size={18} />
              Sebelumnya
            </button>

            <button
              onClick={handleNextQuestion}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base shadow-md active:scale-95"
            >
              {loading ? 'Menyimpan...' : currentQuestionIndex === questions.length - 1 ? 'Selesai' : 'Berikutnya'}
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
