import { useFeatureSettingsContext } from './featureSettingsContext';

// Use window as event target for settings changes
export function notifySettingsChanged() {
  if (typeof window !== 'undefined') {
    console.log('📢 Broadcasting settingsChanged event');
    window.dispatchEvent(new CustomEvent('settingsChanged'));
  }
}

export function useFeatureSettings() {
  return useFeatureSettingsContext();
}
