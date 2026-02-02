import { useState, useEffect } from 'react';
import PsikotestForm from '@/components/PsikotestForm';
import GenericTestForm from '@/components/GenericTestForm';
import { TestQuestion } from '@/lib/testQuestions';
import { useFeatureSettings } from '@/lib/useFeatureSettings';
import { useAuth } from '@/lib/authContextSupabase';

type ExerciseType = 'select' | 'psikotest' | 'analogi' | 'tiu';
type DifficultyLevel = 'easy' | 'advanced';

interface ExerciseSelectorProps {
    onBack?: () => void;
    initialExercise?: string;
}

export default function ExerciseSelector({ onBack, initialExercise }: ExerciseSelectorProps) {
    const [selectedExercise, setSelectedExercise] = useState<ExerciseType>('select');
    const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');
    const [showDifficultyModal, setShowDifficultyModal] = useState<boolean>(false);
    const [pendingExercise, setPendingExercise] = useState<ExerciseType | null>(null);
    const [activeQuestions, setActiveQuestions] = useState<TestQuestion[]>([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);

    const { settings, loading } = useFeatureSettings();
    // @ts-ignore
    const { user } = useAuth();

    const handleSelectExercise = (type: ExerciseType) => {
        // Show difficulty selection for all types (Psikotest, Analogi, TIU)
        setPendingExercise(type);
        setShowDifficultyModal(true);
    };

    const handleConfirmDifficulty = (level: DifficultyLevel) => {
        if (pendingExercise) {
            setDifficulty(level);
            setSelectedExercise(pendingExercise);
            setShowDifficultyModal(false);
            setPendingExercise(null);
        }
    };

    const handleBackToSelector = () => {
        setSelectedExercise('select');
        setPendingExercise(null);
        setActiveQuestions([]);
    };

    useEffect(() => {
        if (initialExercise &&
            ['psikotest', 'analogi', 'tiu'].includes(initialExercise) &&
            selectedExercise === 'select' &&
            !pendingExercise &&
            !showDifficultyModal) { // Prevent loop/double open
            handleSelectExercise(initialExercise as ExerciseType);
        }
    }, [initialExercise]);

    useEffect(() => {
        const fetchQuestions = async () => {
            if (selectedExercise !== 'select') {
                setLoadingQuestions(true);
                try {
                    const res = await fetch(`/api/exercises/local-questions?type=${selectedExercise}&level=${difficulty}`);
                    if (!res.ok) throw new Error('Failed to fetch questions');

                    const data = await res.json();

                    // Map API response to TestQuestion format
                    // Since local-questions API returns data in the correct format (camelCase), 
                    // we can just pass it through or ensure type safety.
                    const mappedQuestions: TestQuestion[] = data.map((q: any) => ({
                        id: q.id,
                        category: q.category,
                        question: q.question,
                        answers: q.answers,
                        correctIndex: q.correctIndex, // Using camelCase matching the file source
                        explanation: q.explanation,
                        timeLimit: q.timeLimit // Using camelCase matching the file source
                    }));

                    setActiveQuestions(mappedQuestions);
                } catch (error) {
                    console.error('Error fetching questions:', error);
                    // Fallback or error handling could go here
                } finally {
                    setLoadingQuestions(false);
                }
            }
        };

        fetchQuestions();
    }, [selectedExercise, difficulty]);

    // If loading settings, show spinner
    if (loading) {
        return <div className="p-12 text-center">Loading settings...</div>;
    }

    if (loadingQuestions) {
        return (
            <div className="px-6 md:px-8 py-12 flex items-center justify-center min-h-screen bg-[#FAFAFA]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat soal latihan...</p>
                </div>
            </div>
        );
    }

    // Render specific test forms based on selection
    if (selectedExercise === 'psikotest' && activeQuestions.length > 0) {
        return (
            <PsikotestForm
                onBack={handleBackToSelector}
                questions={activeQuestions}
            />
        );
    }

    if (selectedExercise === 'analogi' && activeQuestions.length > 0) {
        const title = difficulty === 'easy' ? 'Test Analogi (Mudah)' : 'Test Analogi (Advanced)';
        return (
            <GenericTestForm
                title={title}
                questions={activeQuestions}
                onBack={handleBackToSelector}
            />
        );
    }

    if (selectedExercise === 'tiu' && activeQuestions.length > 0) {
        const title = difficulty === 'easy' ? 'Tes Intelegensi Umum (Mudah)' : 'Tes Intelegensi Umum (Advanced)';
        return (
            <GenericTestForm
                title={title}
                questions={activeQuestions}
                onBack={handleBackToSelector}
            />
        );
    }

    return (
        <div className="px-6 md:px-8 py-8 max-w-6xl mx-auto relative min-h-screen bg-[#FAFAFA]">
            {/* Hero Header - Clean Light Design */}
            <div className="relative mb-8 p-6 md:p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">

                {/* Content */}
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-5">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">Instrumen & Media</span>
                            </div>

                            <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
                                Latihan Tes
                            </h1>
                            <p className="text-slate-600 text-base md:text-lg max-w-xl">
                                Pilih jenis latihan untuk mengasah kemampuan Anda.
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 mt-8">
                        <div className="bg-slate-50 border border-slate-200 rounded-full px-4 py-2 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></span>
                            <span className="text-sm font-medium text-slate-700">3 Jenis Latihan</span>
                        </div>
                    </div>
                </div>
            </div>



            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Psikotest Card */}
                {(settings?.exercises.psikotest || user?.role !== 'student') && (
                    <div
                        onClick={() => (settings?.exercises.psikotest || user?.role !== 'student') ? handleSelectExercise('psikotest') : null}
                        className={`card p-8 cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 group ${(!settings?.exercises.psikotest && user?.role === 'student') ? 'opacity-50 grayscale cursor-not-allowed hover:translate-y-0 hover:shadow-none' : ''}`}
                    >
                        <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">🧠</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Psikotest Logika</h2>
                        <p className="text-gray-600 mb-6">
                            Latih kemampuan logika, numerik, dan verbal Anda dengan soal-soal standar psikotes.
                        </p>
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-3 text-sm text-gray-700">
                                <span className="text-purple-600 font-bold">✓</span>
                                <span>Penalaran Deduktif & Pola</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-700">
                                <span className="text-purple-600 font-bold">✓</span>
                                <span>Level Mudah & Advanced</span>
                            </div>
                        </div>
                        <button
                            disabled={!settings?.exercises.psikotest && user?.role === 'student'}
                            className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-400"
                        >
                            {(settings?.exercises.psikotest || user?.role !== 'student') ? 'Mulai Latihan' : 'Dinonaktifkan'}
                        </button>
                    </div>
                )}

                {/* Analogi Card */}
                {(settings?.exercises.analogi || user?.role !== 'student') && (
                    <div
                        onClick={() => (settings?.exercises.analogi || user?.role !== 'student') ? handleSelectExercise('analogi') : null}
                        className={`card p-8 cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 group ${(!settings?.exercises.analogi && user?.role === 'student') ? 'opacity-50 grayscale cursor-not-allowed hover:translate-y-0 hover:shadow-none' : ''}`}
                    >
                        <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">📝</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Test Analogi</h2>
                        <p className="text-gray-600 mb-6">
                            Uji kemampuan menghubungkan kata dan konsep. Temukan hubungan yang setara antar pasangan kata.
                        </p>
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-3 text-sm text-gray-700">
                                <span className="text-blue-600 font-bold">✓</span>
                                <span>Padanan & Hubungan Kata</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-700">
                                <span className="text-blue-600 font-bold">✓</span>
                                <span>Level Mudah & Advanced</span>
                            </div>
                        </div>
                        <button
                            disabled={!settings?.exercises.analogi && user?.role === 'student'}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                        >
                            {(settings?.exercises.analogi || user?.role !== 'student') ? 'Mulai Latihan' : 'Dinonaktifkan'}
                        </button>
                    </div>
                )}

                {/* TIU Card */}
                {(settings?.exercises.tiu || user?.role !== 'student') && (
                    <div
                        onClick={() => (settings?.exercises.tiu || user?.role !== 'student') ? handleSelectExercise('tiu') : null}
                        className={`card p-8 cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 group ${(!settings?.exercises.tiu && user?.role === 'student') ? 'opacity-50 grayscale cursor-not-allowed hover:translate-y-0 hover:shadow-none' : ''}`}
                    >
                        <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">💡</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Tes Intelegensi Umum</h2>
                        <p className="text-gray-600 mb-6">
                            Tes komprehensif mencakup verbal, numerik, dan figural untuk mengukur kecerdasan umum.
                        </p>
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-3 text-sm text-gray-700">
                                <span className="text-emerald-600 font-bold">✓</span>
                                <span>Sinonim, Antonim, Aritmatika</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-700">
                                <span className="text-emerald-600 font-bold">✓</span>
                                <span>Level Mudah & Advanced</span>
                            </div>
                        </div>
                        <button
                            disabled={!settings?.exercises.tiu && user?.role === 'student'}
                            className="w-full bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:bg-gray-400"
                        >
                            {(settings?.exercises.tiu || user?.role !== 'student') ? 'Mulai Latihan' : 'Dinonaktifkan'}
                        </button>
                    </div>
                )}

            </div>

            {/* Difficulty Modal */}
            {
                showDifficultyModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl animate-fade-in">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Pilih Tingkat Kesulitan</h3>
                            <p className="text-gray-600 mb-6">
                                Silahkan pilih tingkat kesulitan soal yang ingin Anda kerjakan.
                            </p>

                            <div className="grid grid-cols-1 gap-4">
                                <button
                                    onClick={() => handleConfirmDifficulty('easy')}
                                    className="flex items-center gap-4 p-4 rounded-lg border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-colors text-left group"
                                >
                                    <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                        😊
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-green-900">Mudah (Easy)</h4>
                                        <p className="text-sm text-green-700">Soal-soal dasar untuk pemula</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleConfirmDifficulty('advanced')}
                                    className="flex items-center gap-4 p-4 rounded-lg border-2 border-red-200 bg-red-50 hover:bg-red-100 transition-colors text-left group"
                                >
                                    <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                        🔥
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-red-900">Advanced</h4>
                                        <p className="text-sm text-red-700">Soal menantang untuk tingkat lanjut</p>
                                    </div>
                                </button>
                            </div>

                            <button
                                onClick={() => {
                                    setShowDifficultyModal(false);
                                    setPendingExercise(null);
                                }}
                                className="mt-6 w-full text-gray-500 hover:text-gray-700 py-2 text-sm font-medium"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                )
            }

        </div >
    );
}
