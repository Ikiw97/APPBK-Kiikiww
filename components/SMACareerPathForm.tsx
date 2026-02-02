import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, CheckCircle, ChevronLeft, Printer,
    BookOpen, Globe, Briefcase, Heart, Plane, Sprout, Palette,
    Cpu, Wrench, TrendingUp,
    BarChart3
} from 'lucide-react';
import { generateClasses, type SchoolMode } from '@/lib/classHelper';
import { submitAssessmentResult } from '@/lib/supabaseClient';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts';
import { getSiswaByKelas } from '@/lib/siswaStorage';
import type { SiswaAbsensi } from '@/lib/absensiTypes';

// Tipe Data
interface Question {
    id: string;
    category: string; // sma_ipa, sma_ips, sma_bahasa, smk_teknologi, dll
    question: string;
    options: {
        label: string;
        value: number;
    }[];
}

interface PathScores {
    sma_ipa: number;
    sma_ips: number;
    sma_bahasa: number;
    smk_teknologi: number;
    smk_tik: number;
    smk_bisnis: number;
    smk_kesehatan: number;
    smk_pariwisata: number;
    smk_agribisnis: number;
    smk_seni: number;
}

interface Result {
    scores: PathScores;
    topThree: { path: string; score: number; percentage: number }[];
    recommended: string;
}

interface FormData {
    nama: string;
    kelas: string;
    jenisKelamin: string;
    nis: string;
}

