import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { saveSociometrySession, SociometrySession } from '@/lib/sociometryDB';


// Simple UUID generator that matches Postgres UUID type
const generateId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

import { useAuth } from '@/lib/authContextSupabase';

interface SociometryBuilderProps {
    onBack: () => void;
    schoolMode?: 'smp' | 'sma_smk';
}

import { generateClasses } from '@/lib/classHelper';

export default function SociometryBuilder({ onBack, schoolMode = 'smp' }: SociometryBuilderProps) {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [targetClass, setTargetClass] = useState('');
    const [questions, setQuestions] = useState<string[]>(['Siapa teman yang paling kamu suka ajak belajar bersama?', 'Siapa teman yang paling kamu suka ajak bermain?']);
    const [loading, setLoading] = useState(false);

    const classes = generateClasses(schoolMode).map(c => c.value);

    const handleAddQuestion = () => {
        setQuestions([...questions, '']);
    };

    const handleRemoveQuestion = (index: number) => {
        const newQ = [...questions];
        newQ.splice(index, 1);
        setQuestions(newQ);
    };

    const handleQuestionChange = (index: number, val: string) => {
        const newQ = [...questions];
        newQ[index] = val;
        setQuestions(newQ);
    };

    const handleSave = async () => {
        if (!title || !targetClass) {
            alert('Mohon isi Judul dan Kelas');
            return;
        }

        setLoading(true);
        const newSession: SociometrySession = {
            id: generateId(),
            title,
            class_id: targetClass,
            questions: questions.filter(q => q.trim() !== ''),
            status: 'active',
            created_at: new Date().toISOString(),
            created_by: user?.id
        };

        try {
            const result = await saveSociometrySession(newSession);

            if (result.success) {
                onBack();
            } else {
                alert(`Gagal menyimpan: ${result.error}`);
            }
        } catch (e) {
            alert('Terjadi kesalahan saat menyimpan.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors"
            >
                <ArrowLeft size={20} />
                <span>Kembali ke Daftar</span>
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-900">Buat Sosiometri Baru</h2>
                    <p className="text-slate-500 text-sm">Buat instrumen untuk mengukur hubungan sosial kelas</p>
                </div>

                <div className="p-8 space-y-8">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Judul Kegiatan</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Contoh: Sosiometri Kelas VII-1 Semester 1"
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Target Kelas</label>
                            <select
                                value={targetClass}
                                onChange={(e) => setTargetClass(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                            >
                                <option value="">Pilih Kelas...</option>
                                {classes.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Questions */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-slate-700">Daftar Pertanyaan</label>
                        </div>

                        <div className="space-y-3">
                            {questions.map((q, idx) => (
                                <div key={idx} className="flex gap-3 group">
                                    <div className="px-3 py-2 bg-slate-100 text-slate-500 font-medium rounded-lg text-sm flex items-center justify-center w-8">
                                        {idx + 1}
                                    </div>
                                    <input
                                        type="text"
                                        value={q}
                                        onChange={(e) => handleQuestionChange(idx, e.target.value)}
                                        placeholder="Tulis pertanyaan sosiometri..."
                                        className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    />
                                    {questions.length > 1 && (
                                        <button
                                            onClick={() => handleRemoveQuestion(idx)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleAddQuestion}
                            className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 transition-colors w-fit"
                        >
                            <Plus size={16} /> Tambah Pertanyaan
                        </button>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                    <button
                        onClick={onBack}
                        className="px-6 py-2.5 rounded-lg text-slate-600 font-medium hover:bg-slate-200 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? 'Menyimpan...' : (
                            <>
                                <Save size={18} /> Simpan Sosiometri
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
