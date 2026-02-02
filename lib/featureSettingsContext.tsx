import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FeatureSettings, getFeatureSettings, DEFAULT_SETTINGS } from './featureSettings';

interface FeatureSettingsContextType {
  settings: FeatureSettings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const FeatureSettingsContext = createContext<FeatureSettingsContextType>({
  settings: null,
  loading: true,
  refreshSettings: async () => {},
});

export const useFeatureSettingsContext = () => useContext(FeatureSettingsContext);

export const FeatureSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<FeatureSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    try {
      // Don't set loading to true here to avoid flickering if re-fetching
      const loaded = await getFeatureSettings();
      setSettings(loaded);
      console.log('🎯 FeatureSettingsProvider loaded:', loaded);
    } catch (error) {
      console.error('❌ Error loading settings in FeatureSettingsProvider:', error);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial load
    loadSettings();

    // Listen for settings changes from AdminSettings
    const handleSettingsChange = () => {
      console.log('🔄 Settings change detected, reloading...');
      loadSettings();
    };

    // Listen for custom settings change event
    window.addEventListener('settingsChanged', handleSettingsChange);
    // Also listen for storage changes (from other tabs)
    window.addEventListener('storage', handleSettingsChange);

    return () => {
      window.removeEventListener('settingsChanged', handleSettingsChange);
      window.removeEventListener('storage', handleSettingsChange);
    };
  }, [loadSettings]);

  return (
    <FeatureSettingsContext.Provider value={{ settings, loading, refreshSettings: loadSettings }}>
      {children}
    </FeatureSettingsContext.Provider>
  );
};