// Informasi setiap jurusan
const PATH_INFO: Record<string, {
    label: string;
    fullName: string;
    type: 'SMA' | 'SMK';
    icon: any;
    color: string;
    description: string;
    subjects: string[];
    careers: string[];
}> = {
    sma_ipa: {
        label: 'IPA',
        fullName: 'SMA - IPA (Ilmu Pengetahuan Alam)',
        type: 'SMA',
        icon: BookOpen,
        color: '#3b82f6', // blue
        description: 'Jurusan yang mempelajari ilmu pengetahuan alam seperti Matematika, Fisika, Kimia, dan Biologi. Cocok untuk yang suka sains dan berhitung.',
        subjects: ['Matematika', 'Fisika', 'Kimia', 'Biologi'],
        careers: ['Dokter', 'Insinyur', 'Apoteker', 'Peneliti', 'Ahli Teknologi']
    },
    sma_ips: {
        label: 'IPS',
        fullName: 'SMA - IPS (Ilmu Pengetahuan Sosial)',
        type: 'SMA',
        icon: Globe,
        color: '#10b981', // emerald
        description: 'Jurusan yang mempelajari ilmu sosial seperti Ekonomi, Geografi, Sejarah, dan Sosiologi. Cocok untuk yang tertarik dengan isu sosial dan ekonomi.',
        subjects: ['Ekonomi', 'Geografi', 'Sejarah', 'Sosiologi'],
        careers: ['Pengacara', 'Ekonom', 'Akuntan', 'Diplomat', 'Jurnalis']
    },
    sma_bahasa: {
        label: 'Bahasa',
        fullName: 'SMA - Bahasa dan Budaya',
        type: 'SMA',
        icon: BookOpen,
        color: '#ec4899', // pink
        description: 'Jurusan yang fokus pada bahasa (Indonesia, Inggris, asing) dan sastra. Cocok untuk yang suka membaca, menulis, dan mempelajari budaya.',
        subjects: ['Bahasa Indonesia', 'Bahasa Inggris', 'Sastra', 'Bahasa Asing'],
        careers: ['Penulis', 'Penerjemah', 'Guru Bahasa', 'Jurnalis', 'Diplomat']
    },
    smk_teknologi: {
        label: 'Teknologi & Rekayasa',
        fullName: 'SMK - Teknologi & Rekayasa',
        type: 'SMK',
        icon: Wrench,
        color: '#ef4444', // red
        description: 'Program keahlian yang mempelajari teknik mesin, listrik, otomotif, dan elektronika. Cocok untuk yang suka praktik dan bekerja dengan alat.',
        subjects: ['Teknik Mesin', 'Teknik Listrik', 'Otomotif', 'Elektronika'],
        careers: ['Teknisi', 'Mekanik', 'Operator Mesin', 'QC Industri', 'Ahli Listrik']
    },
    smk_tik: {
        label: 'TIK',
        fullName: 'SMK - Teknologi Informasi & Komunikasi',
        type: 'SMK',
        icon: Cpu,
        color: '#8b5cf6', // violet
        description: 'Program keahlian yang mempelajari pemrograman, jaringan komputer, dan multimedia. Cocok untuk yang suka teknologi digital.',
        subjects: ['Pemrograman', 'Jaringan Komputer', 'Desain Grafis', 'Multimedia'],
        careers: ['Programmer', 'Web Developer', 'IT Support', 'Desainer Grafis', 'Admin Network']
    },
    smk_bisnis: {
        label: 'Bisnis & Manajemen',
        fullName: 'SMK - Bisnis dan Manajemen',
        type: 'SMK',
        icon: TrendingUp,
        color: '#f59e0b', // amber
        description: 'Program keahlian yang mempelajari akuntansi, administrasi, pemasaran, dan manajemen. Cocok untuk yang suka berbisnis dan berorganisasi.',
        subjects: ['Akuntansi', 'Administrasi', 'Pemasaran', 'Manajemen'],
        careers: ['Akuntan', 'Admin', 'Marketing', 'Sales', 'HRD']
    },
    smk_kesehatan: {
        label: 'Kesehatan',
        fullName: 'SMK - Kesehatan dan Pekerjaan Sosial',
        type: 'SMK',
        icon: Heart,
        color: '#06b6d4', // cyan
        description: 'Program keahlian yang mempelajari keperawatan, farmasi, dan kesehatan masyarakat. Cocok untuk yang peduli kesehatan dan suka menolong.',
        subjects: ['Keperawatan', 'Farmasi', 'Kesehatan Masyarakat', 'Anatomi'],
        careers: ['Perawat', 'Asisten Apoteker', 'Lab Kesehatan', 'Terapis', 'Bidan']
    },
    smk_pariwisata: {
        label: 'Pariwisata',
        fullName: 'SMK - Pariwisata',
        type: 'SMK',
        icon: Plane,
        color: '#14b8a6', // teal
        description: 'Program keahlian yang mempelajari perhotelan, kuliner, dan layanan wisata. Cocok untuk yang suka bertemu orang dan layanan.',
        subjects: ['Perhotelan', 'Tata Boga', 'Tour Guide', 'Customer Service'],
        careers: ['Staff Hotel', 'Chef', 'Tour Guide', 'Flight Attendant', 'Event  Organizer']
    },
    smk_agribisnis: {
        label: 'Agrobisnis',
        fullName: 'SMK - Agrobisnis & Agroteknologi',
        type: 'SMK',
        icon: Sprout,
        color: '#84cc16', // lime
        description: 'Program keahlian yang mempelajari pertanian modern, peternakan, dan agrobisnis. Cocok untuk yang suka alam dan bercocok tanam.',
        subjects: ['Pertanian', 'Peternakan', 'Agrobisnis', 'Teknologi Pertanian'],
        careers: ['Petani Modern', 'Peternak', 'Pengusaha Agrobisnis', 'Ahli Pertanian']
    },
    smk_seni: {
        label: 'Seni & Kreatif',
        fullName: 'SMK - Seni dan Industri Kreatif',
        type: 'SMK',
        icon: Palette,
        color: '#f97316', // orange
        description: 'Program keahlian yang mempelajari seni rupa, desain, musik, dan broadcasting. Cocok untuk yang kreatif dan suka berkarya.',
        subjects: ['Desain', 'Seni Rupa', 'Musik', 'Broadcasting', 'Animasi'],
        careers: ['Desainer', 'Seniman', 'Animator', 'Content Creator', 'Fotografer']
    }
};

