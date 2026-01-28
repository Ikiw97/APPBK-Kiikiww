import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ArrowLeft, Send, CheckCircle, User } from 'lucide-react';
import { getSociometrySessions, saveSociometryResponse, SociometrySession, SociometryResponse } from '@/lib/sociometryDB';
import { useAuth } from '@/lib/authContextSupabase';
import { getSiswaByKelas } from '@/lib/siswaStorage';
import { SiswaAbsensi } from '@/lib/absensiTypes';

// Simple UUID generator that matches Postgres UUID type
const generateId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

interface SociometryStudentFormProps {
    sessionId: string;
    onBack: () => void;
}

export default function SociometryStudentForm({ sessionId, onBack }: SociometryStudentFormProps) {
    const { user } = useAuth();
    const [session, setSession] = useState<SociometrySession | null>(null);
    const [students, setStudents] = useState<SiswaAbsensi[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [completed, setCompleted] = useState(false);

    // Identity Step
    const [mySelf, setMySelf] = useState<SiswaAbsensi | null>(null);
    const [step, setStep] = useState<'identity' | 'questions'>('identity');

    // State for answers: questionIndex -> [choice1Id, choice2Id, choice3Id]
    const [answers, setAnswers] = useState<Record<number, (string | '')[]>>({});

    useEffect(() => {
        loadData();
    }, [sessionId]);

    const loadData = async () => {
        setLoading(true);
        try {
            // 1. Load Session (via API/DB)
            const sessions = await getSociometrySessions();
            const currentSession = sessions.find(s => s.id === sessionId);
            setSession(currentSession || null);

            if (currentSession) {
                // 2. Load Classmates using Master Data (Local Storage for now as Master Data source)
                const classmates = await getSiswaByKelas(currentSession.class_id);
                setStudents(classmates || []);

                // Initialize answers structure
                const initAnswers: Record<number, string[]> = {};
                currentSession.questions.forEach((_, idx) => {
                    initAnswers[idx] = ['', '', '']; // 3 slots default
                });
                setAnswers(initAnswers);
            }
        } catch (err) {
            console.error('Error loading data:', err);
        }
        setLoading(false);
    };

    const handleIdentitySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const studentId = e.target.value;
        const student = students.find(s => s.id === studentId || s.id.toString() === studentId); // Handle potential number/string mismatch
        setMySelf(student || null);
    };

    const confirmIdentity = () => {
        if (mySelf) {
            setStep('questions');
        } else {
            alert('Silakan pilih nama Anda terlebih dahulu.');
        }
    };

    const handleChoiceChange = (questionIdx: number, slotIdx: number, studentId: string) => {
        setAnswers(prev => {
            const currentSlots = [...(prev[questionIdx] || ['', '', ''])];

            // Check if already selected in another slot for THIS question
            if (studentId && currentSlots.includes(studentId) && currentSlots[slotIdx] !== studentId) {
                alert('Nama ini sudah dipilih di pilihan lain untuk pertanyaan ini.');
                return prev;
            }

            currentSlots[slotIdx] = studentId;
            return { ...prev, [questionIdx]: currentSlots };
        });
    };

    const handleSubmit = async () => {
        if (!session || !mySelf) return;

        // Validation: At least 1 choice per question? Or strict 3?
        // Let's require at least choice #1 for every question.
        const unanswered = session.questions.findIndex((_, idx) => !answers[idx][0]);
        if (unanswered !== -1) {
            alert(`Mohon isi setidaknya Pilihan 1 untuk pertanyaan nomor ${unanswered + 1}`);
            return;
        }

        setSubmitting(true);

        try {
            // Prepare response object
            const response: SociometryResponse = {
                id: generateId(),
                session_id: session.id,
                student_id: mySelf.id.toString(),
                student_name: mySelf.nama,
                student_gender: mySelf.jenisKelamin || 'Unknown',
                submitted_at: new Date().toISOString(),
                answers: session.questions.map((_, idx) => ({
                    question_index: idx,
                    selected_students: answers[idx].filter(id => id !== '') as string[]
                }))
            };

            const result = await saveSociometryResponse(response);
            if (result) {
                setCompleted(true);
            } else {
                alert('Gagal menyimpan respon. Silakan coba lagi.');
            }
        } catch (e) {
            console.error(e);
            alert('Terjadi kesalahan sistem.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="p-10 text-center text-slate-500">Memuat data sosiometri...</div>;
    }

    if (completed) {
        return (
            <div className="max-w-2xl mx-auto py-12 text-center animate-in zoom-in-50 duration-500">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Terima Kasih, {mySelf?.nama}!</h2>
                <p className="text-slate-500 mb-8">Jawaban sosiometri kamu telah berhasil disimpan.</p>
                <button
                    onClick={onBack}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Kembali ke Dashboard
                </button>
            </div>
        );
    }

    if (!session) return <div>Sesi tidak ditemukan</div>;

    // --- STEP 1: IDENTITY SELECTION ---
    if (step === 'identity') {
        return (
            <div className="max-w-xl mx-auto py-12 animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <User size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Selamat Datang</h2>
                    <p className="text-slate-500 mb-8">
                        Sebelum mengisi Sosiometri <strong>{session.title}</strong>,<br />
                        silakan konfirmasi identitas Anda terlebih dahulu.
                    </p>

                    <div className="text-left mb-6">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Siapa Nama Anda?</label>
                        <select
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            onChange={handleIdentitySelect}
                            value={mySelf?.id || ''}
                        >
                            <option value="">-- Pilih Nama Anda --</option>
                            {students.sort((a, b) => a.nama.localeCompare(b.nama)).map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.nama} ({s.nis})
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-400 mt-2">
                            *Pastikan nama sesuai. Data kelas diambil dari Master Data Kelas <strong>{session.class_id}</strong>.
                        </p>


                    </div>

                    <button
                        onClick={confirmIdentity}
                        disabled={!mySelf}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Lanjut ke Pertanyaan &rarr;
                    </button>

                    <button onClick={onBack} className="mt-4 text-slate-400 hover:text-slate-600 text-sm">
                        Batal
                    </button>
                </div>
            </div>
        );
    }

    // --- STEP 2: QUESTIONS ---
    return (
        <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500 pb-20">
            <button onClick={() => setStep('identity')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                <ArrowLeft size={20} />
                <span>Ganti Identitas ({mySelf?.nama})</span>
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">{session.title}</h1>
                    <p className="text-slate-600">Jawablah dengan jujur. Pilihanmu bersifat rahasia.</p>
                </div>

                <div className="p-6 md:p-8 space-y-12">
                    {session.questions.map((q, qIdx) => (
                        <div key={qIdx} className="space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-lg font-bold">
                                    {qIdx + 1}
                                </span>
                                {q}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ml-12">
                                {[0, 1, 2].map((slotIdx) => (
                                    <div key={slotIdx} className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-600">
                                            Pilihan {slotIdx + 1}
                                        </label>
                                        <select
                                            className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                                            value={answers[qIdx]?.[slotIdx] || ''}
                                            onChange={(e) => handleChoiceChange(qIdx, slotIdx, e.target.value)}
                                        >
                                            <option value="">-- Pilih Teman --</option>
                                            {students
                                                .filter(s => s.id !== mySelf?.id) // Exclude self
                                                .sort((a, b) => a.nama.localeCompare(b.nama))
                                                .map(s => (
                                                    <option key={s.id} value={s.id}>
                                                        {s.nama}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:transform-none"
                    >
                        {submitting ? 'Mengirim...' : (
                            <>
                                Kirim Jawaban <Send size={18} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
