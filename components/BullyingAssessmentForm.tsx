import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, CheckCircle, ChevronLeft, Printer,
    Shield, AlertTriangle, Heart, Users, Eye,
    BarChart3
} from 'lucide-react';
import { generateClasses, type SchoolMode } from '@/lib/classHelper';
import { submitAssessmentResult } from '@/lib/supabaseClient';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { getSiswaByKelas } from '@/lib/siswaStorage';
import type { SiswaAbsensi } from '@/lib/absensiTypes';

// Tipe Data
interface Question {
    id: string;
    type: 'knowledge' | 'attitude' | 'empathy' | 'bystander' | 'experience';
    question: string;
    options: {
        label: string;
        value: number;
    }[];
}

interface Result {
    scores: {
        knowledge: number;
        attitude: number;
        empathy: number;
        bystander: number;
        experience: number;
    };
    totalScore: number;
    level: 'Tinggi' | 'Sedang' | 'Rendah';
    description: string;
    recommendations: string[];
}

interface FormData {
    nama: string;
    kelas: string;
    jenisKelamin: string;
    nis: string;
    [key: string]: string | number;
}

// Mapping Dimensi Bullying
const BULLYING_INFO = {
    knowledge: {
        label: 'Pengetahuan Bullying',
        icon: Shield,
        color: '#3b82f6',
        description: 'Pemahaman tentang apa itu bullying, jenis-jenisnya, dan dampaknya'
    },
    attitude: {
        label: 'Sikap Terhadap Bullying',
        icon: AlertTriangle,
        color: '#f59e0b',
        description: 'Pandangan dan sikap pribadi terhadap perilaku bullying'
    },
    empathy: {
        label: 'Empati',
        icon: Heart,
        color: '#ec4899',
        description: 'Kemampuan memahami dan merasakan perasaan korban bullying'
    },
    bystander: {
        label: 'Perilaku Bystander',
        icon: Users,
        color: '#8b5cf6',
        description: 'Tindakan yang diambil saat menyaksikan bullying'
    },
    experience: {
        label: 'Pengalaman Pribadi',
        icon: Eye,
        color: '#10b981',
        description: 'Pengalaman langsung atau tidak langsung dengan bullying'
    }
};

