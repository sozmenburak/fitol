const STORAGE_KEY = 'gobeksiz_data';

const defaultData = {
  profile: {
    name: 'Burak',
    height: 193,
    startWeight: 93,
    targetWeight: 82,
    startDate: new Date().toISOString().split('T')[0],
  },
  weightLog: [],
  mealLog: {},
  waterLog: {},
  workoutLog: {},
  sleepLog: {},
  penalties: [],
  settings: {
    wakeUpTime: '07:00',
    sleepTime: '23:00',
    mealTimes: {
      breakfast: '08:00',
      snack1: '10:30',
      lunch: '12:30',
      snack2: '15:30',
      dinner: '18:30',
      snack3: '20:30',
    },
    workoutTime: '09:00',
    alarmSound: true,
    alarmVolume: 100,
  },
  streak: {
    current: 0,
    best: 0,
    lastDate: null,
  },
};

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultData };
    const parsed = JSON.parse(raw);
    return { ...defaultData, ...parsed };
  } catch {
    return { ...defaultData };
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getToday() {
  return new Date().toISOString().split('T')[0];
}

export function getDayMeals(data, date) {
  return data.mealLog[date] || [];
}

export function getDayWater(data, date) {
  return data.waterLog[date] || 0;
}

export function getDayWorkout(data, date) {
  return data.workoutLog[date] || { completed: false, exercises: [] };
}

export function addPenalty(data, reason) {
  const penalty = {
    id: Date.now(),
    date: new Date().toISOString(),
    reason,
    resolved: false,
    punishment: getPunishment(reason),
  };
  return { ...data, penalties: [...data.penalties, penalty] };
}

function getPunishment(reason) {
  const punishments = {
    missed_meal: '50 burpee cezası!',
    missed_workout: 'Yarın antrenman 2 kat! + 100 şınav',
    late_sleep: 'Yarın 30 dakika erken uyanma + 200 mekik',
    missed_water: '1 litre ekstra su iç + 50 squat',
    junk_food: '30 dakika ekstra kardiyo + yarın kalori -300',
    missed_wakeup: '100 jumping jack + soğuk duş',
  };
  return punishments[reason] || '50 burpee + 50 şınav cezası!';
}
