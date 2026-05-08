import AsyncStorage from '@react-native-async-storage/async-storage';

// ---------------------------------------------------------------------------
// STORAGE KEYS
// Centralized list of all storage keys used in the app.
// Using this object prevents spelling mistakes when saving/loading data.
// Note: The '@' prefix is a common React Native convention to easily identify local storage keys.
// ---------------------------------------------------------------------------
export const STORAGE_KEYS = {
  USER_PROFILE: '@user_profile',
  FOOD_LOGS: '@food_logs',
  WEIGHT_HISTORY: '@weight_history',
  THEME_PREFERENCE: '@theme_pref',
  TARGET_WEIGHT: '@target_weight', // Added this so your WeightContext works!
  USER_HEIGHT: '@user_height',     // Added this so your BMI calculation works!
};

// ---------------------------------------------------------------------------
// SAVE DATA FUNCTION
// Takes a key (from STORAGE_KEYS) and a value (array, object, number, etc.)
// ---------------------------------------------------------------------------
export const saveData = async (key, value) => {
  // SAFEGUARD: This checks if you accidentally passed an undefined key.
  // This is what prevents the "Using undefined type for key" error you saw earlier.
  if (!key) {
    console.error("🚨 AsyncStorage Error: Tried to save data with an undefined key!");
    return;
  }

  try {
    // AsyncStorage can ONLY store strings. 
    // JSON.stringify converts complex data (like your history arrays or objects) into a text string so it can be saved.
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error('Error saving data', e);
  }
};

// ---------------------------------------------------------------------------
// GET DATA FUNCTION
// Retrieves data using a key. Returns null if nothing has been saved yet.
// ---------------------------------------------------------------------------
export const getData = async (key) => {
  // SAFEGUARD: Prevents looking up data with a missing/undefined key.
  if (!key) {
    console.error("🚨 AsyncStorage Error: Tried to get data with an undefined key!");
    return null;
  }

  try {
    const jsonValue = await AsyncStorage.getItem(key);
    
    // If data exists, JSON.parse converts the string back into its original form (array/object).
    // If it doesn't exist (like on first app launch), we safely return null.
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Error reading data', e);
    return null;
  }
};