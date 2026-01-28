import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, BookOpen, Music, Activity, ChevronLeft } from 'lucide-react';
import { generateClasses, type SchoolMode } from '@/lib/classHelper';
import { submitAssessmentResult } from '@/lib/supabaseClient';
import { getAssessmentQuestions } from '@/lib/assessmentQuestionsDB';
import { Question as DBQuestion } from '@/lib/assessmentQuestions';

interface Question {
    id: string; // Changed to string to match DB
    type: 'V' | 'A' | 'K';
    question: string;
    options: {
        label: string;
        value: 'V' | 'A' | 'K';
    }[];
}

interface Result {
    visual: number;
    auditory: number;
    kinesthetic: number;
    dominant: string;
    percentage: number;
    description: string;
    tips: string[];
}

interface FormData {
    nama: string;
    kelas: string;
    jenisKelamin: string;
    [key: string]: string | number;
}

// Helper to map 3 options to V, A, K based on standard order
// We assume DB questions have options in order: Visual, Auditory, Kinesthetic
const mapDBQuestionToLocal = (q: DBQuestion): Question => {
    // If dimension is present, we might use it, but here we need per-option values.
    // The convention we migration is: Option 0 = V, Option 1 = A, Option 2 = K.
    // However, looking at the data, some questions have type='V', meaning ALL options are for 'V'? No.
    // The original data structure had a 'type' property on the question, but the OPTIONS had specific values.
    // Wait, let's re-examine valid migration.
    // Original Q1: Type 'V'. Options: V, A, K. 
    // Original Q11: Type 'A'. Options: V, A, K.
    // It seems the "Question Type" was metadata, but the answers were always mixed.
    // So we can assume the options array in DB corresponds to V, A, K values respectively?
    // Let's check a few examples from my migration.
    // Q1: 'Berbicara dengan cepat' (V), '...teratur' (A), '...lambat' (K). Order: V, A, K.
    // Q2: '...berantakan' (V), '...bising' (A), '...diam' (K). Order: V, A, K.
    // It seems CONSISTENTLY V, A, K.

    return {
        id: q.id, // Keep string ID
        type: (q.dimension as 'V' | 'A' | 'K') || 'V', // Fallback
        question: q.text,
        options: [
            { label: q.options[0] || 'Option 1', value: 'V' },
            { label: q.options[1] || 'Option 2', value: 'A' },
            { label: q.options[2] || 'Option 3', value: 'K' }
        ]
    };
};

const STYLE_INFO = {
    V: {
        label: 'Visual',
        icon: BookOpen,
        description: 'Kamu belajar paling baik dengan melihat. Kamu menyukai gambar, diagram, dan membaca.',
        tips: [
            'Gunakan spidol warna-warni untuk mencatat',
            'Buat peta konsep (mind map) untuk merangkum materi',
            'Tonton video pembelajaran',
            'Duduk di barisan depan agar bisa melihat guru dengan jelas'
        ]
    },
    A: {
        label: 'Auditorial',
        icon: Music,
        description: 'Kamu belajar paling baik dengan mendengarkan. Kamu suka diskusi dan penjelasan lisan.',
        tips: [
            'Rekam penjelasan guru dan dengarkan ulang',
            'Baca materi pelajaran dengan suara keras',
            'Belajar sambil berdiskusi dengan teman',
            'Gunakan lagu atau irama untuk menghafal'
        ]
    },
    K: {
        label: 'Kinestetik',
        icon: Activity,
        description: 'Kamu belajar paling baik dengan melakukan. Kamu suka praktik dan bergerak.',
        tips: [
            'Lakukan praktik atau eksperimen langsung',
            'Belajar sambil berjalan-jalan atau bergerak',
            'Gunakan objek nyata untuk memahami konsep',
            'Ambil istirahat singkat untuk meregangkan badan saat belajar'
        ]
    }
};

interface LearningStyleAssessmentFormProps {
    onBack?: () => void;
    schoolMode?: SchoolMode;
}

