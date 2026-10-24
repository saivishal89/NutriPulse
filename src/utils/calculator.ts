import { FitnessGoal, DietaryPreference, ActivityLevel, UserProfile } from '../types';

export function calculateBMI(weightKg: number, heightCm: number): {
  bmi: number;
  category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese';
} {
  const heightM = heightCm / 100;
  const rawBmi = weightKg / (heightM * heightM);
  const bmi = Math.round(rawBmi * 100) / 100;

  let category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese' = 'Normal';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25) category = 'Normal';
  else if (bmi < 30) category = 'Overweight';
  else category = 'Obese';

  return { bmi, category };
}

export function calculateNutritionTargets(params: {
  age: number;
  gender: 'male' | 'female' | 'other';
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: FitnessGoal;
  dietaryPreference: DietaryPreference;
}) {
  const { age, gender, heightCm, weightKg, activityLevel, goal, dietaryPreference } = params;

  // Mifflin-St Jeor Equation for BMR
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'male') {
    bmr += 5;
  } else if (gender === 'female') {
    bmr -= 161;
  } else {
    bmr -= 78;
  }

  // TDEE Multipliers
  const activityFactors: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  const tdee = Math.round(bmr * activityFactors[activityLevel]);

  // Goal adjustment
  let targetCalories = tdee;
  if (goal === 'shred') {
    targetCalories = Math.max(1200, Math.round(tdee * 0.78)); // ~22% deficit for effective fat loss
  } else if (goal === 'build_muscle') {
    targetCalories = Math.round(tdee * 1.12); // ~12% clean surplus
  } else if (goal === 'recomp') {
    targetCalories = Math.round(tdee * 0.95); // High protein slight deficit
  } else {
    targetCalories = tdee;
  }

  // Macronutrient breakdown (grams)
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
  } else if (dietaryPreference === 'vegan' || dietaryPreference === 'vegetarian') {
    proteinRatio = 0.28;
    carbRatio = 0.50;
    fatRatio = 0.22;
  }

  const proteinGrams = Math.round((targetCalories * proteinRatio) / 4);
  const carbsGrams = Math.round((targetCalories * carbRatio) / 4);
  const fatGrams = Math.round((targetCalories * fatRatio) / 9);
  const fiberGrams = Math.round((targetCalories / 1000) * 14); // 14g per 1000 kcal

  // Water intake calculation (standard 35ml per kg, plus 500ml for active workouts)
  let baseWater = (weightKg * 35) / 1000;
  if (activityLevel === 'moderate' || activityLevel === 'active' || activityLevel === 'very_active') {
    baseWater += 0.5;
  }
  // Round to nearest 0.25L
  const waterTargetL = Math.max(2.0, Math.round(baseWater * 4) / 4);
  const waterTargetMl = Math.round(waterTargetL * 1000);

  // Body fat & muscle estimates
  const { bmi, category } = calculateBMI(weightKg, heightCm);
  let nowBodyFat = '20-24%';
  let goalBodyFat = '8-10%';
  let nowMuscleBars = 2;
  let goalMuscleBars = 4;

  if (bmi >= 30) {
    nowBodyFat = '28-34%';
    goalBodyFat = '12-15%';
    nowMuscleBars = 1;
    goalMuscleBars = 4;
  } else if (bmi >= 25) {
    nowBodyFat = '20-25%';
    goalBodyFat = '8-11%';
    nowMuscleBars = 2;
    goalMuscleBars = 5;
  } else if (bmi < 20) {
    nowBodyFat = '12-15%';
    goalBodyFat = '10-12%';
    nowMuscleBars = 1;
    goalMuscleBars = 4;
  }

  return {
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
  };
}

export function formatMl(ml: number): string {
  if (ml >= 1000) {
    return `${(ml / 1000).toFixed(1)} L`;
  }
  return `${ml} ml`;
}
