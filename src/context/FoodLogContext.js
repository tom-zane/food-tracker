import React, { createContext, useState, useEffect } from 'react';
import { getData, saveData, STORAGE_KEYS } from '../utils/storage';

export const FoodLogContext = createContext();

export const FoodLogProvider = ({ children }) => {
  const [logs, setLogs] = useState({});

  useEffect(() => {
    const loadLogs = async () => {
      const savedLogs = await getData(STORAGE_KEYS.FOOD_LOGS);
      if (savedLogs) setLogs(savedLogs);
    };
    loadLogs();
  }, []);

  const addFoodLog = async (dateKey, foodItems) => {
    const newLogs = { ...logs };
    if (!newLogs[dateKey]) {
      newLogs[dateKey] = [];
    }
    
    const timestampedItems = foodItems.map(item => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    newLogs[dateKey] = [...newLogs[dateKey], ...timestampedItems];
    setLogs(newLogs);
    await saveData(STORAGE_KEYS.FOOD_LOGS, newLogs);
  };

  const removeFoodItem = async (dateKey, id) => {
    const newLogs = { ...logs };
    newLogs[dateKey] = newLogs[dateKey].filter(item => item.id !== id);
    setLogs(newLogs);
    await saveData(STORAGE_KEYS.FOOD_LOGS, newLogs);
  };

  const getDayTotals = (dateKey) => {
    const dayLogs = logs[dateKey] || [];
    return dayLogs.reduce((acc, curr) => ({
      calories: acc.calories + curr.calories,
      protein: acc.protein + curr.protein,
      carbs: acc.carbs + curr.carbs,
      fats: acc.fats + curr.fats,
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
  };

  return (
    <FoodLogContext.Provider value={{ logs, addFoodLog, removeFoodItem, getDayTotals, setLogs }}>
      {children}
    </FoodLogContext.Provider>
  );
};
