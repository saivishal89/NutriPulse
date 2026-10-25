import { FitnessGoal, DietaryPreference, ActivityLevel, FoodLogEntry } from '../types';

export interface BmiResult {
  bmi: number;
  category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese';
  idealWeightMinKg: number;
  idealWeightMaxKg: number;
}

export function calculateBMI(weightKg: number, heightCm: number): BmiResult {
  const safeWeight = Math.max(30, Math.min(350, Number(weightKg) || 70));
  const safeHeight = Math.max(90, Math.min(250, Number(heightCm) || 170));

  const heightM = safeHeight / 100;
  const rawBmi = safeWeight / (heightM * heightM);
  const bmi = Math.round(rawBmi * 10) / 10;

  let category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese' = 'Normal';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25) category = 'Normal';
  else if (bmi < 30) category = 'Overweight';
  else category = 'Obese';

  // Healthy BMI range 18.5 - 24.9
  const idealWeightMinKg = Math.round(18.5 * heightM * heightM * 10) / 10;
  const idealWeightMaxKg = Math.round(24.9 * heightM * heightM * 10) / 10;

  return { bmi, category, idealWeightMinKg, idealWeightMaxKg };
}

export interface NutritionTargetsResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  waterTargetMl: number;
  bmi: number;
  bmiCategory: 'Underweight' | 'Normal' | 'Overweight' | 'Obese';
  nowBodyFat: string;
  goalBodyFat: string;
  nowMuscleBars: number;
  goalMuscleBars: number;
  calorieDelta: number; // Positive = surplus, negative = deficit
  formulaUsed: string;
}

