import { useState, useEffect, useCallback } from 'react';
import { loadData, saveData, getToday } from '../utils/storage';

export function useAppData() {
  const [data, setData] = useState(() => loadData());

  useEffect(() => {
    saveData(data);
  }, [data]);

  const updateData = useCallback((updater) => {
    setData(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      return next;
    });
  }, []);

  const addMeal = useCallback((meal) => {
    const today = getToday();
    setData(prev => {
      const dayMeals = prev.mealLog[today] || [];
      return {
        ...prev,
        mealLog: {
          ...prev.mealLog,
          [today]: [...dayMeals, { ...meal, id: Date.now(), timestamp: new Date().toISOString() }],
        },
      };
    });
  }, []);

  const removeMeal = useCallback((mealId) => {
    const today = getToday();
    setData(prev => ({
      ...prev,
      mealLog: {
        ...prev.mealLog,
        [today]: (prev.mealLog[today] || []).filter(m => m.id !== mealId),
      },
    }));
  }, []);

  const addWater = useCallback((ml = 250) => {
    const today = getToday();
    setData(prev => ({
      ...prev,
      waterLog: {
        ...prev.waterLog,
        [today]: (prev.waterLog[today] || 0) + ml,
      },
    }));
  }, []);

  const logWeight = useCallback((weight) => {
    const today = getToday();
    setData(prev => {
      const existing = prev.weightLog.filter(w => w.date !== today);
      return {
        ...prev,
        weightLog: [...existing, { date: today, weight, timestamp: new Date().toISOString() }],
      };
    });
  }, []);

  const completeExercise = useCallback((exerciseId) => {
    const today = getToday();
    setData(prev => {
      const dayWorkout = prev.workoutLog[today] || { completed: false, exercises: [] };
      const exercises = dayWorkout.exercises.includes(exerciseId)
        ? dayWorkout.exercises
        : [...dayWorkout.exercises, exerciseId];
      return {
        ...prev,
        workoutLog: {
          ...prev.workoutLog,
          [today]: { ...dayWorkout, exercises, completed: dayWorkout.completed },
        },
      };
    });
  }, []);

  const completeWorkout = useCallback(() => {
    const today = getToday();
    setData(prev => {
      const dayWorkout = prev.workoutLog[today] || { completed: false, exercises: [] };
      return {
        ...prev,
        workoutLog: {
          ...prev.workoutLog,
          [today]: { ...dayWorkout, completed: true },
        },
      };
    });
  }, []);

  const addPenalty = useCallback((reason, punishment) => {
    setData(prev => ({
      ...prev,
      penalties: [...prev.penalties, {
        id: Date.now(),
        date: new Date().toISOString(),
        reason,
        punishment,
        resolved: false,
      }],
    }));
  }, []);

  const resolvePenalty = useCallback((penaltyId) => {
    setData(prev => ({
      ...prev,
      penalties: prev.penalties.map(p =>
        p.id === penaltyId ? { ...p, resolved: true } : p
      ),
    }));
  }, []);

  const logSleep = useCallback((sleepTime, wakeTime) => {
    const today = getToday();
    setData(prev => ({
      ...prev,
      sleepLog: {
        ...prev.sleepLog,
        [today]: { sleepTime, wakeTime, timestamp: new Date().toISOString() },
      },
    }));
  }, []);

  const updateSettings = useCallback((newSettings) => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
    }));
  }, []);

  return {
    data,
    updateData,
    addMeal,
    removeMeal,
    addWater,
    logWeight,
    completeExercise,
    completeWorkout,
    addPenalty,
    resolvePenalty,
    logSleep,
    updateSettings,
  };
}