interface SMACareerPathFormProps {
    onBack?: () => void;
    schoolMode?: SchoolMode;
}

export default function SMACareerPathForm({ onBack, schoolMode = 'smp' }: SMACareerPathFormProps) {
    const [step, setStep] = useState<'info' | 'questions' | 'result'>('info');
    const [formData, setFormData] = useState<FormData>({ nama: '', kelas: '', jenisKelamin: '', nis: '' });
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<Result | null>(null);

    // Student Data
    const [students, setStudents] = useState<SiswaAbsensi[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    // Dynamic Questions State
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loadingQuestions, setLoadingQuestions] = useState(true);

    // Fetch Questions from DB
    useEffect(() => {
        const fetchQuestions = async () => {
             // Import dynamically to avoid server-side issues if any, though likely fine as top-level import
            const { getAssessmentQuestions } = await import('@/lib/assessmentQuestionsDB');
            
            try {
                const dbQuestions = await getAssessmentQuestions('sma_smk');
                
                if (dbQuestions && Array.isArray(dbQuestions) && dbQuestions.length > 0) {
                    const mappedQuestions: Question[] = dbQuestions.map((q: any) => {
                         // Determine options values
                         // Default expectation: ['Sangat Setuju', 'Setuju', 'Netral', 'Tidak Setuju', 'Sangat Tidak Setuju']
                         // We need to map these to values 5, 4, 3, 2, 1 OR 1, 2, 3, 4, 5
                         // In the hardcoded version: 'Sangat Tidak Setuju' = 1, 'Sangat Setuju' = 5.
                         
                         let options = [];
                         if (q.options && Array.isArray(q.options)) {
                             // Check orientation
                             const isDescending = q.options[0]?.toLowerCase().includes('sangat setuju');
                             
                             options = q.options.map((opt: string, idx: number) => ({
                                 label: opt,
                                 value: isDescending ? (5 - idx) : (idx + 1)
                             }));
                             
                             // Sort options by value ascending (1 to 5) to match UI expectation
                             options.sort((a: any, b: any) => a.value - b.value);
                         } else {
                             // Fallback options
                             options = [
                                 { label: 'Sangat Tidak Setuju', value: 1 },
                                 { label: 'Tidak Setuju', value: 2 },
                                 { label: 'Netral', value: 3 },
                                 { label: 'Setuju', value: 4 },
                                 { label: 'Sangat Setuju', value: 5 }
                             ];
                         }

                         return {
                             id: q.id,
                             category: q.jurusan || 'unknown', // Map 'jurusan' from DB to 'category' here
                             question: Array.isArray(q.text) ? q.text.join(' ') : q.text,
                             options: options
                         };
                    });

                    // Filter out questions without valid jurusan/category
                    const validQuestions = mappedQuestions.filter(q => q.category && q.category !== 'unknown');
                    setQuestions(validQuestions);
                }
            } catch (error) {
                console.error('Error fetching questions:', error);
            } finally {
                setLoadingQuestions(false);
            }
        };

        fetchQuestions();
    }, []);

    // Load Students
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
    const currentQuestion = questions[currentQuestionIndex];
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
        if (questions.length === 0) {
            alert('Pertanyaan belum dimuat. Mohon hubungi admin.');
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

    const calculateResult = (finalAnswers: Record<string, number>): Result => {
        const scores: PathScores = {
            sma_ipa: 0,
            sma_ips: 0,
            sma_bahasa: 0,
            smk_teknologi: 0,
            smk_tik: 0,
            smk_bisnis: 0,
            smk_kesehatan: 0,
            smk_pariwisata: 0,
            smk_agribisnis: 0,
            smk_seni: 0
        };

        // Hitung skor per jurusan
        questions.forEach(q => {
            const val = finalAnswers[q.id] || 0;
            if (scores.hasOwnProperty(q.category)) {
                scores[q.category as keyof PathScores] += val;
            }
        });

        // Convert to percentage (each path has 5 questions, max score = 5 * 5 = 25)
        const pathsWithPercentage = Object.entries(scores).map(([path, score]) => ({
            path,
            score,
            percentage: Math.round((score / 25) * 100)
        }));

        // Sort by score descending
        pathsWithPercentage.sort((a, b) => b.score - a.score);

        const topThree = pathsWithPercentage.slice(0, 3);
        const recommended = topThree[0].path;

        return {
            scores,
            topThree,
            recommended
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
                sma_ipa_score: calculatedResult.scores.sma_ipa,
                sma_ips_score: calculatedResult.scores.sma_ips,
                sma_bahasa_score: calculatedResult.scores.sma_bahasa,
                smk_teknologi_score: calculatedResult.scores.smk_teknologi,
                smk_tik_score: calculatedResult.scores.smk_tik,
                smk_bisnis_score: calculatedResult.scores.smk_bisnis,
                smk_kesehatan_score: calculatedResult.scores.smk_kesehatan,
                smk_pariwisata_score: calculatedResult.scores.smk_pariwisata,
                smk_agribisnis_score: calculatedResult.scores.smk_agribisnis,
                smk_seni_score: calculatedResult.scores.smk_seni,
                recommended_path: calculatedResult.recommended
            };

            const questionsForSubmit = questions.map(q => ({ id: q.id }));
            await submitAssessmentResult('sma_smk_career', submitData, questionsForSubmit as any);

            setResult(calculatedResult);
            setStep('result');
        } catch (error: any) {
            console.error('Error saving results:', error);
            alert(`Terjadi kesalahan saat menyimpan hasil: ${error.message || 'Unknown error'}. Namun hasil tetap akan ditampilkan.`);
            setResult(calculateResult(answers));
            setStep('result');
        } finally {
            setLoading(false);
        }
    };

    // Render Info Step
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
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
                            <BookOpen className="text-white" size={32} />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">Angket Penjurusan SMA/SMK</h1>
                        <p className="text-slate-500 max-w-md mx-auto">
                            Temukan jurusan yang paling sesuai dengan minat dan bakatmu melalui 50 pertanyaan diagnostik.
                        </p>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Kelas</label>
                            <select
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none bg-white"
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
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Siswa</label>
                            <select
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none bg-white disabled:bg-slate-50 disabled:text-slate-400"
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
                            disabled={loadingQuestions}
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all mt-4 ${
                                loadingQuestions 
                                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' 
                                : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 hover:-translate-y-1'
                            }`}
                        >
                            {loadingQuestions ? 'Sedang Memuat Pertanyaan...' : 'Mulai Asesmen'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Render Result Step
    if (step === 'result' && result) {
        const topPath = PATH_INFO[result.recommended];
        const chartData = result.topThree.map(item => ({
            name: PATH_INFO[item.path].label,
            score: item.percentage,
            fill: PATH_INFO[item.path].color
        }));

        return (
            <div className="min-h-screen bg-slate-50 py-8 print:bg-white print:py-0">
                <div className="max-w-5xl mx-auto px-4 print:px-0">
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

                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden print:shadow-none print:rounded-none">
                        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-8 text-white text-center print:bg-none print:text-black print:border-b print:p-4">
                            <h1 className="text-3xl font-bold mb-2">Hasil Angket Penjurusan SMA/SMK</h1>
                            <div className="flex justify-center gap-6 text-amber-100 font-medium print:text-slate-600 print:text-sm">
                                <span>Nama: {formData.nama}</span>
                                <span>•</span>
                                <span>Kelas: {formData.kelas}</span>
                            </div>
                        </div>

                        <div className="p-8 print:p-4">
                            {/* Top Recommendation */}
                            <div className="text-center mb-12 print:mb-6">
                                <p className="text-slate-500 mb-4 font-medium uppercase tracking-wider text-sm">Jurusan Yang Direkomendasikan</p>
                                <div className="inline-flex items-center gap-4 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl px-8 py-6 mb-6">
                                    <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: topPath.color }}>
                                        <topPath.icon size={32} />
                                    </div>
                                    <div className="text-left">
                                        <h2 className="text-3xl font-black text-slate-800">{topPath.fullName}</h2>
                                        <p className="text-amber-600 font-semibold">Tingkat Kesesuaian: {result.topThree[0].percentage}%</p>
                                    </div>
                                </div>
                                <p className="text-slate-600 max-w-3xl mx-auto leading-relaxed text-lg">
                                    {topPath.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12 print:grid-cols-1 print:gap-6">
                                {/* Chart */}
                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                        <BarChart3 size={20} className="text-amber-500" />
                                        Top 3 Jurusan
                                    </h3>
                                    <div className="h-[250px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                                <XAxis type="number" domain={[0, 100]} />
                                                <YAxis dataKey="name" type="category" width={100} />
                                                <Tooltip />
                                                <Bar dataKey="score" radius={[0, 8, 8, 0]}>
                                                    {chartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))}
                                                    <LabelList dataKey="score" position="right" formatter={(value: number) => `${value}%`} />
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Top 3 Details */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-slate-800 mb-2">Detail 3 Teratas</h3>
                                    {result.topThree.map((item, idx) => {
                                        const info = PATH_INFO[item.path];
                                        return (
                                            <div key={item.path} className={`flex gap-4 p-4 rounded-xl border transition-all ${idx === 0 ? 'border-amber-300 bg-amber-50/50' : 'border-slate-100 bg-white'}`}>
                                                <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: info.color }}>
                                                    <info.icon size={24} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-bold text-slate-800">{info.fullName}</h4>
                                                        <span className="text-sm font-bold px-2 py-1 rounded-lg" style={{ backgroundColor: info.color + '20', color: info.color }}>
                                                            {item.percentage}%
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-500 mt-1">{info.description}</p>
                                                </div>
                                            </div>
                                        );
                                    })}</div>
                            </div>

                            {/* Recommended Path Details */}
                            <div className="border-t border-slate-100 pt-8 print:pt-4">
                                <h3 className="text-xl font-bold text-slate-800 mb-6">Detail Jurusan Rekomendasi</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                                        <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                                            <BookOpen size={18} />
                                            Mata Pelajaran Utama
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {topPath.subjects.map((subject, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                                                    {subject}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                                        <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                                            <Briefcase size={18} />
                                            Prospek Karir
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {topPath.careers.map((career, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                                                    {career}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
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

    // Render Questions Step
    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                {onBack && (
                    <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-8 font-medium transition-colors">
                        <ArrowLeft size={20} /> Kembali
                    </button>
                )}

                {
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                        <div className="bg-slate-100 h-2 w-full">
                            <div
                                className="bg-amber-500 h-full transition-all duration-500 ease-out"
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
                                                ? 'border-amber-500 bg-amber-50 text-amber-700'
                                                : 'border-slate-100 text-slate-600 hover:border-amber-200 hover:bg-amber-50/30'
                                            }`}
                                    >
                                        <span>{option.label}</span>
                                        {answers[currentQuestion?.id || ''] === option.value && (
                                            <CheckCircle size={20} className="text-amber-500" />
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
                                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'}`}
                                >
                                    <ChevronLeft size={20} /> Sebelumnya
                                </button>

                                <button
                                    onClick={handleNext}
                                    disabled={loading || !answers[currentQuestion?.id || '']}
                                    className={`px-8 py-2.5 rounded-lg font-bold shadow-lg transition-all
                    ${loading || !answers[currentQuestion?.id || '']
                                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                                            : 'bg-amber-600 text-white shadow-amber-500/30 hover:bg-amber-700 hover:-translate-y-0.5'
                                        }`}
                                >
                                    {loading ? 'Menyimpan...' : (currentQuestionIndex === totalQuestions - 1 ? 'Selesai' : 'Selanjutnya')}
                                </button>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
}
