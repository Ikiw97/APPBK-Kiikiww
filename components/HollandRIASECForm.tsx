import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, CheckCircle, ChevronLeft, Printer,
  Wrench, TestTube, Palette, Heart, Briefcase, Calculator,
  BarChart3, User
} from 'lucide-react';
import { generateClasses, type SchoolMode } from '@/lib/classHelper';
import { submitAssessmentResult } from '@/lib/supabaseClient';
import { getAssessmentQuestions } from '@/lib/assessmentQuestionsDB';
import { Question as DBQuestion } from '@/lib/assessmentQuestions';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

// Tipe Data
interface Question {
  id: string;
  type: 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
  question: string;
  options: {
    label: string;
    value: number; // 0-4 scale or just binary? Usually Likert for personality
  }[];
}

interface Result {
  scores: {
    R: number;
    I: number;
    A: number;
    S: number;
    E: number;
    C: number;
  };
  topThree: string[];
  code: string; // e.g., "RIA"
  description: string;
  careers: string[];
}

interface FormData {
  nama: string;
  kelas: string;
  jenisKelamin: string;
  [key: string]: string | number;
}

// Mapping Dimensi Holland
const RIASEC_INFO = {
  R: {
    label: 'Realistic (Doers)',
    icon: Wrench,
    color: '#ef4444', // Red-500
    description: 'Orang yang praktis, menyukai kegiatan fisik, bekerja dengan mesin atau alat, dan lebih suka bekerja dengan benda daripada manusia atau ide.',
    careers: ['Teknik Mesin', 'Otomotif', 'Pertanian', 'Peternakan', 'Atlet', 'Polisi', 'Militer', 'Pilot', 'Arsitek Lanskap', 'Chef']
  },
  I: {
    label: 'Investigative (Thinkers)',
    icon: TestTube,
    color: '#f59e0b', // Amber-500
    description: 'Orang yang analitis, intelektual, suka mengamati, meneliti, dan memecahkan masalah kompleks. Menyukai sains dan matematika.',
    careers: ['Ilmuwan', 'Dokter', 'Apoteker', 'Programmer', 'Ahli Matematika', 'Peneliti', 'Psikolog', 'Analis Sistem', 'Ahli Biologi']
  },
  A: {
    label: 'Artistic (Creators)',
    icon: Palette,
    color: '#ec4899', // Pink-500
    description: 'Orang yang kreatif, ekspresif, orisinal, dan independen. Menyukai seni, drama, musik, dan penulisan. Menghindari rutinitas berulang.',
    careers: ['Desainer Grafis', 'Penulis', 'Musisi', 'Aktor', 'Arsitek', 'Fotografer', 'Jurnalis', 'Desainer Interior', 'Animator']
  },
  S: {
    label: 'Social (Helpers)',
    icon: Heart,
    color: '#3b82f6', // Blue-500
    description: 'Orang yang suka membantu, mengajar, menyembuhkan, dan melayani orang lain. Memiliki kemampuan komunikasi dan interpersonal yang baik.',
    careers: ['Guru', 'Konselor', 'Perawat', 'Pekerja Sosial', 'Psikolog', 'Human Resources (HRD)', 'Pelatih', 'Terapis', 'Customer Service']
  },
  E: {
    label: 'Enterprising (Persuaders)',
    icon: Briefcase,
    color: '#8b5cf6', // Violet-500
    description: 'Orang yang energik, ambisius, suka memimpin dan meyakinkan orang lain. Tertarik pada bisnis, politik, dan kewirausahaan.',
    careers: ['Pengusaha', 'Manajer', 'Pengacara', 'Politisi', 'Sales/Marketing', 'Real Estate Agent', 'Event Organizer', 'Kepala Sekolah']
  },
  C: {
    label: 'Conventional (Organizers)',
    icon: Calculator,
    color: '#10b981', // Emerald-500
    description: 'Orang yang teratur, rapi, teliti, dan suka bekerja dengan data atau angka. Menyukai struktur, aturan, dan prosedur yang jelas.',
    careers: ['Akuntan', 'Administrasi', 'Sekretaris', 'Bankir', 'Pustakawan', 'Data Entry', 'Pegawai Negeri', 'Staf Keuangan', 'Arsiparis']
  }
};

// Imports
import { getSiswaByKelas } from '@/lib/siswaStorage';
import type { SiswaAbsensi } from '@/lib/absensiTypes';

interface HollandRIASECFormProps {
  onBack?: () => void;
  schoolMode?: SchoolMode;
}

