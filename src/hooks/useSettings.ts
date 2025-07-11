import { useState, useEffect } from 'react';

interface Settings {
  cardClosingDay: number;
}

const SETTINGS_KEY = 'expense-settings';
const DEFAULT_SETTINGS: Settings = {
  cardClosingDay: 5
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  // Save to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return {
    settings,
    updateSettings
  };
}