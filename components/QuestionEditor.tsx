import React, { useState, useEffect } from 'react';
import { ChevronLeft, Save, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/authContextSupabase';
import { AUM_CATEGORIES, SMA_SMK_JURUSAN, assessmentQuestions } from '@/lib/assessmentQuestions';
import { 
  AKPD_CATEGORIES, 
  AKPD_QUESTIONS_BY_GRADE, 
  getAKPDQuestionsByGrade,
  type AKPDQuestion 
} from '@/lib/akpdQuestions';
import {
  getAssessmentQuestions,
  saveAssessmentQuestions,
} from '@/lib/assessmentQuestionsDB';

interface EditableQuestion {
  id: string;
  category: string;
  text: string;
  gradeLevel?: string;
  // Generic helper for different shapes
  [key: string]: any;
}

interface QuestionEditorProps {
  onBack: () => void;
  assessmentType: string;
}

// Grade levels for SMP
const GRADE_LEVELS = ['VII', 'VIII', 'IX'];

export default function QuestionEditor({ onBack, assessmentType }: QuestionEditorProps) {
  const { user, loading: authLoading } = useAuth();
  const [questions, setQuestions] = useState<EditableQuestion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<string>('VII');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State untuk fitur tambah soal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [selectedJurusan, setSelectedJurusan] = useState('');
  const [selectedAkpdCategory, setSelectedAkpdCategory] = useState('');
  const [selectedGenericCategory, setSelectedGenericCategory] = useState('');

  // Check if this is AKPD assessment (needs grade level selector)
  const isAKPD = assessmentType === 'akpd';
  const isSmaSmk = assessmentType === 'sma_smk';

  useEffect(() => {
    if (!authLoading) {
      loadQuestions();
    }
  }, [assessmentType, authLoading, selectedGradeLevel]);

  const loadQuestions = async () => {
    try {
      setError(null);
      
      let loadedQuestions: any[];
      
      if (isAKPD) {
        // For AKPD, load grade-specific questions
        loadedQuestions = getAKPDQuestionsByGrade(selectedGradeLevel);
      } else {
        loadedQuestions = await getAssessmentQuestions(assessmentType);
      }

      // Normalize the loaded questions
      const normalizedQuestions = (loadedQuestions as any[]).map(q => ({
        ...q,
        text: Array.isArray(q.text) ? q.text.join('\n') : q.text
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
      const uniqueCategories = Array.from(new Set(questions.map(q => q.category)));
      return uniqueCategories.map(cat => ({
        id: cat,
        name: cat,
        label: cat
      }));
    } else if (assessmentType === 'sma_smk') {
      return [
        { id: 'Minat Akademik (SMA)', name: 'Minat Akademik (SMA)', label: 'Minat Akademik (SMA)' },
        { id: 'Minat Vokasi (SMK)', name: 'Minat Vokasi (SMK)', label: 'Minat Vokasi (SMK)' }
      ];
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
      // For AKPD, we need to save with grade level info
      const questionsToSave = isAKPD 
        ? questions.map(q => ({ ...q, gradeLevel: selectedGradeLevel }))
        : questions;
      
      const result = await saveAssessmentQuestions(
        isAKPD ? `akpd_${selectedGradeLevel}` : assessmentType, 
        questionsToSave, 
        user.id
      );

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

  // Handler untuk menambah soal baru
  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) {
      setError('Teks pertanyaan tidak boleh kosong');
      return;
    }
    
    // Validate selection based on type
    const isSmaSmk = assessmentType === 'sma_smk';
    if (isSmaSmk && !selectedJurusan) return;
    if (isAKPD && !selectedAkpdCategory) return;
    if (!isSmaSmk && !isAKPD && !selectedGenericCategory) return;
    
    // Determine category
    let category = selectedCategory;
    
    if (isSmaSmk) {
        // reuse existing logic for sma_smk
        const jurusanToUse = selectedJurusan;
        category = jurusanToUse.startsWith('sma_') ? 'Minat Akademik (SMA)' : 'Minat Vokasi (SMK)';
    } else if (isAKPD) {
        category = selectedAkpdCategory;
    } else {
        category = selectedGenericCategory;
    }
    
    const newQuestion: EditableQuestion = {
      id: `new_${Date.now()}`,
      category: category,
      categoryId: isAKPD ? selectedAkpdCategory.toLowerCase() : category.toLowerCase().replace(/\s+/g, '_'), // simplified default
      text: newQuestionText.trim(),
      options: ['Sangat Setuju', 'Setuju', 'Netral', 'Tidak Setuju', 'Sangat Tidak Setuju'],
      ...(isSmaSmk && { jurusan: selectedJurusan }),
      ...(isAKPD && { gradeLevel: selectedGradeLevel })
    };
    
    setQuestions(prev => [...prev, newQuestion]);
    setNewQuestionText('');
    setShowAddModal(false);
    setSelectedAkpdCategory(''); // Reset selection
    setSelectedGenericCategory('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Handler untuk menghapus soal
  const handleDeleteQuestion = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pertanyaan ini?')) {
      setQuestions(prev => prev.filter(q => q.id !== id));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  // Get jurusan options filtered by category
  const getJurusanOptions = () => {
    if (selectedCategory === 'Minat Akademik (SMA)') {
      return SMA_SMK_JURUSAN.filter(j => j.type === 'SMA');
    } else if (selectedCategory === 'Minat Vokasi (SMK)') {
      return SMA_SMK_JURUSAN.filter(j => j.type === 'SMK');
    }
    return SMA_SMK_JURUSAN;
  };

  return (
    <div className="px-6 md:px-8 py-8">
      {/* Header */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-8 font-medium"
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

      {/* Grade Level Selector for AKPD */}
      {isAKPD && (
        <div className="card p-6 mb-6 bg-gradient-to-r from-primary-50 to-indigo-50 border-primary-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📚</span>
            Pilih Tingkat Kelas
          </h2>
          <div className="flex flex-wrap gap-3">
            {GRADE_LEVELS.map((grade) => {
              const gradeQuestions = AKPD_QUESTIONS_BY_GRADE[grade] || [];
              return (
                <button
                  key={grade}
                  onClick={() => setSelectedGradeLevel(grade)}
                  className={`px-6 py-3 rounded-xl font-bold transition-all text-base flex flex-col items-center min-w-[100px] ${
                    selectedGradeLevel === grade
                      ? 'bg-gradient-to-r from-primary-600 to-primary-800 text-white shadow-lg transform scale-105'
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-primary-300'
                  }`}
                >
                  <span className="text-lg">Kelas {grade}</span>
                  <span className={`text-xs ${selectedGradeLevel === grade ? 'text-primary-100' : 'text-gray-400'}`}>
                    {gradeQuestions.length} soal
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            💡 Setiap tingkat kelas memiliki pertanyaan yang berbeda sesuai dengan kebutuhan perkembangannya.
          </p>
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
                ? 'bg-primary-600 text-white shadow-md'
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
                {isAKPD && <span className="ml-2 text-primary-600">(Kelas {selectedGradeLevel})</span>}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Total: {categoryQuestions.length} pertanyaan
              </p>
            </div>
            <div className="flex items-center gap-3">
              {saved && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                  Tersimpan!
                </span>
              )}
                <button
                  onClick={() => {
                    setShowAddModal(true);
                    // Set defaults
                    if (assessmentType === 'sma_smk') {
                        const defaultJurusan = getJurusanOptions()[0]?.id || '';
                        setSelectedJurusan(defaultJurusan);
                    } else if (isAKPD) {
                         // Default category if any
                         setSelectedAkpdCategory(AKPD_CATEGORIES[0] || '');
                    } else {
                         // Generic: Default to current selected category or first available
                         const cats = getCategories();
                         const currentCat = cats.find(c => c.id === selectedCategory || c.name === selectedCategory);
                         setSelectedGenericCategory(currentCat?.name || cats[0]?.name || '');
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm shadow-sm"
                >
                  <Plus size={18} />
                  Tambah Soal
                </button>
                
                {questions.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Apakah Anda yakin ingin MENGHAPUS SEMUA pertanyaan? Tindakan ini tidak dapat dibatalkan.')) {
                        setQuestions([]);
                        setSaved(false); // Mark as unsaved
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm shadow-sm border border-red-200"
                  >
                    <Trash2 size={18} />
                    Hapus Semua
                  </button>
                )}
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {categoryQuestions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {isAKPD 
                ? `Tidak ada pertanyaan untuk kategori ini di Kelas ${selectedGradeLevel}.`
                : 'Tidak ada pertanyaan untuk kategori ini.'
              }
            </div>
          ) : (
            (() => {
              // For sma_smk, group questions by jurusan
              const isSmaSmk = assessmentType === 'sma_smk';
              
              // Sort questions by jurusan based on fixed order from SMA_SMK_JURUSAN
              // This ensures IPA appears first, then IPS, etc. matching the assessment flow
              const displayQuestions = isSmaSmk 
                ? [...categoryQuestions].sort((a, b) => {
                    const jA = (a as any).jurusan || '';
                    const jB = (b as any).jurusan || '';
                    
                    const idxA = SMA_SMK_JURUSAN.findIndex(j => j.id === jA);
                    const idxB = SMA_SMK_JURUSAN.findIndex(j => j.id === jB);
                    
                    // If both form valid jurusan, sort by index
                    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                    
                    // If one is invalid, put it at the end
                    if (idxA === -1) return 1;
                    if (idxB === -1) return -1;
                    
                    return 0;
                  })
                : categoryQuestions;

              let lastJurusan = '';
              let questionNumber = 0;
              
              return displayQuestions.map((question) => {
                const currentJurusan = (question as any).jurusan || '';
                const showJurusanHeader = isSmaSmk && currentJurusan && currentJurusan !== lastJurusan;
                
                if (showJurusanHeader) {
                  lastJurusan = currentJurusan;
                  questionNumber = 0; // Reset numbering for new group
                }
                
                questionNumber++;
                
                // Get jurusan label
                const jurusanInfo = SMA_SMK_JURUSAN.find(j => j.id === currentJurusan);
                
                return (
                  <React.Fragment key={question.id}>
                    {showJurusanHeader && (
                      <div className="bg-gradient-to-r from-primary-100 to-indigo-100 px-6 py-4 border-b-2 border-primary-200">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📚</span>
                          <div>
                            <h3 className="font-bold text-primary-800 text-lg">
                              {jurusanInfo?.label || currentJurusan}
                            </h3>
                            <p className="text-sm text-primary-600">
                              {jurusanInfo?.type === 'SMA' ? 'Jalur Akademik' : 'Jalur Vokasi'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="p-6 hover:bg-primary-50 transition-colors group">
                      <div className="flex items-start gap-4">
                        <span className="text-sm font-bold text-gray-400 flex-shrink-0 w-8 pt-1">
                          #{questionNumber}
                        </span>
                        <div className="flex-1">
                          {editingId === question.id ? (
                            <div className="space-y-3 animate-in fade-in duration-200">
                              <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full p-4 border border-primary-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all font-medium text-gray-800"
                                rows={3}
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSaveQuestion(question.id)}
                                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm shadow-sm"
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
                              <div className="flex gap-2 shrink-0">
                                <button
                                  onClick={() => handleEditQuestion(question.id, question.text)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-primary-600 hover:text-primary-800 font-medium text-sm px-3 py-1 bg-primary-50 rounded-lg"
                                >
                                  Edit
                                </button>
                                {assessmentType === 'sma_smk' && (
                                  <button
                                    onClick={() => handleDeleteQuestion(question.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-800 font-medium text-sm px-3 py-1 bg-red-50 rounded-lg"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              });
            })()
          )}
        </div>

        <div className="p-6 bg-white border-t border-gray-200 rounded-b-lg sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 italic">
              {isAKPD 
                ? `*Perubahan akan disimpan untuk Kelas ${selectedGradeLevel}`
                : '*Jangan lupa simpan semua perubahan ke database'
              }
            </p>
            <button
              onClick={handleSaveAll}
              disabled={loading}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl transition-all font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${loading
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-primary-600 to-primary-800 text-white hover:from-primary-700 hover:to-primary-900'
                }`}
            >
              <Save size={20} />
              {loading ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal Tambah Soal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
            <div className={`p-6 ${isSmaSmk || isAKPD ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-blue-600 to-blue-700'}`}>
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <Plus size={24} />
                Tambah Soal Baru
              </h3>
              <p className="text-white/80 text-sm mt-1">
                {isSmaSmk 
                  ? 'Tambahkan pertanyaan untuk asesmen minat SMA/SMK' 
                  : (isAKPD ? 'Tambahkan pertanyaan untuk asesmen AKPD' : `Tambahkan pertanyaan untuk asesmen ${assessmentType.toUpperCase().replace('_', ' ')}`)}
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Pilih Kategori/Jurusan */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {isSmaSmk ? 'Pilih Jurusan' : (isAKPD ? 'Pilih Bidang Layanan' : 'Pilih Kategori / Dimensi')}
                </label>
                
                {isSmaSmk && (
                    <select
                      value={selectedJurusan}
                      onChange={(e) => setSelectedJurusan(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all"
                    >
                      {getJurusanOptions().map((j) => (
                        <option key={j.id} value={j.id}>{j.label}</option>
                      ))}
                    </select>
                )}

                {isAKPD && (
                    <select
                      value={selectedAkpdCategory}
                      onChange={(e) => setSelectedAkpdCategory(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all"
                    >
                      <option value="">-- Pilih Bidang --</option>
                      {AKPD_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                )}

                {!isSmaSmk && !isAKPD && (
                    <select
                      value={selectedGenericCategory}
                      onChange={(e) => setSelectedGenericCategory(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                    >
                      {getCategories().length > 0 ? (
                          getCategories().map((c) => (
                            <option key={c.id} value={c.name}>{c.label}</option>
                          ))
                      ) : (
                          <option value="">Tidak ada kategori tersedia</option>
                      )}
                    </select>
                )}
              </div>
              
              {/* Teks Pertanyaan */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Teks Pertanyaan
                </label>
                <textarea
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="Masukkan pertanyaan baru..."
                  className={`w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 transition-all font-medium text-gray-800 ${
                      isSmaSmk || isAKPD ? 'focus:ring-green-100 focus:border-green-500' : 'focus:ring-blue-100 focus:border-blue-500'
                  }`}
                  rows={4}
                />
              </div>
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewQuestionText('');
                }}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleAddQuestion}
                disabled={!newQuestionText.trim()}
                className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  newQuestionText.trim()
                    ? (isSmaSmk || isAKPD ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-blue-600 text-white hover:bg-blue-700')
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Plus size={18} />
                Tambah Soal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
