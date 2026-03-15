const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

export const ACTIVITY_LABELS = {
  sedentary: 'Hareketsiz (masa başı iş)',
  light: 'Az Aktif (haftada 1-3 gün)',
  moderate: 'Orta Aktif (haftada 3-5 gün)',
  active: 'Aktif (haftada 6-7 gün)',
  veryActive: 'Çok Aktif (günde 2 antrenman)',
};

export function calculateBMR(gender, weight, height, age) {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  }
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

export function calculateTDEE(bmr, activityLevel) {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.55;
  return Math.round(bmr * multiplier);
}

function getGoalType(currentWeight, targetWeight) {
  const diff = currentWeight - targetWeight;
  if (diff > 2) return 'cut';
  if (diff < -2) return 'bulk';
  return 'maintain';
}

export function calculateCalorieTarget(tdee, currentWeight, targetWeight) {
  const goal = getGoalType(currentWeight, targetWeight);
  if (goal === 'cut') return Math.round(tdee - 500);
  if (goal === 'bulk') return Math.round(tdee + 300);
  return tdee;
}

export function calculateMacros(calories, weight, currentWeight, targetWeight) {
  const goal = getGoalType(currentWeight, targetWeight);

  let proteinPerKg;
  if (goal === 'cut') proteinPerKg = 2.2;
  else if (goal === 'bulk') proteinPerKg = 1.8;
  else proteinPerKg = 1.6;

  const protein = Math.round(weight * proteinPerKg);
  const fatCalories = Math.round(calories * 0.25);
  const fat = Math.round(fatCalories / 9);
  const carbCalories = calories - (protein * 4) - fatCalories;
  const carbs = Math.max(0, Math.round(carbCalories / 4));

  return { protein, carbs, fat };
}

export function getRecommendedTargets(profile) {
  const { gender, age, height, startWeight, targetWeight, activityLevel } = profile;
  if (!gender || !age || !height || !startWeight) return null;

  const bmr = calculateBMR(gender, startWeight, height, age);
  const tdee = calculateTDEE(bmr, activityLevel);
  const calories = calculateCalorieTarget(tdee, startWeight, targetWeight);
  const macros = calculateMacros(calories, startWeight, startWeight, targetWeight);

  return {
    bmr: Math.round(bmr),
    tdee,
    calories,
    ...macros,
  };
}

export function getGoalLabel(currentWeight, targetWeight) {
  const goal = getGoalType(currentWeight, targetWeight);
  if (goal === 'cut') return 'Kilo Verme (-500 kcal)';
  if (goal === 'bulk') return 'Kilo Alma (+300 kcal)';
  return 'Koruma';
}
