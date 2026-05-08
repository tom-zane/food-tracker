import React, { createContext, useState, useEffect } from 'react';
import { getData, saveData, STORAGE_KEYS } from '../utils/storage';
import { calculateTDEE } from '../utils/tdeeCalculator';

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [profile, setProfile] = useState({
    weight: 75,
    height: 175,
    age: 30,
    gender: 'male',
    activityLevel: 'moderate',
    fontFamily: 'System',
    aiProvider: 'gemini',
    useMarcoTrackAI: true,
    aiKeys: {
      gemini: '',
    },
    tdee: 2200 
  });

  useEffect(() => {
    const loadSettings = async () => {
      const savedProfile = await getData(STORAGE_KEYS.USER_PROFILE) || {}; // Fallback to empty object
      
      const mergedProfile = { ...profile, ...savedProfile };
      
      if (!mergedProfile.aiKeys) {
        mergedProfile.aiKeys = { gemini: mergedProfile.apiKey || '' };
      }

      // 🚨 FIX: Force numbers to prevent NaN before calculating
      const safeCalcProfile = {
        ...mergedProfile,
        weight: Number(mergedProfile.weight) || 0,
        height: Number(mergedProfile.height) || 0,
        age: Number(mergedProfile.age) || 0,
      };

      // Always calculate on load, even if storage was empty
      mergedProfile.tdee = calculateTDEE(safeCalcProfile) || 0;
      
      setProfile(mergedProfile);
    };
    
    loadSettings();
  }, []);

  const updateProfile = async (newUpdates) => {
    const updated = { ...profile, ...newUpdates };
    
    // 🚨 FIX: Ensure we never pass NaN to the calculator while typing
    const safeCalcProfile = {
      ...updated,
      weight: Number(updated.weight) || 0,
      height: Number(updated.height) || 0,
      age: Number(updated.age) || 0,
    };

    updated.tdee = calculateTDEE(safeCalcProfile) || 0; 
    
    setProfile(updated);
    await saveData(STORAGE_KEYS.USER_PROFILE, updated);
  };

  return (
    <SettingsContext.Provider value={{ profile, updateProfile }}>
      {children}
    </SettingsContext.Provider>
  );
};