export default function HollandRIASECForm({ onBack, schoolMode = 'smp' }: HollandRIASECFormProps) {
  const [step, setStep] = useState<'info' | 'questions' | 'result'>('info');
  const [formData, setFormData] = useState<FormData>({ nama: '', kelas: '', jenisKelamin: '', nis: '' });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);

  // Student Data Integration State
  const [students, setStudents] = useState<SiswaAbsensi[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Load Questions
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const dbQuestions = await getAssessmentQuestions('riasec');

        // Map DB questions to local format
        if (dbQuestions && dbQuestions.length > 0) {
          const mappedQuestions: Question[] = (dbQuestions as DBQuestion[]).map(q => ({
            id: q.id,
            type: (q.category || 'R') as any,
            question: q.text,
            options: [
              { label: 'Sangat Tidak Suka', value: 1 },
              { label: 'Tidak Suka', value: 2 },
              { label: 'Netral', value: 3 },
              { label: 'Suka', value: 4 },
              { label: 'Sangat Suka', value: 5 }
            ]
          }));
          setQuestions(mappedQuestions);
        } else {
          console.warn("No RIASEC questions found in DB");
        }
      } catch (err) {
        console.error("Error loading questions", err);
      } finally {
        setQuestionsLoading(false);
      }
    };
    loadQuestions();
  }, []);

  // Load Students when Class changes
  useEffect(() => {
    const loadStudents = async () => {
      if (!formData.kelas) {
        setStudents([]);
        return;
      }
      setLoadingStudents(true);
      try {
        const data = await getSiswaByKelas(formData.kelas);
        setStudents(data);
      } catch (error) {
        console.error('Error loading students:', error);
      } finally {
        setLoadingStudents(false);
      }
    };
    loadStudents();
  }, [formData.kelas]);

  const classOptions = generateClasses(schoolMode);
  const currentQuestion = questions.length > 0 ? questions[currentQuestionIndex] : null;
  const totalQuestions = questions.length;
  const progressPercentage = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  const handleInfoChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Reset student selection if class changes
    if (field === 'kelas') {
      setFormData(prev => ({ ...prev, kelas: value, nama: '', nis: '', jenisKelamin: '' }));
    }
  };

  const handleStudentChange = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setFormData(prev => ({
        ...prev,
        nama: student.nama,
        jenisKelamin: student.jenisKelamin || '',
        nis: student.nis
      }));
    }
  };

  const handleStartQuestions = () => {
    if (!formData.nama.trim() || !formData.kelas.trim() || !formData.jenisKelamin.trim()) {
      alert('Mohon lengkapi data diri terlebih dahulu');
      return;
    }
    if (questions.length === 0) {
      alert('Pertanyaan belum dimuat atau tidak tersedia. Mohon hubungi admin.');
      return;
    }
    setStep('questions');
  };

  const handleOptionSelect = (value: number) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
    // Auto-advance removed - users must click "Selanjutnya" to proceed
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = async () => {
    if (!currentQuestion) return;
    if (!answers[currentQuestion.id]) {
      alert('Silakan pilih salah satu jawaban terlebih dahulu.');
      return;
    }

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      await submitResults();
    }
  };

  const calculateResult = (finalAnswers: Record<string, number>): Result => {
    const scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

    questions.forEach(q => {
      const val = finalAnswers[q.id] || 0;
      if (q.type && scores.hasOwnProperty(q.type)) {
        scores[q.type] += val;
      }
    });

    const sortedDimensions = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .map(([key]) => key as keyof typeof scores);

    const topThree = sortedDimensions.slice(0, 3);
    const code = topThree.join('');

    const dominantType = topThree[0];
    const dominantDesc = RIASEC_INFO[dominantType as keyof typeof RIASEC_INFO].description;

    const primaryCareers = RIASEC_INFO[topThree[0] as keyof typeof RIASEC_INFO].careers;
    const secondaryCareers = RIASEC_INFO[topThree[1] as keyof typeof RIASEC_INFO].careers;
    const careers = [...new Set([...primaryCareers.slice(0, 5), ...secondaryCareers.slice(0, 5)])];

    return {
      scores,
      topThree,
      code,
      description: `Tipe kepribadian dominan Anda adalah ${RIASEC_INFO[dominantType as 'R'].label}. ${dominantDesc}`,
      careers
    };
  };

  const submitResults = async () => {
    setLoading(true);
    try {
      const calculatedResult = calculateResult(answers);

      const submitData = {
        nama: formData.nama,
        kelas: formData.kelas,
        jenisKelamin: formData.jenisKelamin,
        nis: formData.nis,
        ...answers,
        score_r: calculatedResult.scores.R,
        score_i: calculatedResult.scores.I,
        score_a: calculatedResult.scores.A,
        score_s: calculatedResult.scores.S,
        score_e: calculatedResult.scores.E,
        score_c: calculatedResult.scores.C,
        holland_code: calculatedResult.code
      };

      const questionsForSubmit = questions.map(q => ({ id: q.id }));

      await submitAssessmentResult('riasec', submitData, questionsForSubmit as any);

      setResult(calculatedResult);
      setStep('result');
    } catch (error) {
      console.error('Error saving results:', error);
      alert('Terjadi kesalahan saat menyimpan hasil. Namun hasil tetap akan ditampilkan.');
      setResult(calculateResult(answers));
      setStep('result');
    } finally {
      setLoading(false);
    }
  };

  const ChartData = result ? [
    { name: 'Realistic', score: result.scores.R, code: 'R', fill: RIASEC_INFO.R.color },
    { name: 'Investigative', score: result.scores.I, code: 'I', fill: RIASEC_INFO.I.color },
    { name: 'Artistic', score: result.scores.A, code: 'A', fill: RIASEC_INFO.A.color },
    { name: 'Social', score: result.scores.S, code: 'S', fill: RIASEC_INFO.S.color },
    { name: 'Enterprising', score: result.scores.E, code: 'E', fill: RIASEC_INFO.E.color },
    { name: 'Conventional', score: result.scores.C, code: 'C', fill: RIASEC_INFO.C.color },
  ] : [];

  if (step === 'info') {
    return (
      <div className="px-6 md:px-8 py-8 max-w-2xl mx-auto">
        {onBack && (
          <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-8 font-medium transition-colors">
            <ArrowLeft size={20} /> Kembali
          </button>
        )}

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
              <User className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Asesmen Minat Karir RIASEC</h1>
            <p className="text-slate-500 max-w-md mx-auto">
              Temukan tipe kepribadian dan rekomendasi karir yang sesuai dengan minat Anda menggunakan metode Holland Code.
            </p>
          </div>

          <div className="space-y-5">
            {/* Kelas Selection First */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Kelas</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none bg-white"
                value={formData.kelas}
                onChange={(e) => handleInfoChange('kelas', e.target.value)}
              >
                <option value="">Pilih Kelas</option>
                {classOptions.map((cls) => (
                  <option key={cls.value} value={cls.value}>{cls.label}</option>
                ))}
              </select>
            </div>

            {/* Student Selection (Dependent on Class) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Siswa</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none bg-white disabled:bg-slate-50 disabled:text-slate-400"
                value={students.find(s => s.nama === formData.nama)?.id || ''}
                onChange={(e) => handleStudentChange(e.target.value)}
                disabled={!formData.kelas || loadingStudents}
              >
                <option value="">
                  {loadingStudents ? 'Memuat data siswa...' : (!formData.kelas ? 'Pilih kelas terlebih dahulu' : 'Pilih Siswa')}
                </option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.nama} ({student.nis})
                  </option>
                ))}
              </select>
            </div>

            {/* Read-only / Confirmation Fields */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">NIS</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed outline-none"
                  value={formData.nis || '-'}
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Jenis Kelamin</label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 appearance-none outline-none cursor-not-allowed"
                    value={formData.jenisKelamin}
                    disabled
                  >
                    <option value="">-</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                  {/* Visual indicator that it's auto-filled */}
                  {formData.jenisKelamin && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
                      <CheckCircle size={16} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleStartQuestions}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-1 transition-all mt-4"
            >
              Mulai Asesmen
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'result' && result) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 print:bg-white print:py-0">
        <div className="max-w-5xl mx-auto px-4 print:px-0">
          {/* Header Navigation */}
          <div className="flex justify-between items-center mb-8 print:hidden">
            {onBack && (
              <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-800 font-medium transition-colors">
                <ArrowLeft size={20} /> Kembali ke Menu
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium shadow-sm transition-colors"
            >
              <Printer size={18} /> Cetak Hasil
            </button>
          </div>

          {/* Result Content */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden print:shadow-none print:rounded-none">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 p-8 text-white text-center print:bg-none print:text-black print:border-b print:p-4">
              <h1 className="text-3xl font-bold mb-2">Hasil Asesmen RIASEC</h1>
              <div className="flex justify-center gap-6 text-orange-100 font-medium print:text-slate-600 print:text-sm">
                <span>Nama: {formData.nama}</span>
                <span>•</span>
                <span>Kelas: {formData.kelas}</span>
              </div>
            </div>

            <div className="p-8 print:p-4">
              {/* Top Result Section */}
              <div className="text-center mb-12 print:mb-6">
                <p className="text-slate-500 mb-4 font-medium uppercase tracking-wider text-sm">Kode Kepribadian Anda</p>
                <div className="inline-flex items-center justify-center gap-2 mb-6">
                  {result.topThree.map((code, idx) => (
                    <span key={idx} className={`text-6xl font-black ${idx === 0 ? 'text-orange-600' : 'text-slate-300'}`}>
                      {code}
                    </span>
                  ))}
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3">
                  {RIASEC_INFO[result.topThree[0] as 'R'].label}
                </h2>
                <p className="text-slate-600 max-w-3xl mx-auto leading-relaxed text-lg">
                  {result.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12 print:grid-cols-1 print:gap-6">
                {/* Chart Section */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 print:bg-white print:border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <BarChart3 size={20} className="text-orange-500" />
                    Profil Minat
                  </h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ChartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: '#64748b' }} interval={0} />
                        <Tooltip
                          cursor={{ fill: 'transparent' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={24}>
                          {ChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top 3 Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 mb-2">3 Tipe Dominan</h3>
                  {result.topThree.map((code) => {
                    const info = RIASEC_INFO[code as 'R'];
                    return (
                      <div key={code} className="flex gap-4 p-4 rounded-xl border border-slate-100 hover:border-orange-200 hover:shadow-sm transition-all bg-white">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: info.color }}>
                          <info.icon size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">{info.label}</h4>
                          <p className="text-sm text-slate-500 leading-snug mt-1">{info.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Career Recommendations */}
              <div className="border-t border-slate-100 pt-8 print:pt-4">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Briefcase size={22} className="text-orange-500" />
                  Rekomendasi Karir
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {result.careers.map((career, idx) => (
                    <div key={idx} className="bg-orange-50/50 border border-orange-100 text-orange-800 px-4 py-3 rounded-xl text-center font-medium text-sm hover:bg-orange-100 transition-colors cursor-default">
                      {career}
                    </div>
                  ))}
                </div>
              </div>

              {/* Print Footer */}
              <div className="hidden print:block mt-8 text-center text-xs text-slate-400 border-t pt-4">
                Dicetak dari Aplikasi BK - {new Date().toLocaleDateString('id-ID')}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Question View
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {onBack && (
          <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-8 font-medium transition-colors">
            <ArrowLeft size={20} /> Kembali
          </button>
        )}

        {questionsLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full mx-auto mb-4"></div>
            <p className="text-slate-500">Menyiapkan pertanyaan...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            {/* Progress Bar */}
            <div className="bg-slate-100 h-2 w-full">
              <div
                className="bg-orange-500 h-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>

            <div className="p-8">
              <div className="flex justify-between items-center mb-6 text-sm font-medium text-slate-400">
                <span>Pertanyaan {currentQuestionIndex + 1} dari {totalQuestions}</span>
                <span>{Math.round(progressPercentage)}% Selesai</span>
              </div>

              <h2 className="text-2xl font-bold text-slate-800 mb-8 leading-relaxed min-h-[4rem]">
                {currentQuestion?.question}
              </h2>

              <div className="space-y-3">
                {currentQuestion?.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleOptionSelect(option.value)}
                    className={`w-full p-4 text-left border-2 rounded-xl transition-all font-semibold flex justify-between items-center
                                     ${answers[currentQuestion?.id || ''] === option.value
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-slate-100 text-slate-600 hover:border-orange-200 hover:bg-orange-50/30'
                      }
                                 `}
                  >
                    <span>{option.label}</span>
                    {answers[currentQuestion?.id || ''] === option.value && (
                      <CheckCircle size={20} className="text-orange-500" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex justify-between mt-10 pt-6 border-t border-slate-100">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all
                                ${currentQuestionIndex === 0
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'}
                            `}
                >
                  <ChevronLeft size={20} /> Sebelumnya
                </button>

                <button
                  onClick={handleNext}
                  disabled={loading || !answers[currentQuestion?.id || '']}
                  className={`px-8 py-2.5 rounded-lg font-bold shadow-lg transition-all
                    ${loading || !answers[currentQuestion?.id || '']
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                      : 'bg-orange-600 text-white shadow-orange-500/30 hover:bg-orange-700 hover:-translate-y-0.5'
                    }`}
                >
                  {loading ? 'Menyimpan...' : (currentQuestionIndex === totalQuestions - 1 ? 'Selesai' : 'Selanjutnya')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