// HARDCODED QUESTIONS - Edit pertanyaan di sini
const BULLYING_QUESTIONS: Question[] = [
    // Pengetahuan Bullying (Knowledge) - 6 questions
    { id: 'q1', type: 'knowledge', question: 'Bullying adalah tindakan yang dilakukan berulang kali untuk menyakiti orang lain', options: [{ label: 'Sangat Tidak Setuju', value: 1 }, { label: 'Tidak Setuju', value: 2 }, { label: 'Netral', value: 3 }, { label: 'Setuju', value: 4 }, { label: 'Sangat Setuju', value: 5 }] },
    { id: 'q2', type: 'knowledge', question: 'Mengejek teman sekali saja tidak termasuk bullying', options: [{ label: 'Sangat Tidak Setuju', value: 1 }, { label: 'Tidak Setuju', value: 2 }, { label: 'Netral', value: 3 }, { label: 'Setuju', value: 4 }, { label: 'Sangat Setuju', value: 5 }] },
    { id: 'q3', type: 'knowledge', question: 'Bullying bisa terjadi secara fisik, verbal, maupun melalui media sosial', options: [{ label: 'Sangat Tidak Setuju', value: 1 }, { label: 'Tidak Setuju', value: 2 }, { label: 'Netral', value: 3 }, { label: 'Setuju', value: 4 }, { label: 'Sangat Setuju', value: 5 }] },
    { id: 'q4', type: 'knowledge', question: 'Mengucilkan teman dari kelompok termasuk bentuk bullying', options: [{ label: 'Sangat Tidak Setuju', value: 1 }, { label: 'Tidak Setuju', value: 2 }, { label: 'Netral', value: 3 }, { label: 'Setuju', value: 4 }, { label: 'Sangat Setuju', value: 5 }] },
    { id: 'q5', type: 'knowledge', question: 'Bullying hanya masalah kecil yang tidak perlu ditanggapi serius', options: [{ label: 'Sangat Tidak Setuju', value: 1 }, { label: 'Tidak Setuju', value: 2 }, { label: 'Netral', value: 3 }, { label: 'Setuju', value: 4 }, { label: 'Sangat Setuju', value: 5 }] },
    { id: 'q6', type: 'knowledge', question: 'Korban bullying bisa mengalami dampak psikologis jangka panjang', options: [{ label: 'Sangat Tidak Setuju', value: 1 }, { label: 'Tidak Setuju', value: 2 }, { label: 'Netral', value: 3 }, { label: 'Setuju', value: 4 }, { label: 'Sangat Setuju', value: 5 }] },

    // Sikap Terhadap Bullying (Attitude) - 6 questions
    { id: 'q7', type: 'attitude', question: 'Tidak apa-apa mengejek teman jika hanya bercanda', options: [{ label: 'Sangat Tidak Setuju', value: 1 }, { label: 'Tidak Setuju', value: 2 }, { label: 'Netral', value: 3 }, { label: 'Setuju', value: 4 }, { label: 'Sangat Setuju', value: 5 }] },
    { id: 'q8', type: 'attitude', question: 'Korban bullying seharusnya bisa membela diri sendiri', options: [{ label: 'Sangat Tidak Setuju', value: 1 }, { label: 'Tidak Setuju', value: 2 }, { label: 'Netral', value: 3 }, { label: 'Setuju', value: 4 }, { label: 'Sangat Setuju', value: 5 }] },
    { id: 'q9', type: 'attitude', question: 'Saya akan melaporkan jika melihat teman di-bully', options: [{ label: 'Sangat Tidak Setuju', value: 1 }, { label: 'Tidak Setuju', value: 2 }, { label: 'Netral', value: 3 }, { label: 'Setuju', value: 4 }, { label: 'Sangat Setuju', value: 5 }] },
    { id: 'q10', type: 'attitude', question: 'Bullying adalah cara untuk menunjukkan kekuatan', options: [{ label: 'Sangat Tidak Setuju', value: 1 }, { label: 'Tidak Setuju', value: 2 }, { label: 'Netral', value: 3 }, { label: 'Setuju', value: 4 }, { label: 'Sangat Setuju', value: 5 }] },
    { id: 'q11', type: 'attitude', question: 'Setiap orang berhak diperlakukan dengan hormat', options: [{ label: 'Sangat Tidak Setuju', value: 1 }, { label: 'Tidak Setuju', value: 2 }, { label: 'Netral', value: 3 }, { label: 'Setuju', value: 4 }, { label: 'Sangat Setuju', value: 5 }] },
    { id: 'q12', type: 'attitude', question: 'Saya tidak akan ikut-ikutan mem-bully teman meskipun teman lain melakukannya', options: [{ label: 'Sangat Tidak Setuju', value: 1 }, { label: 'Tidak Setuju', value: 2 }, { label: 'Netral', value: 3 }, { label: 'Setuju', value: 4 }, { label: 'Sangat Setuju', value: 5 }] },

    // Empati (Empathy) - 6 questions
    { id: 'q13', type: 'empathy', question: 'Saya merasa sedih ketika melihat teman di-bully', options: [{ label: 'Sangat Tidak Setuju', value: 1 }, { label: 'Tidak Setuju', value: 2 }, { label: 'Netral', value: 3 }, { label: 'Setuju', value: 4 }, { label: 'Sangat Setuju', value: 5 }] },
    { id: 'q14', type: 'empathy', question: 'Saya bisa merasakan bagaimana perasaan korban bullying', options: [{ label: 'Sangat Tidak Setuju', value: 1 }, { label: 'Tidak Setuju', value: 2 }, { label: 'Netral', value: 3 }, { label: 'Setuju', value: 4 }, { label: 'Sangat Setuju', value: 5 }] },
    { id: 'q15', type: 'empathy', question: 'Korban bullying mungkin merasa takut datang ke sekolah', options: [{ label: 'Sangat Tidak Setuju', value: 1 }, { label: 'Tidak Setuju', value: 2 }, { label: 'Netral', value: 3 }, { label: 'Setuju', value: 4 }, { label: 'Sangat Setuju', value: 5 }] },
    { id: 'q16', type: 'empathy', question: 'Saya peduli dengan perasaan teman-teman saya', options: [{ label: 'Sangat Tidak Setuju', value: 1 }, { label: 'Tidak Setuju', value: 2 }, { label: 'Netral', value: 3 }, { label: 'Setuju', value: 4 }, { label: 'Sangat Setuju', value: 5 }] },
    { id: 'q17', type: 'empathy', question: 'Bullying dapat merusak kepercayaan diri seseorang', options: [{ label: 'Sangat Tidak Setuju', value: 1 }, { label: 'Tidak Setuju', value: 2 }, { label: 'Netral', value: 3 }, { label: 'Setuju', value: 4 }, { label: 'Sangat Setuju', value: 5 }] },
    { id: 'q18', type: 'empathy', question: 'Saya akan menghibur teman yang menjadi korban bullying', options: [{ label: 'Sangat Tidak Setuju', value: 1 }, { label: 'Tidak Setuju', value: 2 }, { label: 'Netral', value: 3 }, { label: 'Setuju', value: 4 }, { label: 'Sangat Setuju', value: 5 }] },

    // Perilaku Bystander (Bystander Behavior) - 6 questions
    { id: 'q19', type: 'bystander', question: 'Saya akan membela teman yang di-bully meskipun saya bisa menjadi target berikutnya', options: [{ label: 'Sangat Tidak Setuju', value: 1 }, { label: 'Tidak Setuju', value: 2 }, { label: 'Netral', value: 3 }, { label: 'Setuju', value: 4 }, { label: 'Sangat Setuju', value: 5 }] },
    { id: 'q20', type: 'bystander', question: 'Lebih baik diam saja daripada ikut campur urusan orang lain', options: [{ label: 'Sangat Tidak Setuju', value: 1 }, { label: 'Tidak Setuju', value: 2 }, { label: 'Netral', value: 3 }, { label: 'Setuju', value: 4 }, { label: 'Sangat Setuju', value: 5 }] },
    { id: 'q21', type: 'bystander', question: 'Saya akan melapor ke guru jika melihat bullying', options: [{ label: 'Sangat Tidak Setuju', value: 1 }, { label: 'Tidak Setuju', value: 2 }, { label: 'Netral', value: 3 }, { label: 'Setuju', value: 4 }, { label: 'Sangat Setuju', value: 5 }] },
    { id: 'q22', type: 'bystander', question: 'Saya akan mengajak teman lain untuk bersama-sama menghentikan bullying', options: [{ label: 'Sangat Tidak Setuju', value: 1 }, { label: 'Tidak Setuju', value: 2 }, { label: 'Netral', value: 3 }, { label: 'Setuju', value: 4 }, { label: 'Sangat Setuju', value: 5 }] },
    { id: 'q23', type: 'bystander', question: 'Melihat bullying tanpa melakukan apa-apa sama saja dengan mendukungnya', options: [{ label: 'Sangat Tidak Setuju', value: 1 }, { label: 'Tidak Setuju', value: 2 }, { label: 'Netral', value: 3 }, { label: 'Setuju', value: 4 }, { label: 'Sangat Setuju', value: 5 }] },
    { id: 'q24', type: 'bystander', question: 'Saya akan mendukung korban bullying dengan cara yang aman', options: [{ label: 'Sangat Tidak Setuju', value: 1 }, { label: 'Tidak Setuju', value: 2 }, { label: 'Netral', value: 3 }, { label: 'Setuju', value: 4 }, { label: 'Sangat Setuju', value: 5 }] },

    // Pengalaman Pribadi (Personal Experience) - 6 questions
    { id: 'q25', type: 'experience', question: 'Saya pernah menjadi korban bullying', options: [{ label: 'Sangat Tidak Setuju', value: 1 }, { label: 'Tidak Setuju', value: 2 }, { label: 'Netral', value: 3 }, { label: 'Setuju', value: 4 }, { label: 'Sangat Setuju', value: 5 }] },
    { id: 'q26', type: 'experience', question: 'Saya pernah melihat teman di-bully', options: [{ label: 'Sangat Tidak Setuju', value: 1 }, { label: 'Tidak Setuju', value: 2 }, { label: 'Netral', value: 3 }, { label: 'Setuju', value: 4 }, { label: 'Sangat Setuju', value: 5 }] },
    { id: 'q27', type: 'experience', question: 'Saya pernah tidak sengaja ikut mem-bully teman', options: [{ label: 'Sangat Tidak Setuju', value: 1 }, { label: 'Tidak Setuju', value: 2 }, { label: 'Netral', value: 3 }, { label: 'Setuju', value: 4 }, { label: 'Sangat Setuju', value: 5 }] },
    { id: 'q28', type: 'experience', question: 'Saya merasa aman dari bullying di sekolah', options: [{ label: 'Sangat Tidak Setuju', value: 1 }, { label: 'Tidak Setuju', value: 2 }, { label: 'Netral', value: 3 }, { label: 'Setuju', value: 4 }, { label: 'Sangat Setuju', value: 5 }] },
    { id: 'q29', type: 'experience', question: 'Guru di sekolah saya peduli terhadap masalah bullying', options: [{ label: 'Sangat Tidak Setuju', value: 1 }, { label: 'Tidak Setuju', value: 2 }, { label: 'Netral', value: 3 }, { label: 'Setuju', value: 4 }, { label: 'Sangat Setuju', value: 5 }] },
    { id: 'q30', type: 'experience', question: 'Saya tahu harus melapor ke siapa jika mengalami atau melihat bullying', options: [{ label: 'Sangat Tidak Setuju', value: 1 }, { label: 'Tidak Setuju', value: 2 }, { label: 'Netral', value: 3 }, { label: 'Setuju', value: 4 }, { label: 'Sangat Setuju', value: 5 }] },
];

