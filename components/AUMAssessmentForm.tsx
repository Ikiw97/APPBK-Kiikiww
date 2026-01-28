import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { getAUMQuestionsWithCustom, AUM_CATEGORIES, Question } from '@/lib/assessmentQuestions';
import { getAssessmentQuestions } from '@/lib/assessmentQuestionsDB';
import { calculateAUMResult, AUMResult } from '@/lib/aumResultCalculator';
import { submitAssessmentResult } from '@/lib/supabaseClient';
import AUMResultView from './AUMResultView';
import { generateClasses, type SchoolMode } from '@/lib/classHelper';
import { getSiswaByKelas } from '@/lib/siswaStorage';
import type { SiswaAbsensi } from '@/lib/absensiTypes';

interface AUMAssessmentFormProps {
  onBack: () => void;
  schoolMode: SchoolMode;
}

interface FormData {
  nama: string;
  kelas: string;
  jenisKelamin: string;
  [key: string]: string | number;
}

export default function AUMAssessmentForm({ onBack, schoolMode }: AUMAssessmentFormProps) {
  const [step, setStep] = useState<'info' | 'questions' | 'result'>('info');
  const [formData, setFormData] = useState<FormData>({ nama: '', kelas: '', jenisKelamin: '' });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [aumResult, setAumResult] = useState<AUMResult | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string>('pribadi');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);

  // Data for Dropdowns
  const classOptions = generateClasses(schoolMode);
  const [studentOptions, setStudentOptions] = useState<SiswaAbsensi[]>([]);

  // Use DB loader
  useEffect(() => {
    const loadQuestions = async () => {
      setQuestionsLoading(true);
      try {
        const data = await getAssessmentQuestions('aum');
        setQuestions(data as Question[]);
      } catch (error) {
        console.error("Error loading AUM questions:", error);
        setQuestions(getAUMQuestionsWithCustom());
      } finally {
        setQuestionsLoading(false);
      }
    };
    loadQuestions();
  }, []);

  const categoryQuestions = questions.filter((q) => q.categoryId === currentCategory);
  const currentQuestionInCategory = categoryQuestions[currentQuestionIndex];

  // Update student options when class changes
  useEffect(() => {
    const loadStudents = async () => {
      if (formData.kelas) {
        const students = await getSiswaByKelas(formData.kelas);
        setStudentOptions(students);
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


  useEffect(() => {
    // Calculate total progress across all questions
    if (questions.length > 0) {
      const totalProgress = (questions.filter((q) => {
        const key = `question_${questions.indexOf(q)}`;
        return formData[key];
      }).length / questions.length) * 100;
    }
  }, [formData, questions]);

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

    const questionIndex = questions.indexOf(currentQuestionInCategory);
    setFormData((prev) => ({
      ...prev,
      [`question_${questionIndex}`]: selectedAnswer,
    }));

    // Move to next question
    if (currentQuestionIndex < categoryQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      // Move to next category
      const currentCategoryIndex = AUM_CATEGORIES.findIndex(
        (cat) => cat.id === currentCategory
      );
      if (currentCategoryIndex < AUM_CATEGORIES.length - 1) {
        const nextCategory = AUM_CATEGORIES[currentCategoryIndex + 1];
        setCurrentCategory(nextCategory.id);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
      } else {
        // All done
        handleSubmitAUM();
      }
    }
  };

  const handleSubmitAUM = async () => {
    setLoading(true);
    try {
      const result = calculateAUMResult(formData.nama as string, formData.kelas as string, formData.jenisKelamin as string, formData as Record<string, string>);
      setAumResult(result);

      // Save to Supabase
      await submitAssessmentResult('aum', formData, questions);
      setStep('result');
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Terjadi kesalahan saat menyimpan hasil asesmen');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      const prevQuestionIndex = questions.indexOf(categoryQuestions[currentQuestionIndex - 1]);
      const prevAnswer = formData[`question_${prevQuestionIndex}`];
      setSelectedAnswer(prevAnswer ? String(prevAnswer) : null);
    } else {
      // Move to previous category
      const currentCategoryIndex = AUM_CATEGORIES.findIndex(
        (cat) => cat.id === currentCategory
      );
      if (currentCategoryIndex > 0) {
        const prevCategory = AUM_CATEGORIES[currentCategoryIndex - 1];
        setCurrentCategory(prevCategory.id);
        const prevCategoryQuestions = questions.filter(
          (q) => q.categoryId === prevCategory.id
        );
        const newQuestionIndex = prevCategoryQuestions.length - 1;
        setCurrentQuestionIndex(newQuestionIndex);
        const prevQuestionObj = prevCategoryQuestions[newQuestionIndex];
        const globalQuestionIndex = questions.indexOf(prevQuestionObj);
        const prevAnswer = formData[`question_${globalQuestionIndex}`];
        setSelectedAnswer(prevAnswer ? String(prevAnswer) : null);
      }
    }
  };

  const getTotalProgress = () => {
    if (questions.length === 0) return 0;
    const answeredCount = questions.filter((q) => {
      const key = `question_${questions.indexOf(q)}`;
      return formData[key];
    }).length;
    return Math.round((answeredCount / questions.length) * 100);
  };

  const getCurrentCategoryProgress = () => {
    const categoryIndex = AUM_CATEGORIES.findIndex((cat) => cat.id === currentCategory);
    const totalCategories = AUM_CATEGORIES.length;
    return Math.round(((categoryIndex + 1) / totalCategories) * 100);
  };

  if (step === 'result' && aumResult) {
    return <AUMResultView result={aumResult} onBack={onBack} />;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-purple-50 py-4 md:py-8">
      <div className="container max-w-2xl px-4 mx-auto">
        {/* Header */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium text-sm md:text-base active:scale-95 transition-transform"
        >
          <ChevronLeft size={20} />
          Kembali ke Daftar Asesmen
        </button>

        {step === 'info' && (
          <div className="card p-4 md:p-8 shadow-sm">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Asesmen AUM (Alat Ungkap Masalah)
            </h1>
            <p className="text-gray-600 mb-6 text-sm md:text-base">
              Silakan isi informasi dasar Anda sebelum memulai asesmen. Asesmen ini terdiri dari 70 pertanyaan yang terbagi menjadi 7 bidang.
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

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <p className="text-xs md:text-sm text-blue-900">
                  <strong>ℹ️ Informasi:</strong> Asesmen ini akan menanyakan Anda tentang berbagai aspek kehidupan meliputi bidang pribadi, sosial, belajar, karier, keluarga, agama, dan nilai & moral.
                </p>
              </div>

              <button
                onClick={handleStartQuestions}
                disabled={!formData.nama || !formData.kelas}
                className="btn-primary w-full text-base md:text-lg py-3 mt-4 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mulai Asesmen
              </button>
            </div>
          </div>
        )}

        {step === 'questions' && currentQuestionInCategory && (
          <div className="card p-4 md:p-8 shadow-sm">
            {/* Overall Progress */}
            <div className="mb-6 md:mb-8">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xs md:text-sm font-medium text-gray-700">
                  Progress Keseluruhan
                </h2>
                <span className="text-xs md:text-sm font-medium text-blue-600">{getTotalProgress()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getTotalProgress()}%` }}
                />
              </div>
            </div>

            {/* Category Progress */}
            <div className="mb-6 pb-6 border-b border-gray-100">
              <div className="mb-4">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <span className="text-2xl">🧩</span>
                  {AUM_CATEGORIES.find((c) => c.id === currentCategory)?.label}
                </h3>
                <p className="text-xs md:text-sm text-gray-600">
                  Pertanyaan {currentQuestionIndex + 1} dari {categoryQuestions.length}
                </p>
              </div>

              {/* Category Buttons - Optimized Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {AUM_CATEGORIES.map((category) => {
                  const isCurrentCategory = category.id === currentCategory;
                  const categoryQs = questions.filter((q) => q.categoryId === category.id);
                  const answeredInCategory = categoryQs.filter((q) => {
                    const key = `question_${questions.indexOf(q)}`;
                    return formData[key];
                  }).length;
                  const isComplete = answeredInCategory === categoryQs.length;

                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        setCurrentCategory(category.id);
                        setCurrentQuestionIndex(0);
                      }}
                      className={`p-2 rounded-lg text-[10px] md:text-xs font-medium transition-all truncate active:scale-95 ${isCurrentCategory
                        ? 'bg-blue-600 text-white shadow-md'
                        : isComplete
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {category.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question */}
            <div className="mb-6 md:mb-8">
              <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-6 leading-snug animate-fade-in">
                {currentQuestionInCategory.text}
              </h2>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestionInCategory.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectAnswer(option)}
                    disabled={loading}
                    className={`w-full p-4 text-left border-2 rounded-xl transition-all duration-200 active:scale-[0.99] touch-manipulation ${selectedAnswer === option
                      ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200 ring-opacity-50'
                      : 'border-gray-200 hover:border-blue-600 hover:bg-gray-50'
                      } disabled:opacity-50`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 border-2 rounded-full flex-shrink-0 flex items-center justify-center transition-colors ${selectedAnswer === option
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
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 md:gap-4 mt-8 pt-4 border-t border-gray-100">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentCategory === 'pribadi' && currentQuestionIndex === 0 || loading}
                className="btn-secondary flex-1 disabled:opacity-50 py-3 text-sm md:text-base active:scale-95"
              >
                <ChevronLeft size={18} className="inline mr-1" />
                Sebelumnya
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={selectedAnswer === null || loading}
                className="btn-primary flex-1 disabled:opacity-50 py-3 text-sm md:text-base shadow-md active:scale-95"
              >
                Lanjutkan
                <ChevronRight size={18} className="inline ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
