import React, { createContext, useState, useEffect } from 'react';
import { getData, saveData, STORAGE_KEYS } from '../utils/storage';

export const WeightContext = createContext();

export const WeightProvider = ({ children }) => {
  const [history, setHistory] = useState([]);
  const [targetWeight, setTargetWeight] = useState(70);
  const [height, setHeight] = useState(null); // Height in cm

  useEffect(() => {
    const loadData = async () => {
      const savedHistory = await getData(STORAGE_KEYS.WEIGHT_HISTORY);
      const savedTarget = await getData(STORAGE_KEYS.TARGET_WEIGHT);
      const savedHeight = await getData(STORAGE_KEYS.USER_HEIGHT);
      
      if (savedHistory) setHistory(savedHistory);
      if (savedTarget) setTargetWeight(savedTarget);
      if (savedHeight) setHeight(savedHeight);
    };
    loadData();
  }, []);

  const addWeightEntry = async (weight) => {
    const entry = { id: Date.now().toString(), weight: parseFloat(weight), date: new Date().toISOString() };
    const newHistory = [entry, ...history];
    setHistory(newHistory);
    await saveData(STORAGE_KEYS.WEIGHT_HISTORY, newHistory);
  };

  const editWeightEntry = async (id, newWeight) => {
    const newHistory = history.map(item => 
      item.id === id ? { ...item, weight: parseFloat(newWeight) } : item
    );
    setHistory(newHistory);
    await saveData(STORAGE_KEYS.WEIGHT_HISTORY, newHistory);
  };

  const setTarget = async (val) => {
    const parsedVal = parseFloat(val);
    setTargetWeight(parsedVal);
    await saveData(STORAGE_KEYS.TARGET_WEIGHT, parsedVal);
  };

  const updateHeight = async (val) => {
    const parsedVal = parseFloat(val);
    setHeight(parsedVal);
    await saveData(STORAGE_KEYS.USER_HEIGHT, parsedVal);
  };

  return (
    <WeightContext.Provider value={{ 
      history, addWeightEntry, editWeightEntry, setHistory,
      targetWeight, setTarget, 
      height, updateHeight 
    }}>
      {children}
    </WeightContext.Provider>
  );
};