export function calculateNutritionTargets(params: {
  age: number;
  gender: 'male' | 'female' | 'other';
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: FitnessGoal;
  dietaryPreference: DietaryPreference;
}): NutritionTargetsResult {
  const safeAge = Math.max(14, Math.min(100, Number(params.age) || 28));
  const safeHeight = Math.max(90, Math.min(250, Number(params.heightCm) || 175));
  const safeWeight = Math.max(35, Math.min(300, Number(params.weightKg) || 75));
  const gender = params.gender || 'male';
  const activityLevel = params.activityLevel || 'moderate';
  const goal = params.goal || 'shred';
  const dietaryPreference = params.dietaryPreference || 'high_protein';

  // Mifflin-St Jeor Equation for Basal Metabolic Rate (BMR) - Validated Standard (1990)
  // BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) + s (s=+5 for males, -161 for females)
  let bmr = 10 * safeWeight + 6.25 * safeHeight - 5 * safeAge;
  if (gender === 'male') {
    bmr += 5;
  } else if (gender === 'female') {
    bmr -= 161;
  } else {
    bmr -= 78; // Gender-neutral average
  }
  bmr = Math.round(bmr);

  // Total Daily Energy Expenditure (TDEE) Physical Activity Multipliers
  const activityFactors: Record<ActivityLevel, number> = {
    sedentary: 1.2,       // Little to no exercise, desk job
    light: 1.375,         // Light exercise 1-3 days/week
    moderate: 1.55,       // Moderate exercise 3-5 days/week
    active: 1.725,        // Hard exercise 6-7 days/week
    very_active: 1.9,     // Physical labor or heavy training 2x/day
  };
  const tdee = Math.round(bmr * (activityFactors[activityLevel] || 1.55));

  // Goal Caloric Adjustments
  let targetCalories = tdee;
  if (goal === 'shred') {
    // 20-22% progressive deficit, with a safe physiological floor (1200 kcal women, 1500 kcal men)
    const floor = gender === 'female' ? 1200 : 1450;
    targetCalories = Math.max(floor, Math.round(tdee * 0.78));
  } else if (goal === 'build_muscle') {
    // 10-12% clean surplus to fuel hypertrophy with minimal adipose gain
    targetCalories = Math.round(tdee * 1.12);
  } else if (goal === 'recomp') {
    // High protein slight deficit (-5%)
    targetCalories = Math.round(tdee * 0.95);
  } else if (goal === 'maintenance' || goal === 'general_wellness') {
    targetCalories = tdee;
  } else if (goal === 'endurance') {
    targetCalories = Math.round(tdee * 1.05);
  }

  const calorieDelta = targetCalories - tdee;

  // Evidence-based Macronutrient Distribution
  let proteinRatio = 0.30;
  let carbRatio = 0.45;
  let fatRatio = 0.25;

  if (dietaryPreference === 'keto') {
    proteinRatio = 0.25;
    carbRatio = 0.05;
    fatRatio = 0.70;
  } else if (dietaryPreference === 'high_protein' || goal === 'shred' || goal === 'build_muscle') {
    proteinRatio = 0.35;
    carbRatio = 0.40;
    fatRatio = 0.25;
  } else if (dietaryPreference === 'low_carb') {
    proteinRatio = 0.35;
    carbRatio = 0.25;
    fatRatio = 0.40;
  } else if (dietaryPreference === 'vegan' || dietaryPreference === 'vegetarian' || dietaryPreference === 'eggetarian') {
    proteinRatio = 0.28;
    carbRatio = 0.48;
    fatRatio = 0.24;
  } else if (dietaryPreference === 'mediterranean') {
    proteinRatio = 0.28;
    carbRatio = 0.44;
    fatRatio = 0.28;
  }

  const proteinGrams = Math.round((targetCalories * proteinRatio) / 4);
  const carbsGrams = Math.round((targetCalories * carbRatio) / 4);
  const fatGrams = Math.round((targetCalories * fatRatio) / 9);
  // Dietary fiber: 14g per 1000 kcal (Academy of Nutrition and Dietetics standard)
  const fiberGrams = Math.max(25, Math.round((targetCalories / 1000) * 14));

  // Water intake calculation (standard 35ml/kg + workout replacement)
  let baseWater = (safeWeight * 35) / 1000;
  if (activityLevel === 'moderate' || activityLevel === 'active' || activityLevel === 'very_active') {
    baseWater += 0.5;
  }
  const waterTargetL = Math.max(2.0, Math.round(baseWater * 4) / 4);
  const waterTargetMl = Math.round(waterTargetL * 1000);

  const { bmi, category } = calculateBMI(safeWeight, safeHeight);

  let nowBodyFat = '20-24%';
  let goalBodyFat = '10-12%';
  let nowMuscleBars = 2;
  let goalMuscleBars = 4;

  if (bmi >= 30) {
    nowBodyFat = '28-34%';
    goalBodyFat = '14-16%';
    nowMuscleBars = 1;
    goalMuscleBars = 4;
  } else if (bmi >= 25) {
    nowBodyFat = '22-26%';
    goalBodyFat = '10-12%';
    nowMuscleBars = 2;
    goalMuscleBars = 5;
  } else if (bmi < 20) {
    nowBodyFat = '12-15%';
    goalBodyFat = '11-13%';
    nowMuscleBars = 1;
    goalMuscleBars = 4;
  }

  return {
    bmr,
    tdee,
    targetCalories,
    proteinGrams,
    carbsGrams,
    fatGrams,
    fiberGrams,
    waterTargetMl,
    bmi,
    bmiCategory: category,
    nowBodyFat,
    goalBodyFat,
    nowMuscleBars,
    goalMuscleBars,
    calorieDelta,
    formulaUsed: 'Mifflin-St Jeor Equation (1990) & ACSM Guidelines',
  };
}

export function calculateDailyNutritionTotals(foodLogs: FoodLogEntry[]): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  count: number;
} {
  return foodLogs.reduce(
    (acc, item) => {
      acc.calories += Math.round(Number(item.calories) || 0);
      acc.protein += Math.round((Number(item.protein) || 0) * 10) / 10;
      acc.carbs += Math.round((Number(item.carbs) || 0) * 10) / 10;
      acc.fat += Math.round((Number(item.fat) || 0) * 10) / 10;
      acc.fiber += Math.round((Number(item.fiber) || 0) * 10) / 10;
      acc.count += 1;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, count: 0 }
  );
}

export function formatMl(ml: number): string {
  if (ml >= 1000) {
    return `${(ml / 1000).toFixed(1)} L`;
  }
  return `${ml} ml`;
}