interface BullyingAssessmentFormProps {
    onBack?: () => void;
    schoolMode?: SchoolMode;
}

export default function BullyingAssessmentForm({ onBack, schoolMode = 'smp' }: BullyingAssessmentFormProps) {
    const [step, setStep] = useState<'info' | 'questions' | 'result'>('info');
    const [formData, setFormData] = useState<FormData>({ nama: '', kelas: '', jenisKelamin: '', nis: '' });
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<Result | null>(null);

    // Student Data Integration State
    const [students, setStudents] = useState<SiswaAbsensi[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    // Use hardcoded questions
    const questions = BULLYING_QUESTIONS;

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
        setStep('questions');
    };

    const handleOptionSelect = (value: number) => {
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

    // Questions that need reverse scoring (negative statements)
    const reverseScoreQuestions = [
        'Mengejek teman sekali saja tidak termasuk bullying',
        'Bullying hanya masalah kecil yang tidak perlu ditanggapi serius',
        'Tidak apa-apa mengejek teman jika hanya bercanda',
        'Korban bullying seharusnya bisa membela diri sendiri',
        'Bullying adalah cara untuk menunjukkan kekuatan',
        'Lebih baik diam saja daripada ikut campur urusan orang lain',
        'Saya pernah tidak sengaja ikut mem-bully teman'
    ];

    const calculateResult = (finalAnswers: Record<string, number>): Result => {
        const scores = { knowledge: 0, attitude: 0, empathy: 0, bystander: 0, experience: 0 };

        questions.forEach(q => {
            let val = finalAnswers[q.id] || 0;

            // Reverse scoring for negative statements
            if (reverseScoreQuestions.includes(q.question)) {
                val = 6 - val; // Reverse: 1->5, 2->4, 3->3, 4->2, 5->1
            }

            if (q.type && scores.hasOwnProperty(q.type)) {
                scores[q.type] += val;
            }
        });

        const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

        let level: 'Tinggi' | 'Sedang' | 'Rendah';
        let description: string;
        let recommendations: string[];

        if (totalScore >= 120) {
            level = 'Tinggi';
            description = 'Anda memiliki pemahaman yang baik tentang bullying dan sikap yang positif. Anda menunjukkan empati tinggi terhadap korban dan siap mengambil tindakan untuk mencegah bullying.';
            recommendations = [
                'Terus pertahankan sikap positif Anda',
                'Jadilah role model bagi teman-teman',
                'Aktif dalam program anti-bullying di sekolah',
                'Bantu teman yang membutuhkan dukungan'
            ];
        } else if (totalScore >= 90) {
            level = 'Sedang';
            description = 'Anda memiliki pemahaman yang cukup tentang bullying, namun masih ada ruang untuk peningkatan dalam sikap dan tindakan Anda.';
            recommendations = [
                'Tingkatkan pemahaman tentang dampak bullying',
                'Latih empati dengan mencoba memahami perasaan orang lain',
                'Jangan ragu untuk melaporkan jika melihat bullying',
                'Ikuti program atau seminar tentang anti-bullying'
            ];
        } else {
            level = 'Rendah';
            description = 'Pemahaman Anda tentang bullying masih terbatas. Penting untuk meningkatkan kesadaran dan mengubah sikap terhadap bullying.';
            recommendations = [
                'Konsultasi dengan guru BK untuk pemahaman lebih lanjut',
                'Pelajari tentang jenis-jenis bullying dan dampaknya',
                'Refleksikan perilaku Anda terhadap teman-teman',
                'Ikuti program intervensi anti-bullying di sekolah',
                'Kembangkan empati dan kepedulian terhadap orang lain'
            ];
        }

        return {
            scores,
            totalScore,
            level,
            description,
            recommendations
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
                score_knowledge: calculatedResult.scores.knowledge,
                score_attitude: calculatedResult.scores.attitude,
                score_empathy: calculatedResult.scores.empathy,
                score_bystander: calculatedResult.scores.bystander,
                score_experience: calculatedResult.scores.experience,
                total_score: calculatedResult.totalScore,
                level: calculatedResult.level
            };

            const questionsForSubmit = questions.map(q => ({ id: q.id }));

            await submitAssessmentResult('bullying', submitData, questionsForSubmit as any);

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
        { name: 'Pengetahuan', score: result.scores.knowledge, fill: BULLYING_INFO.knowledge.color },
        { name: 'Sikap', score: result.scores.attitude, fill: BULLYING_INFO.attitude.color },
        { name: 'Empati', score: result.scores.empathy, fill: BULLYING_INFO.empathy.color },
        { name: 'Bystander', score: result.scores.bystander, fill: BULLYING_INFO.bystander.color },
        { name: 'Pengalaman', score: result.scores.experience, fill: BULLYING_INFO.experience.color },
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
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                            <Shield className="text-white" size={32} />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">Asesmen Pemahaman & Sikap Terhadap Bullying</h1>
                        <p className="text-slate-500 max-w-md mx-auto">
                            Asesmen ini mengukur pemahaman, sikap, dan perilaku Anda terkait bullying di lingkungan sekolah.
                        </p>
                    </div>

                    <div className="space-y-5">
                        {/* Kelas Selection First */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Kelas</label>
                            <select
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none bg-white"
                                value={formData.kelas}
                                onChange={(e) => handleInfoChange('kelas', e.target.value)}
                            >
                                <option value="">Pilih Kelas</option>
                                {classOptions.map((cls) => (
                                    <option key={cls.value} value={cls.value}>{cls.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Student Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Siswa</label>
                            <select
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none bg-white disabled:bg-slate-50 disabled:text-slate-400"
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

                        {/* Read-only Fields */}
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
                            className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all mt-4"
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
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-white text-center print:bg-none print:text-black print:border-b print:p-4">
                            <h1 className="text-3xl font-bold mb-2">Hasil Asesmen Bullying</h1>
                            <div className="flex justify-center gap-6 text-blue-100 font-medium print:text-slate-600 print:text-sm">
                                <span>Nama: {formData.nama}</span>
                                <span>•</span>
                                <span>Kelas: {formData.kelas}</span>
                            </div>
                        </div>

                        <div className="p-8 print:p-4">
                            {/* Top Result Section */}
                            <div className="text-center mb-12 print:mb-6">
                                <p className="text-slate-500 mb-4 font-medium uppercase tracking-wider text-sm">Tingkat Pemahaman</p>
                                <div className={`inline-block px-8 py-4 rounded-2xl mb-6 ${result.level === 'Tinggi' ? 'bg-green-100 text-green-700' :
                                    result.level === 'Sedang' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                    <span className="text-5xl font-black">{result.level}</span>
                                </div>
                                <p className="text-lg text-slate-600 mb-2">Total Skor: <span className="font-bold text-2xl text-slate-800">{result.totalScore}</span> / 150</p>
                                <p className="text-slate-600 max-w-3xl mx-auto leading-relaxed text-lg">
                                    {result.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12 print:grid-cols-1 print:gap-6">
                                {/* Chart Section */}
                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 print:bg-white print:border-slate-200">
                                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                        <BarChart3 size={20} className="text-blue-500" />
                                        Profil Skor per Dimensi
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

                                {/* Dimension Details */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-slate-800 mb-2">Detail Dimensi</h3>
                                    {Object.entries(result.scores).map(([key, score]) => {
                                        const info = BULLYING_INFO[key as keyof typeof BULLYING_INFO];
                                        return (
                                            <div key={key} className="flex gap-4 p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all bg-white">
                                                <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: info.color }}>
                                                    <info.icon size={24} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <h4 className="font-bold text-slate-800">{info.label}</h4>
                                                        <span className="text-lg font-bold text-slate-700">{score}/30</span>
                                                    </div>
                                                    <p className="text-sm text-slate-500 leading-snug">{info.description}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Recommendations */}
                            <div className="border-t border-slate-100 pt-8 print:pt-4">
                                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <AlertTriangle size={22} className="text-blue-500" />
                                    Rekomendasi
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {result.recommendations.map((rec, idx) => (
                                        <div key={idx} className="flex gap-3 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                                            <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                                {idx + 1}
                                            </div>
                                            <p className="text-slate-700 font-medium">{rec}</p>
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

                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                    {/* Progress Bar */}
                    <div className="bg-slate-100 h-2 w-full">
                        <div
                            className="bg-blue-500 h-full transition-all duration-500 ease-out"
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
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-slate-100 text-slate-600 hover:border-blue-200 hover:bg-blue-50/30'
                                        }
                                 `}
                                >
                                    <span>{option.label}</span>
                                    {answers[currentQuestion?.id || ''] === option.value && (
                                        <CheckCircle size={20} className="text-blue-500" />
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
                                        : 'bg-blue-600 text-white shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-0.5'
                                    }`}
                            >
                                {loading ? 'Menyimpan...' : (currentQuestionIndex === totalQuestions - 1 ? 'Selesai' : 'Selanjutnya')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
