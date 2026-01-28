import React, { useState, useEffect } from 'react';
import { ChevronLeft, Save } from 'lucide-react';
import { useAuth } from '@/lib/authContextSupabase';
import { AUM_CATEGORIES, assessmentQuestions } from '@/lib/assessmentQuestions';
import { AKPD_CATEGORIES } from '@/lib/akpdQuestions';
import {
  getAssessmentQuestions,
  saveAssessmentQuestions,
} from '@/lib/assessmentQuestionsDB';

interface EditableQuestion {
  id: string;
  category: string;
  text: string;
  // Generic helper for different shapes
  [key: string]: any;
}

interface QuestionEditorProps {
  onBack: () => void;
  assessmentType: string;
}

export default function QuestionEditor({ onBack, assessmentType }: QuestionEditorProps) {
  const { user, loading: authLoading } = useAuth();
  const [questions, setQuestions] = useState<EditableQuestion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      loadQuestions();
    }
  }, [assessmentType, authLoading]);

  const loadQuestions = async () => {
    try {
      setError(null);
      const loadedQuestions = await getAssessmentQuestions(assessmentType);

      // Normalize the loaded questions
      const normalizedQuestions = (loadedQuestions as any[]).map(q => ({
        ...q,
        // Ensure AKPD "options" don't break things if they are essentially text
        text: Array.isArray(q.text) ? q.text.join('\n') : q.text // Handle array text if any (though usually strings) 
        // Revert: actually AKPD has "text" as string. MBTI has arrays? 
        // Let's check the data structure. Most have "text": string. 
        // MBTI in assessmentQuestions.ts has text as string (from the map).
      }));

      setQuestions(normalizedQuestions);

      // Set initial category
      if (normalizedQuestions.length > 0) {
        // Collect unique categories
        const categories = Array.from(new Set(normalizedQuestions.map((q: any) => q.categoryId || q.category)));
        if (categories.length > 0) setSelectedCategory(categories[0]);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load questions';
      setError(errorMessage);
      console.error('Error loading questions:', err);
    }
  };

  const getCategories = () => {
    if (assessmentType === 'aum') {
      return AUM_CATEGORIES.map((c) => ({
        id: c.id,
        name: c.name,
        label: c.label,
      }));
    } else if (assessmentType === 'akpd') {
      return AKPD_CATEGORIES.map((name) => ({
        id: name,
        name: name,
        label: name,
      }));
    } else {
      // Dynamic categories from questions
      const uniqueCategories = Array.from(new Set(questions.map(q => q.category)));
      return uniqueCategories.map(cat => ({
        id: cat,
        name: cat,
        label: cat
      }));
    }
  };

  const getCategoryLabel = () => {
    // Basic label finder
    const categories = getCategories();
    // Try to match by ID or Name (since generic ones might use name as ID)
    const category = categories.find((c) => c.id === selectedCategory || c.name === selectedCategory);
    return category?.label || selectedCategory;
  };

  // Filter logic handled loosely to support both ID and Name matching
  const categoryQuestions = questions.filter((q) =>
    q.categoryId === selectedCategory || q.category === selectedCategory
  );

  const handleEditQuestion = (id: string, text: string | string[]) => {
    setEditingId(id);
    // If text is array (like in some raw data maybe? no, definitions say string usually)
    // Wait, some definitions in assessmentQuestions.ts use text arrays mapped to index?
    // "text: [...]" in the definition is the array of ALL questions. 
    // The individual question object has "text": string.
    setEditText(typeof text === 'string' ? text : JSON.stringify(text));
  };

  const handleSaveQuestion = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, text: editText } : q))
    );
    setEditingId(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleSaveAll = async () => {
    if (!user?.id) {
      setError('Error: User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await saveAssessmentQuestions(assessmentType, questions, user.id);

      if (result?.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(result?.error || 'Failed to save questions');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 md:px-8 py-8">
      {/* Header */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-medium"
      >
        <ChevronLeft size={20} />
        Kembali ke Daftar Asesmen
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Soal: {(assessmentType || 'Asesmen').toUpperCase()}</h1>
        <p className="text-gray-600">
          Sesuaikan pertanyaan asesmen dengan kebutuhan sekolah Anda.
        </p>
      </div>

      {/* Error Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      {/* Category Tabs */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Pilih Kategori
        </h2>
        <div className="flex flex-wrap gap-2">
          {getCategories().map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${selectedCategory === category.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Questions List */}
      <div className="card">
        <div className="p-6 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                {getCategoryLabel()}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Total: {categoryQuestions.length} pertanyaan
              </p>
            </div>
            {saved && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                Tersimpan!
              </span>
            )}
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {categoryQuestions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Tidak ada pertanyaan untuk kategori ini.
            </div>
          ) : (
            categoryQuestions.map((question, index) => (
              <div key={question.id} className="p-6 hover:bg-blue-50 transition-colors group">
                <div className="flex items-start gap-4">
                  <span className="text-sm font-bold text-gray-400 flex-shrink-0 w-8 pt-1">
                    #{index + 1}
                  </span>
                  <div className="flex-1">
                    {editingId === question.id ? (
                      <div className="space-y-3 animate-in fade-in duration-200">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full p-4 border border-blue-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium text-gray-800"
                          rows={3}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveQuestion(question.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
                          >
                            <Save size={16} />
                            Simpan Perubahan
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start gap-4">
                        <p className="text-gray-800 leading-relaxed text-lg font-medium">{question.text}</p>
                        <button
                          onClick={() => handleEditQuestion(question.id, question.text)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 hover:text-blue-800 font-medium text-sm px-3 py-1 bg-blue-50 rounded-lg shrink-0"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )))}
        </div>

        <div className="p-6 bg-white border-t border-gray-200 rounded-b-lg sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 italic">
              *Jangan lupa simpan semua perubahan ke database
            </p>
            <button
              onClick={handleSaveAll}
              disabled={loading}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl transition-all font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${loading
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                }`}
            >
              <Save size={20} />
              {loading ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