export default function LearningStyleAssessmentForm({ onBack, schoolMode = 'smp' }: LearningStyleAssessmentFormProps) {
    const [step, setStep] = useState<'info' | 'questions' | 'result'>('info');
    const [formData, setFormData] = useState<FormData>({ nama: '', kelas: '', jenisKelamin: '' });
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({}); // Changed key to string
    // Add separate state for the current selection before confirming moving next
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<Result | null>(null);

    // Dynamic Questions State
    const [questions, setQuestions] = useState<Question[]>([]);
    const [questionsLoading, setQuestionsLoading] = useState(true);

    React.useEffect(() => {
        const loadQuestions = async () => {
            const dbQuestions = await getAssessmentQuestions('gaya_belajar');
            const mappedQuestions = (dbQuestions as DBQuestion[]).map(mapDBQuestionToLocal);
            setQuestions(mappedQuestions);
            setQuestionsLoading(false);
        };
        loadQuestions();
    }, []);

    const classOptions = generateClasses(schoolMode);
    // Safe access
    const currentQuestion = questions.length > 0 ? questions[currentQuestionIndex] : null;
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
            alert('Pertanyaan belum dimuat. Mohon tunggu sebentar atau refresh halaman.');
            return;
        }
        setStep('questions');
    };

    const calculateResult = (finalAnswers: Record<string, string>): Result => {
        let vCount = 0;
        let aCount = 0;
        let kCount = 0;

        Object.values(finalAnswers).forEach(val => {
            if (val === 'V') vCount++;
            if (val === 'A') aCount++;
            if (val === 'K') kCount++;
        });

        const total = vCount + aCount + kCount;
        // Determine dominant style
        let dominant = 'V';
        let max = vCount;

        if (aCount > max) {
            max = aCount;
            dominant = 'A';
        }
        if (kCount > max) {
            max = kCount;
            dominant = 'K';
        }

        // Handle ties - if tie, perhaps show mixed/multimodal, but for simplicity we prioritize V > A > K or just pick one
        // For a more robust app we could show percentages of each.

        return {
            visual: vCount,
            auditory: aCount,
            kinesthetic: kCount,
            dominant,
            percentage: (max / total) * 100,
            description: STYLE_INFO[dominant as 'V' | 'A' | 'K'].description,
            tips: STYLE_INFO[dominant as 'V' | 'A' | 'K'].tips
        };
    };

    const handleOptionSelect = (value: 'V' | 'A' | 'K') => {
        if (!currentQuestion) return;
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleNext = async () => {
        if (!currentQuestion) return;
        // Validation: must answer before moving next
        if (!answers[currentQuestion.id]) {
            alert('Silakan pilih salah satu jawaban terlebih dahulu.');
            return;
        }

        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            // Finish / Submit
            await submitResults();
        }
    };

    const submitResults = async () => {
        setLoading(true);
        try {
            const calculatedResult = calculateResult(answers);

            const submitData = {
                nama: formData.nama,
                kelas: formData.kelas,
                jenisKelamin: formData.jenisKelamin,
                ...answers,
                summary_v: calculatedResult.visual,
                summary_a: calculatedResult.auditory,
                summary_k: calculatedResult.kinesthetic,
                dominant_style: calculatedResult.dominant
            };

            const questionsForSubmit = questions.map(q => ({ id: q.id }));

            await submitAssessmentResult('gaya_belajar', submitData, questionsForSubmit as any);

            setResult(calculatedResult);
            setStep('result');
        } catch (error) {
            console.error('Error saving results:', error);
            alert('Terjadi kesalahan saat menyimpan hasil.');
            // Show results anyway even if save fails, so user isn't blocked
            setResult(calculateResult(answers));
            setStep('result');
        } finally {
            setLoading(false);
        }
    };

    if (step === 'info') {
        return (
            <div className="px-6 md:px-8 py-8 max-w-2xl mx-auto">
                {onBack && (
                    <button onClick={onBack} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-medium">
                        <ChevronLeft size={20} /> Kembali
                    </button>
                )}

                <div className="card p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Asesmen Gaya Belajar</h1>
                    <p className="text-gray-600 mb-8">
                        Ketahui gaya belajar (Visual, Auditorial, Kinestetik) yang paling cocok untukmu.
                    </p>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Nama Lengkap</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Masukkan nama lengkap"
                                value={formData.nama}
                                onChange={(e) => handleInfoChange('nama', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Kelas</label>
                            <select
                                className="input-field"
                                value={formData.kelas}
                                onChange={(e) => handleInfoChange('kelas', e.target.value)}
                            >
                                <option value="">Pilih Kelas</option>
                                {classOptions.map((cls) => (
                                    <option key={cls.value} value={cls.value}>{cls.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Jenis Kelamin</label>
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

                        <button onClick={handleStartQuestions} className="btn-primary w-full py-3">
                            Mulai Asesmen
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'result' && result) {
        const DominantIcon = STYLE_INFO[result.dominant as 'V' | 'A' | 'K'].icon;

        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 print:py-0 print:bg-white">
                <div className="max-w-4xl mx-auto px-4 print:px-0 print:max-w-full">
                    {onBack && (
                        <button onClick={onBack} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-medium print:hidden">
                            <ChevronLeft size={20} /> Kembali ke Menu
                        </button>
                    )}

                    <div className="card p-8 text-center mb-8 bg-white shadow-xl border-t-8 border-blue-500 print:shadow-none print:border-none print:p-0">
                        {/* Header for Print */}
                        <div className="hidden print:block mb-4 text-left border-b pb-2">
                            <h1 className="text-xl font-bold uppercase">Asesmen Gaya Belajar</h1>
                            <div className="flex gap-4 text-sm mt-1">
                                <p>Nama: <strong>{formData.nama}</strong></p>
                                <p>Kelas: <strong>{formData.kelas}</strong></p>
                            </div>
                        </div>

                        <div className="flex justify-center mb-6 print:mb-2">
                            <div className="p-4 bg-blue-100 rounded-full text-blue-600 print:hidden">
                                <DominantIcon size={64} />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-2 print:text-lg">Gaya Belajar Dominan Kamu:</h2>
                        <h1 className="text-4xl font-extrabold text-blue-600 mb-4 print:text-3xl">{STYLE_INFO[result.dominant as 'V' | 'A' | 'K'].label}</h1>
                        <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-8 print:text-sm print:mb-4">{result.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 print:grid-cols-3 print:gap-2 print:mb-4">
                            <div className={`p-4 rounded-lg border-2 print:p-2 ${result.dominant === 'V' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                                <div className="font-bold text-gray-700 mb-1 print:text-sm">Visual</div>
                                <div className="text-2xl font-bold text-blue-600 print:text-xl">{result.visual}</div>
                                <div className="text-xs text-gray-500">Poin</div>
                            </div>
                            <div className={`p-4 rounded-lg border-2 print:p-2 ${result.dominant === 'A' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                                <div className="font-bold text-gray-700 mb-1 print:text-sm">Auditorial</div>
                                <div className="text-2xl font-bold text-blue-600 print:text-xl">{result.auditory}</div>
                                <div className="text-xs text-gray-500">Poin</div>
                            </div>
                            <div className={`p-4 rounded-lg border-2 print:p-2 ${result.dominant === 'K' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                                <div className="font-bold text-gray-700 mb-1 print:text-sm">Kinestetik</div>
                                <div className="text-2xl font-bold text-blue-600 print:text-xl">{result.kinesthetic}</div>
                                <div className="text-xs text-gray-500">Poin</div>
                            </div>
                        </div>

                        <div className="text-left bg-blue-50 p-6 rounded-xl print:bg-white print:border print:border-gray-300 print:p-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 print:text-base print:mb-2">
                                <BookOpen size={24} className="text-blue-600 print:hidden" />
                                Tips Belajar untuk {STYLE_INFO[result.dominant as 'V' | 'A' | 'K'].label}:
                            </h3>
                            <ul className="space-y-3 print:space-y-1 print:text-sm">
                                {result.tips.map((tip, idx) => (
                                    <li key={idx} className="flex items-start gap-3 print:gap-2">
                                        <CheckCircle size={20} className="text-green-500 mt-0.5 flex-shrink-0 print:w-4 print:h-4" />
                                        <span className="text-gray-700">{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="hidden print:block text-center text-xs text-gray-500 mt-8">
                            <p>© BK Dashboard - Dicetak pada {new Date().toLocaleDateString('id-ID')}</p>
                        </div>
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                {onBack && (
                    <button onClick={onBack} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-medium">
                        <ArrowLeft size={20} /> Kembali
                    </button>
                )}

                <div className="card p-8 shadow-xl">
                    {questionsLoading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Memuat pertanyaan...</p>
                        </div>
                    ) : currentQuestion && (
                        <>
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-semibold text-gray-700">Pertanyaan {currentQuestion.id} dari {totalQuestions}</span>
                                    <span className="text-sm font-semibold text-blue-600">{Math.round(progressPercentage)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-8">{currentQuestion.question}</h2>

                            <div className="space-y-4">
                                {currentQuestion.options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionSelect(option.value)}
                                        disabled={loading}
                                        className={`w-full p-4 text-left border-2 rounded-xl transition-all font-medium text-gray-700
                                  ${answers[currentQuestion.id] === option.value
                                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                            }
                                `}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{option.label}</span>
                                            {answers[currentQuestion.id] === option.value && (
                                                <CheckCircle className="text-blue-500" size={20} />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
                                <button
                                    onClick={handlePrevious}
                                    disabled={currentQuestionIndex === 0 || loading}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors
                                ${currentQuestionIndex === 0
                                            ? 'text-gray-300 cursor-not-allowed'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }
                            `}
                                >
                                    <ChevronLeft size={20} /> Sebelumnya
                                </button>

                                <button
                                    onClick={handleNext}
                                    disabled={loading || !answers[currentQuestion.id]}
                                    className={`flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {loading ? 'Menyimpan...' : (
                                        currentQuestionIndex === totalQuestions - 1 ? 'Selesai & Lihat Hasil' : 'Selanjutnya'
                                    )}
                                    {!loading && currentQuestionIndex < totalQuestions - 1 && <ChevronLeft size={20} className="rotate-180" />}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
