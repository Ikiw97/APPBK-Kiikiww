import React, { useState, useEffect } from 'react';
import { Settings, Check, Save, Loader2 } from 'lucide-react';
import { FeatureSettings, getFeatureSettings, saveFeatureSettings, DEFAULT_SETTINGS } from '@/lib/featureSettings';
import { notifySettingsChanged } from '@/lib/useFeatureSettings';

export default function SystemSettings() {
  const [settings, setSettings] = useState<FeatureSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const loadedSettings = await getFeatureSettings();
        setSettings(loadedSettings);
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleTextChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      system: {
        ...prev.system,
        [field]: value,
      },
    }));
    setHasChanges(true);
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await saveFeatureSettings(settings);
      if (success) {
        notifySettingsChanged();
        setHasChanges(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center bg-gray-50 rounded-lg animate-pulse">Memuat pengaturan...</div>;
  }

  return (
    <div className="card p-8 mb-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-blue-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <Settings size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Konfigurasi Sistem</h2>
        </div>
        
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span className="font-medium">Simpan Perubahan</span>
          </button>
        )}
        
        {saved && !hasChanges && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200 animate-in fade-in">
            <Check size={16} />
            <span className="font-medium">Tersimpan</span>
          </div>
        )}
      </div>

      <div className="space-y-8">
        {/* School Name */}
        <div>
          <label className="block text-gray-700 font-bold mb-2">
            Nama Sekolah / Instansi
          </label>
          <input
            type="text"
            value={settings.system.schoolName}
            onChange={(e) => handleTextChange('schoolName', e.target.value)}
            placeholder="Contoh: SMP Negeri 1 Jakarta"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
          />
          <p className="text-sm text-gray-500 mt-2">Nama ini akan ditampilkan di header dashboard dan laporan.</p>
        </div>

        {/* Theme Settings */}
        <div className="pt-6 border-t border-gray-100">
          <label className="block text-gray-700 font-bold mb-4">
            Tema Warna
          </label>
          <div className="flex flex-wrap gap-4">
            {[
              { id: 'blue', label: 'Ocean Blue', color: 'bg-blue-600' },
              { id: 'purple', label: 'Royal Purple', color: 'bg-purple-600' },
              { id: 'green', label: 'Forest Green', color: 'bg-green-600' },
              { id: 'red', label: 'Rose Red', color: 'bg-red-600' },
              { id: 'orange', label: 'Sunset Orange', color: 'bg-orange-600' },
              { id: 'teal', label: 'Teal Teal', color: 'bg-teal-600' },
              { id: 'pink', label: 'Hot Pink', color: 'bg-pink-600' },
              { id: 'indigo', label: 'Indigo Blue', color: 'bg-indigo-600' },
              { id: 'cyan', label: 'Cyan Sky', color: 'bg-cyan-600' },
              { id: 'slate', label: 'Slate Gray', color: 'bg-slate-600' },
            ].map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleTextChange('themeColor', theme.id)} 
                className={`relative group flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all ${
                  settings.system.themeColor === theme.id
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-transparent hover:bg-gray-50'
                }`}
              >
                <div className={`w-12 h-12 rounded-full ${theme.color} shadow-sm group-hover:scale-110 transition-transform flex items-center justify-center`}>
                  {settings.system.themeColor === theme.id && (
                    <Check className="text-white" size={20} />
                  )}
                </div>
                <span className={`text-xs font-medium ${
                  settings.system.themeColor === theme.id ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {theme.label}
                </span>
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-3">Pilih warna dominan untuk aplikasi.</p>
        </div>
      </div>
    </div>
  );
}
