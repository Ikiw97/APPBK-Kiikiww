import React, { useState, useEffect } from 'react';
import { ChevronLeft, Save, Plus, Trash2, RotateCcw, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/authContextSupabase';
import {
  getKahootQuestionsWithCustom,
  getVocabularyWordsWithCustom,
  saveKahootQuestions,
  saveVocabularyWords,
  resetAllGameQuestions,
  KahootQuestion,
  VocabularyWord,
} from '@/lib/gameQuestions';

interface GameQuestionEditorProps {
  onBack: () => void;
}

export default function GameQuestionEditor({ onBack }: GameQuestionEditorProps) {
  const { user, loading: authLoading } = useAuth();
  const [gameType, setGameType] = useState<'kahoot' | 'vocabulary'>('kahoot');
  const [kahootQuestions, setKahootQuestions] = useState<KahootQuestion[]>([]);
  const [vocabularyWords, setVocabularyWords] = useState<VocabularyWord[]>([]);
  const [saved, setSaved] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Authorization check - only super admin and teacher can edit
  const isAuthorized = user?.role === 'teacher' || user?.isSuperAdmin;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, [gameType]);

  useEffect(() => {
    // Load questions on component mount (will load from Supabase in loadQuestions)
    const load = async () => {
      await loadQuestions();
    };
    load();
  }, []);

  const loadQuestions = async () => {
    try {
      if (gameType === 'kahoot') {
        const questions = await getKahootQuestionsWithCustom();
        setKahootQuestions(questions);
      } else if (gameType === 'vocabulary') {
        const words = await getVocabularyWordsWithCustom();
        setVocabularyWords(words);
      }
      setEditingId(null);
      setEditingField(null);
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const handleSaveQuestion = (id: number, field: string, value: any) => {
    if (gameType === 'kahoot') {
      setKahootQuestions(prev =>
        prev.map(q => (q.id === id ? { ...q, [field]: value } : q))
      );
    } else if (gameType === 'vocabulary') {
      setVocabularyWords(prev =>
        prev.map(w => (w.id === id ? { ...w, [field]: value } : w))
      );
    }
    setEditingId(null);
    setEditingField(null);
  };

  const handleDeleteQuestion = (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pertanyaan ini?')) {
      return;
    }

    if (gameType === 'kahoot') {
      setKahootQuestions(prev => prev.filter(q => q.id !== id));
    } else if (gameType === 'vocabulary') {
      setVocabularyWords(prev => prev.filter(w => w.id !== id));
    }
  };

  const handleAddQuestion = () => {
    if (gameType === 'kahoot') {
      const newId = Math.max(...kahootQuestions.map(q => q.id), 0) + 1;
      setKahootQuestions(prev => [...prev, {
        id: newId,
        question: 'Pertanyaan baru',
        options: ['Opsi 1', 'Opsi 2', 'Opsi 3', 'Opsi 4'],
        correctIndex: 0,
        timeLimit: 30
      }]);
    } else if (gameType === 'vocabulary') {
      const newId = Math.max(...vocabularyWords.map(w => w.id), 0) + 1;
      setVocabularyWords(prev => [...prev, {
        id: newId,
        term: 'Istilah Baru',
        scenario: 'Deskripsi skenario',
        example: 'Contoh situasi',
        question: 'Pertanyaan baru',
        answer: 'Jawaban baru'
      }]);
    }
  };

  const handleSaveAll = async () => {
    if (!user?.id) {
      alert('Error: User not authenticated');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (gameType === 'kahoot') {
        result = await saveKahootQuestions(kahootQuestions, user.id);
      } else if (gameType === 'vocabulary') {
        result = await saveVocabularyWords(vocabularyWords, user.id);
      }

      if (result?.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert('Error: ' + (result?.error || 'Failed to save questions'));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert('Error: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Apakah Anda yakin ingin mereset semua pertanyaan game ke default? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }

    if (!user?.id) {
      alert('Error: User not authenticated');
      return;
    }

    setLoading(true);
    try {
      const result = await resetAllGameQuestions(user.id);
      if (result?.success) {
        await loadQuestions();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert('Error: ' + (result?.error || 'Failed to reset questions'));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert('Error: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Removed authorization check - all authenticated users can edit game questions

  return (
    <div className="px-6 md:px-8 py-8">
      {/* Header */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-medium"
      >
        <ChevronLeft size={20} />
        Kembali ke Pengaturan
      </button>

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-8">📝 Editor Pertanyaan Game</h1>

      {/* Save Status */}
      {saved && (
        <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 text-green-700 rounded-lg">
          ✅ Perubahan telah disimpan
        </div>
      )}

      {/* Game Type Selector */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pilih Game:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setGameType('kahoot')}
            className={`p-4 rounded-lg border-2 transition-all ${gameType === 'kahoot'
              ? 'border-indigo-600 bg-indigo-50'
              : 'border-gray-200 bg-white hover:border-indigo-400'
              }`}
          >
            <div className="text-2xl mb-2">🎮</div>
            <h3 className="font-semibold text-gray-900">Kahoot Game</h3>
            <p className="text-sm text-gray-600">{kahootQuestions.length} soal</p>
          </button>

          <button
            onClick={() => setGameType('vocabulary')}
            className={`p-4 rounded-lg border-2 transition-all ${gameType === 'vocabulary'
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-200 bg-white hover:border-blue-400'
              }`}
          >
            <div className="text-2xl mb-2">📚</div>
            <h3 className="font-semibold text-gray-900">Vocabulary Game</h3>
            <p className="text-sm text-gray-600">{vocabularyWords.length} istilah</p>
          </button>
        </div>
      </div>

      {/* Kahoot Questions Editor */}
      {gameType === 'kahoot' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Kahoot Game Questions ({kahootQuestions.length})</h2>
            <button
              onClick={handleAddQuestion}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              Tambah Pertanyaan
            </button>
          </div>

          <div className="space-y-4 mb-8">
            {kahootQuestions.map((q, idx) => (
              <div key={q.id} className="card p-6 border-2 border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Soal #{idx + 1}</h3>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pertanyaan</label>
                    <textarea
                      value={q.question}
                      onChange={(e) => handleSaveQuestion(q.id, 'question', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {q.options.map((option, optionIdx) => (
                      <div key={optionIdx}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Opsi {optionIdx + 1}
                          {optionIdx === q.correctIndex && <span className="text-green-600 ml-2">✓ Benar</span>}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...q.options];
                              newOptions[optionIdx] = e.target.value;
                              handleSaveQuestion(q.id, 'options', newOptions);
                            }}
                            className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none"
                          />
                          {optionIdx !== q.correctIndex && (
                            <button
                              onClick={() => handleSaveQuestion(q.id, 'correctIndex', optionIdx)}
                              className="px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              Set Benar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Waktu (detik)</label>
                    <input
                      type="number"
                      value={q.timeLimit}
                      onChange={(e) => handleSaveQuestion(q.id, 'timeLimit', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vocabulary Words Editor */}
      {gameType === 'vocabulary' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Vocabulary Words ({vocabularyWords.length})</h2>
            <button
              onClick={handleAddQuestion}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              Tambah Istilah
            </button>
          </div>

          <div className="space-y-4 mb-8">
            {vocabularyWords.map((w, idx) => (
              <div key={w.id} className="card p-6 border-2 border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Istilah #{idx + 1}</h3>
                  <button
                    onClick={() => handleDeleteQuestion(w.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Istilah</label>
                    <input
                      type="text"
                      value={w.term}
                      onChange={(e) => handleSaveQuestion(w.id, 'term', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Skenario</label>
                    <textarea
                      value={w.scenario}
                      onChange={(e) => handleSaveQuestion(w.id, 'scenario', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contoh</label>
                    <textarea
                      value={w.example}
                      onChange={(e) => handleSaveQuestion(w.id, 'example', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none"
                      rows={2}
                    />
                  </div>

                  <hr className="my-2" />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pertanyaan</label>
                    <textarea
                      value={w.question}
                      onChange={(e) => handleSaveQuestion(w.id, 'question', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none"
                      rows={2}
                      placeholder="Contoh: Apa itu istilah ini?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jawaban</label>
                    <textarea
                      value={w.answer}
                      onChange={(e) => handleSaveQuestion(w.id, 'answer', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none"
                      rows={3}
                      placeholder="Contoh: Jawaban lengkap untuk pertanyaan di atas..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 sticky bottom-8">
        <button
          onClick={handleSaveAll}
          disabled={loading}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium ${loading
            ? 'bg-green-400 text-white cursor-not-allowed opacity-75'
            : 'bg-green-600 text-white hover:bg-green-700'
            }`}
        >
          <Save size={20} />
          {loading ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
        </button>

        <button
          onClick={handleReset}
          disabled={loading}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium ${loading
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-75'
            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
        >
          <RotateCcw size={20} />
          {loading ? 'Mereset...' : 'Reset ke Default'}
        </button>
      </div>
    </div>
  );
}
