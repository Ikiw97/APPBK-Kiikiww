import React, { useState, useEffect } from 'react';
import { Check, X, ArrowLeft, Edit, Settings, List } from 'lucide-react';
import { FeatureSettings, getFeatureSettings, saveFeatureSettings, DEFAULT_SETTINGS } from '@/lib/featureSettings';
import { notifySettingsChanged } from '@/lib/useFeatureSettings';
import QuestionEditor from './QuestionEditor';
import GameQuestionEditor from './GameQuestionEditor';
import ExerciseQuestionEditor from './ExerciseQuestionEditor';

interface AdminSettingsProps {
  onBack?: () => void;
}

export default function AdminSettings({ onBack }: AdminSettingsProps) {
  const [settings, setSettings] = useState<FeatureSettings>(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingAssessment, setEditingAssessment] = useState<string | null>(null);
  const [editingGame, setEditingGame] = useState<'kahoot' | 'vocabulary' | null>(null);
  const [editingExercise, setEditingExercise] = useState<'psikotest' | 'analogi' | 'tiu' | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        console.log('📥 AdminSettings: Loading feature settings...');
        const loadedSettings = await getFeatureSettings();
        console.log('✅ AdminSettings: Settings loaded:', loadedSettings);
        setSettings(loadedSettings);
      } catch (error) {
        console.error('❌ AdminSettings: Error loading settings:', error);
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [editingAssessment, editingGame]); // Reload when returning from edit

  const handleToggle = (category: keyof FeatureSettings, feature: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [feature]: !prev[category][feature as keyof typeof prev[keyof typeof prev]],
      },
    }));
    setHasChanges(true);
    setSaved(false);
  };

  const handleTextChange = (category: keyof FeatureSettings, field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
    setHasChanges(true);
    setSaved(false);
  };

  const handleSave = async () => {
    console.log('💾 Saving feature settings:', settings);
    try {
      const success = await saveFeatureSettings(settings);
      if (success) {
        notifySettingsChanged();
        console.log('✅ Settings saved and notification sent');
        setHasChanges(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        console.error('❌ Failed to save settings');
        alert('❌ Gagal menyimpan pengaturan. Coba lagi.');
      }
    } catch (error) {
      console.error('❌ Error saving settings:', error);
      alert('❌ Terjadi kesalahan saat menyimpan pengaturan');
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="px-6 md:px-8 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat pengaturan...</p>
        </div>
      </div>
    );
  }

  // If editing questions, show the editor
  if (editingAssessment) {
    return (
      <QuestionEditor
        onBack={() => setEditingAssessment(null)}
        assessmentType={editingAssessment}
      />
    );
  }

  // If editing game questions
  if (editingGame) {
    return (
      <GameQuestionEditor
        onBack={() => setEditingGame(null)}
        fixedGameType={editingGame}
      />
    );
  }

  // If editing exercise questions
  if (editingExercise) {
    return (
      <ExerciseQuestionEditor
        onBack={() => setEditingExercise(null)}
        exerciseType={editingExercise}
      />
    );
  }

  // Mapping for Question Editing Keys
  const questionTypeMap: Record<string, string> = {
    akpd: 'akpd',
    aum: 'aum',
    personality: 'personality_career',
    emotional_intelligence: 'kecerdasan_majemuk',
    sdq: 'sdq',
    mbti: 'mbti',
    big_five: 'big_five',
    grit: 'grit',
    holland_code: 'personality_career',
    riasec: 'riasec',
    bullying: 'bullying',
  };

  const assessmentsList = [
    { key: 'akpd', label: 'AKPD', desc: 'Angket Kebutuhan Peserta Didik', mapKey: 'akpd' },
    { key: 'aum', label: 'AUM', desc: 'Alat Ungkap Masalah', mapKey: 'aum' },
    { key: 'personality_career', label: 'Minat Karir & Kepribadian', desc: 'Identifikasi kepribadian dan karir (Holland/RIASEC)', mapKey: 'personality' },
    { key: 'riasec', label: 'Asesmen Minat Karir RIASEC', desc: 'Identifikasi minat karir berdasarkan 6 tipe kepribadian Holland (RIASEC)', mapKey: 'riasec' },
    { key: 'emotional_intelligence', label: 'Kecerdasan Emosi', desc: 'Evaluasi Kecerdasan Emosional', mapKey: 'emotional_intelligence' },
    { key: 'kecerdasan_majemuk', label: 'Kecerdasan Majemuk', desc: 'Identifikasi berbagai jenis kecerdasan', mapKey: 'kecerdasan_majemuk' },
    { key: 'gaya_belajar', label: 'Gaya Belajar', desc: 'Visual, Auditorial, Kinestetik', mapKey: 'gaya_belajar' },
    { key: 'sma_smk', label: 'Minat SMA/SMK', desc: 'Preferensi pendidikan lanjutan', mapKey: 'sma_smk' },
    { key: 'introvert_extrovert', label: 'Introvert & Extrovert', desc: 'Orientasi energi kepribadian', mapKey: 'introvert_extrovert' },
    { key: 'stress_akademik', label: 'Stres Akademik', desc: 'Tingkat stres dalam belajar', mapKey: 'stress_akademik' },
    { key: 'temperament', label: 'Empat Temperamen', desc: 'Sanguinis, Koleris, Melankolis, Plegmatis', mapKey: 'temperament' },
    { key: 'self_awareness', label: 'Kenali Dirimu', desc: 'Self Awareness dan refleksi diri', mapKey: 'self_awareness' },
    { key: 'sdq', label: 'SDQ', desc: 'Strength and Difficulties Questionnaire', mapKey: 'sdq' },
    { key: 'mbti', label: 'MBTI', desc: 'Myers-Briggs Type Indicator', mapKey: 'mbti' },
    { key: 'big_five', label: 'Big Five', desc: 'Big Five Personality Traits', mapKey: 'big_five' },
    { key: 'grit', label: 'Angket Pengukuran Ketekunan dan Kegigihan', desc: 'Ketekunan dan Ketahanan Mental', mapKey: 'grit' },
    { key: 'rmib', label: 'RMIB', desc: 'Rothwell Miller Interest Blank', mapKey: 'rmib' },
    { key: 'sociometry', label: 'Sosiometri', desc: 'Pemetaan hubungan sosial siswa', mapKey: 'sociometry' },
    { key: 'bullying', label: 'Asesmen Pemahaman & Sikap Terhadap Bullying', desc: 'Evaluasi pemahaman dan sikap siswa terhadap bullying', mapKey: 'bullying' },
  ];

  return (
    <div className="px-6 md:px-8 py-8 w-full">
      {/* Header */}
      <div className="mb-8">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Kembali</span>
          </button>
        )}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pengaturan Aplikasi</h1>
        <p className="text-gray-600">Kelola fitur dan konten asesmen</p>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-in fade-in slide-in-from-top-2">
          <p className="text-green-800 text-sm font-medium flex items-center gap-2">
            <Check size={18} />
            Pengaturan berhasil disimpan
          </p>
        </div>
      )}

      {/* Assessment List Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <List className="text-primary-600" size={24} />
          <h2 className="text-xl font-bold text-gray-900">Daftar Asesmen</h2>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 shadow-sm overflow-hidden">
          {assessmentsList.map((item) => (
            <div key={item.key} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-900">{item.label}</h3>
                  {settings.assessments[item.mapKey as keyof typeof settings.assessments] ? (
                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">Aktif</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">Nonaktif</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEditingAssessment(item.mapKey)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                >
                  <Edit size={16} />
                  Edit Soal
                </button>

                <label className="flex items-center cursor-pointer relative">
                  <span className="sr-only">Toggle {item.label}</span>
                  <input
                    type="checkbox"
                    checked={settings.assessments[item.mapKey as keyof typeof settings.assessments] || false}
                    onChange={() => handleToggle('assessments', item.mapKey as any)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Other Settings Sections (Compact) */}
      <div className="space-y-6">
        {/* Exercise Section */}
        <SettingsSection title="📝 Latihan Test" color="green">
          <FeatureItem
            label="Psikotest Logika"
            description="Latih kemampuan logika, numerik, dan verbal"
            enabled={settings.exercises.psikotest}
            onChange={() => handleToggle('exercises', 'psikotest')}
            onEdit={() => setEditingExercise('psikotest')}
          />
          <FeatureItem
            label="Test Analogi"
            description="Uji kemampuan menghubungkan kata dan konsep"
            enabled={settings.exercises.analogi}
            onChange={() => handleToggle('exercises', 'analogi')}
            onEdit={() => setEditingExercise('analogi')}
          />
          <FeatureItem
            label="Tes Intelegensi Umum"
            description="Tes komprehensif verbal, numerik, figural"
            enabled={settings.exercises.tiu}
            onChange={() => handleToggle('exercises', 'tiu')}
            onEdit={() => setEditingExercise('tiu')}
          />
        </SettingsSection>

        {/* Game Section */}
        <SettingsSection title="🎮 Game Edukasi" color="purple">
          <FeatureItem
            label="Vocabulary"
            description="Permainan kosakata BK"
            enabled={settings.games.vocabulary}
            onChange={() => handleToggle('games', 'vocabulary')}
            onEdit={() => setEditingGame('vocabulary')}
          />
          <FeatureItem
            label="Puzzle"
            description="Permainan puzzle logika"
            enabled={settings.games.puzzle}
            onChange={() => handleToggle('games', 'puzzle')}
          // Puzzle doesn't have an editor provided, so maybe disable or remove edit button?
          // The previous implementation pointed to the generic editor. 
          // I'll leave it pointed to 'kahoot' as a fallback or disable it?
          // User request was specifically about separate sessions for VOCAB and KAHOOT.
          // I'll disable edit for puzzle to avoid confusion as requested "separate sessions".
          // onEdit={() => setShowGameEditor(true)} 
          />
          <FeatureItem
            label="Kahoot"
            description="Quiz cepat dan menyenangkan"
            enabled={settings.games.kahoot}
            onChange={() => handleToggle('games', 'kahoot')}
            onEdit={() => setEditingGame('kahoot')}
          />
        </SettingsSection>

        {/* Counseling Services Section */}
        <SettingsSection title="💬 Layanan Konseling" color="blue">
          <FeatureItem
            label="Chat Konseling"
            description="Tombol chat mengambang untuk siswa berkonsultasi dengan guru BK"
            enabled={settings.services?.counseling_chat ?? true}
            onChange={() => handleToggle('services', 'counseling_chat')}
          />
        </SettingsSection>
      </div>

      {/* Action Buttons */}
      <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm p-4 border-t border-gray-200 mt-8 -mx-6 md:-mx-8 px-6 md:px-8 flex items-center justify-between">
        <p className="text-sm text-gray-500 hidden sm:block">
          {hasChanges ? 'Ada perubahan yang belum disimpan.' : 'Semua perubahan tersimpan.'}
        </p>
        <div className="flex gap-4 w-full sm:w-auto">
          <button
            onClick={handleReset}
            className="flex-1 sm:flex-none px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <X size={18} />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="flex-1 sm:flex-none px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
          >
            <Check size={18} />
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

