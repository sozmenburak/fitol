import { useState, useEffect, useCallback, useRef } from 'react';
import { playAlarmSound, stopAlarm } from '../utils/alarmSystem';

export function useAlarmScheduler(settings, addPenalty) {
  const [activeAlarm, setActiveAlarm] = useState(null);
  const [dismissedAlarms, setDismissedAlarms] = useState(new Set());
  const checkIntervalRef = useRef(null);

  const getScheduledAlarms = useCallback(() => {
    if (!settings) return [];
    const alarms = [];

    alarms.push({
      id: 'wakeup',
      time: settings.wakeUpTime,
      label: '⏰ UYAN! Günaydın aslan!',
      type: 'wakeup',
      penalty: 'missed_wakeup',
    });

    if (settings.mealTimes) {
      Object.entries(settings.mealTimes).forEach(([key, time]) => {
        const labels = {
          breakfast: '🍳 KAHVALTI VAKTİ!',
          snack1: '🥜 ARA ÖĞÜN 1',
          lunch: '🍗 ÖĞLE YEMEĞİ VAKTİ!',
          snack2: '🍌 ARA ÖĞÜN 2',
          dinner: '🥗 AKŞAM YEMEĞİ VAKTİ!',
          snack3: '🥛 GECE ATIŞTIIRMALIĞI',
        };
        alarms.push({
          id: `meal_${key}`,
          time,
          label: labels[key] || `🍽️ ${key.toUpperCase()}`,
          type: 'meal',
          penalty: 'missed_meal',
        });
      });
    }

    alarms.push({
      id: 'workout',
      time: settings.workoutTime,
      label: '💪 ANTRENMAN VAKTİ! Haydi kaldır!',
      type: 'workout',
      penalty: 'missed_workout',
    });

    const dayOfWeek = new Date().getDay();
    if (dayOfWeek === 2 || dayOfWeek === 4) {
      alarms.push({
        id: 'swim_prep',
        time: '09:00',
        label: '🏊 YÜZME HAZIRLIĞI! 30dk sonra havuzda olmalısın!',
        type: 'workout',
        penalty: null,
      });
      alarms.push({
        id: 'swim_go',
        time: '09:20',
        label: '🏊 YOLA ÇIK! 10dk sonra yüzme başlıyor!',
        type: 'workout',
        penalty: 'missed_workout',
      });
    }

    alarms.push({
      id: 'water_1',
      time: '09:00',
      label: '💧 SU İÇ! (500ml)',
      type: 'default',
      penalty: 'missed_water',
    });
    alarms.push({
      id: 'water_2',
      time: '11:00',
      label: '💧 SU İÇ! (500ml)',
      type: 'default',
      penalty: 'missed_water',
    });
    alarms.push({
      id: 'water_3',
      time: '14:00',
      label: '💧 SU İÇ! (500ml)',
      type: 'default',
      penalty: 'missed_water',
    });
    alarms.push({
      id: 'water_4',
      time: '17:00',
      label: '💧 SU İÇ! (500ml)',
      type: 'default',
      penalty: 'missed_water',
    });
    alarms.push({
      id: 'water_5',
      time: '20:00',
      label: '💧 SU İÇ! (500ml)',
      type: 'default',
      penalty: 'missed_water',
    });

    const sleepWarning = subtractMinutes(settings.sleepTime, 30);
    alarms.push({
      id: 'sleep_warning',
      time: sleepWarning,
      label: '🌙 30 dakika sonra yatma vakti! Ekranları kapat!',
      type: 'sleep',
      penalty: null,
    });

    alarms.push({
      id: 'sleep',
      time: settings.sleepTime,
      label: '😴 YATMA VAKTİ! HEMEN YAT! Yarın seni çok iş bekliyor!',
      type: 'sleep',
      penalty: 'late_sleep',
    });

    return alarms;
  }, [settings]);

  const dismissAlarm = useCallback(() => {
    if (activeAlarm) {
      setDismissedAlarms(prev => new Set([...prev, activeAlarm.id]));
      setActiveAlarm(null);
      stopAlarm();
    }
  }, [activeAlarm]);

  const snoozeAlarm = useCallback(() => {
    if (activeAlarm) {
      setActiveAlarm(null);
      stopAlarm();
      setTimeout(() => {
        setActiveAlarm(activeAlarm);
        if (settings.alarmSound) {
          playAlarmSound(activeAlarm.type, settings.alarmVolume / 100);
        }
      }, 5 * 60 * 1000);
    }
  }, [activeAlarm, settings]);

  useEffect(() => {
    const today = new Date().toDateString();
    setDismissedAlarms(prev => {
      const stored = localStorage.getItem('dismissed_alarms_date');
      if (stored !== today) {
        localStorage.setItem('dismissed_alarms_date', today);
        return new Set();
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    function checkAlarms() {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const alarms = getScheduledAlarms();

      for (const alarm of alarms) {
        if (alarm.time === currentTime && !dismissedAlarms.has(alarm.id) && (!activeAlarm || activeAlarm.id !== alarm.id)) {
          setActiveAlarm(alarm);
          if (settings.alarmSound) {
            playAlarmSound(alarm.type, settings.alarmVolume / 100);
          }
          break;
        }
      }
    }

    checkIntervalRef.current = setInterval(checkAlarms, 10000);
    checkAlarms();

    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [getScheduledAlarms, dismissedAlarms, activeAlarm, settings]);

  return {
    activeAlarm,
    dismissAlarm,
    snoozeAlarm,
    getScheduledAlarms,
    dismissedAlarms,
  };
}

function subtractMinutes(timeStr, mins) {
  const [h, m] = timeStr.split(':').map(Number);
  const date = new Date(2000, 0, 1, h, m - mins);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}
