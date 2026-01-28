import { useState, useEffect, useCallback } from 'react';
import { FeatureSettings, getFeatureSettings, DEFAULT_SETTINGS } from './featureSettings';

// Use window as event target for settings changes
export function notifySettingsChanged() {
  if (typeof window !== 'undefined') {
    console.log('📢 Broadcasting settingsChanged event');
    window.dispatchEvent(new CustomEvent('settingsChanged'));
  }
}

export function useFeatureSettings() {
  const [settings, setSettings] = useState<FeatureSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    try {
      const loaded = await getFeatureSettings();
      setSettings(loaded);
      console.log('🎯 useFeatureSettings loaded:', loaded);
    } catch (error) {
      console.error('❌ Error loading settings in useFeatureSettings:', error);
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

  return { settings, loading };
}
