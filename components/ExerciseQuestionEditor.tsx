import React, { useState, useEffect } from 'react';
import { ChevronLeft, Save, Plus, Trash2, X } from 'lucide-react';
// Remove useAuth import if not strictly needed or mocking auth
// import { useAuth } from '@/lib/authContextSupabase';

interface ExerciseQuestion {
    id?: string;
    type: string;
    level: 'easy' | 'advanced';
    category: string;
    question: string;
    answers: string[];
    correctIndex: number;
    explanation: string;
    timeLimit: number;
}

interface ExerciseQuestionEditorProps {
    onBack: () => void;
    exerciseType: 'psikotest' | 'analogi' | 'tiu';
}

export default function ExerciseQuestionEditor({ onBack, exerciseType }: ExerciseQuestionEditorProps) {
    const [questions, setQuestions] = useState<ExerciseQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLevel, setSelectedLevel] = useState<'easy' | 'advanced'>('easy');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<ExerciseQuestion | null>(null);
    const [saving, setSaving] = useState(false);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/exercises/local-questions?type=${exerciseType}&level=${selectedLevel}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setQuestions(data);
        } catch (err) {
            console.error(err);
            alert('Gagal memuat soal');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, [exerciseType, selectedLevel]);

    const handleEdit = (question: ExerciseQuestion) => {
        setEditingId(question.id || 'new');
        setFormData({ ...question });
    };

    const handleAddNew = () => {
        setFormData({
            type: exerciseType,
            level: selectedLevel,
            category: 'numerical', // Default category
            question: '',
            answers: ['', '', '', ''],
            correctIndex: 0,
            explanation: '',
            timeLimit: 30
        });
        setEditingId('new');
    };

    const handleSave = async () => {
        if (!formData) return;
        setSaving(true);
        try {
            let updatedQuestions = [...questions];

            if (editingId === 'new') {
                // Calculate next ID
                const nextId = updatedQuestions.length > 0
                    ? Math.max(...updatedQuestions.map(q => Number(q.id) || 0)) + 1
                    : 1;

                // Ensure id is string if that's what we want, or number. 
                // The interface says string | undefined, but existing data uses numbers.
                // We'll stick to string for safety in form data, but might need to cast for consistency.
                // Actually the interface in this file says id?: string. 
                // But in testQuestions.ts it says id: number | string.
                // Let's use string for the form data ID to be safe and consistent with the interface here.
                updatedQuestions.push({ ...formData, id: String(nextId) });
            } else {
                updatedQuestions = updatedQuestions.map(q =>
                    (String(q.id) === String(editingId)) ? { ...formData, id: q.id } : q
                );
            }

            const res = await fetch('/api/exercises/local-questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: exerciseType,
                    level: selectedLevel,
                    questions: updatedQuestions
                })
            });

            if (!res.ok) throw new Error('Failed to save');

            setQuestions(updatedQuestions);
            setEditingId(null);
            setFormData(null);
        } catch (err) {
            console.error(err);
            alert('Gagal menyimpan soal');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string | number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus soal ini?')) return;
        try {
            const updatedQuestions = questions.filter(q => String(q.id) !== String(id));

            const res = await fetch('/api/exercises/local-questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: exerciseType,
                    level: selectedLevel,
                    questions: updatedQuestions
                })
            });

            if (!res.ok) throw new Error('Failed to delete');
            setQuestions(updatedQuestions);
        } catch (err) {
            console.error(err);
            alert('Gagal menghapus soal');
        }
    };

    const handleAnswerChange = (index: number, value: string) => {
        if (formData) {
            const newAnswers = [...formData.answers];
            newAnswers[index] = value;
            setFormData({ ...formData, answers: newAnswers });
        }
    };

    const getTitle = () => {
        switch (exerciseType) {
            case 'psikotest': return 'Psikotest Logika';
            case 'analogi': return 'Test Analogi';
            case 'tiu': return 'Tes Intelegensi Umum';
            default: return 'Latihan Soal';
        }
    };

    return (
        <div className="px-6 md:px-8 py-8 w-full max-w-5xl mx-auto">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 font-medium"
            >
                <ChevronLeft size={20} />
                Kembali
            </button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Editor Soal: {getTitle()}</h1>
                    <p className="text-gray-600">Kelola database soal latihan</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setSelectedLevel('easy')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${selectedLevel === 'easy' ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Mudah (Easy)
                    </button>
                    <button
                        onClick={() => setSelectedLevel('advanced')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${selectedLevel === 'advanced' ? 'bg-white shadow text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Advanced
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Memuat soal...</div>
            ) : (
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <button
                            onClick={handleAddNew}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            <Plus size={18} />
                            Tambah Soal Baru
                        </button>
                    </div>

                    {questions.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200 text-gray-500">
                            Belum ada soal untuk kategori ini. Silahkan tambah soal baru.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {questions.map((q, idx) => (
                                <div key={q.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start gap-4">
                                        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-600 font-bold text-sm">
                                            {idx + 1}
                                        </span>
                                        <div className="flex-1">
                                            <div className="mb-2">
                                                <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium mb-2 mr-2">
                                                    {q.category}
                                                </span>
                                                <span className="inline-block px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md mb-2">
                                                    {q.timeLimit} detik
                                                </span>
                                            </div>
                                            <p className="font-medium text-gray-900 mb-3">{q.question}</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                                                {q.answers.map((ans, i) => (
                                                    <div key={i} className={`text-sm px-3 py-2 rounded border ${i === q.correctIndex ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                                                        {String.fromCharCode(65 + i)}. {ans}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                                                <strong>Penjelasan:</strong> {q.explanation}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => handleEdit(q)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Save size={18} className="rotate-0" /> {/* Reusing Save icon as Edit icon visually if needed or just import Edit */}
                                                {/* Wait, I imported Save but not Edit. Let me fix imports or use Save as placeholder */}
                                                <span className="sr-only">Edit</span>
                                                EDIT
                                            </button>
                                            <button
                                                onClick={() => handleDelete(q.id!)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Hapus"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Edit Modal */}
            {editingId && formData && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl my-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingId === 'new' ? 'Tambah Soal Baru' : 'Edit Soal'}
                            </h3>
                            <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                <input
                                    type="text"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Contoh: numerical, verbal, logic"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pertanyaan</label>
                                <textarea
                                    value={formData.question}
                                    onChange={e => setFormData({ ...formData, question: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent h-24"
                                    placeholder="Tulis pertanyaan di sini..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Pilihan Jawaban</label>
                                <div className="space-y-2">
                                    {formData.answers.map((ans, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <input
                                                type="radio"
                                                name="correct_answer"
                                                checked={formData.correctIndex === idx}
                                                onChange={() => setFormData({ ...formData, correctIndex: idx })}
                                                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                                            />
                                            <span className="w-6 text-gray-500 font-medium">{String.fromCharCode(65 + idx)}.</span>
                                            <input
                                                type="text"
                                                value={ans}
                                                onChange={e => handleAnswerChange(idx, e.target.value)}
                                                className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formData.correctIndex === idx ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`}
                                                placeholder={`Pilihan ${String.fromCharCode(65 + idx)}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">*Pilih radio button untuk menandai jawaban yang benar</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Penjelasan</label>
                                <textarea
                                    value={formData.explanation}
                                    onChange={e => setFormData({ ...formData, explanation: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent h-20"
                                    placeholder="Jelaskan kenapa jawaban tersebut benar..."
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Waktu (detik)</label>
                                    <input
                                        type="number"
                                        value={formData.timeLimit}
                                        onChange={e => setFormData({ ...formData, timeLimit: parseInt(e.target.value) || 30 })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => setEditingId(null)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
                            >
                                {saving ? 'Menyimpan...' : 'Simpan Soal'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