interface SettingsSectionProps {
  title: string;
  color: 'blue' | 'green' | 'purple';
  children: React.ReactNode;
}

function SettingsSection({ title, color, children }: SettingsSectionProps) {
  // We keep explicit colors here for sections to distinguish them visually regardless of theme
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50/50',
    green: 'border-green-200 bg-green-50/50',
    purple: 'border-purple-200 bg-purple-50/50',
  };

  const titleClasses = {
    blue: 'text-blue-700',
    green: 'text-green-700',
    purple: 'text-purple-700',
  };

  return (
    <div className={`border rounded-xl p-6 ${colorClasses[color]}`}>
      <h2 className={`text-lg font-semibold ${titleClasses[color]} mb-4 flex items-center gap-2`}>
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}

interface FeatureItemProps {
  label: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
  onEdit?: () => void;
}

function FeatureItem({ label, description, enabled, onChange, onEdit }: FeatureItemProps) {
  return (
    <div className="flex items-start justify-between p-4 bg-white rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all h-full">
      <div className="flex-1 mr-4">
        <label className="block text-sm font-bold text-gray-900 cursor-pointer">
          {label}
        </label>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        {onEdit && (
          <button
            onClick={onEdit}
            className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Edit Soal"
          >
            <Edit size={16} />
          </button>
        )}
        <label className="flex items-center cursor-pointer relative shrink-0">
          <input
            type="checkbox"
            checked={enabled}
            onChange={onChange}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
        </label>
      </div>
    </div>
  );
}
