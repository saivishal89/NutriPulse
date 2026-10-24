export type FitnessGoal = 'shred' | 'build_muscle' | 'recomp' | 'endurance';

export type DietaryPreference = 
  | 'balanced' 
  | 'high_protein' 
  | 'keto' 
  | 'low_carb' 
  | 'vegan' 
  | 'vegetarian' 
  | 'mediterranean';

export type ActivityLevel = 
  | 'sedentary' 
  | 'light' 
  | 'moderate' 
  | 'active' 
  | 'very_active';

export type EquipmentType = 'gym' | 'home_dumbbells' | 'bodyweight';

export interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  activityLevel: ActivityLevel;
  goal: FitnessGoal;
  dietaryPreference: DietaryPreference;
  equipment: EquipmentType;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  allergies: string;
  targetCalories: number;
  waterTargetMl: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  // MadMuscles calculated metrics
  bmi: number;
  bmiCategory: 'Underweight' | 'Normal' | 'Overweight' | 'Obese';
  nowBodyFat: string;
  goalBodyFat: string;
  nowMuscleBars: number;
  goalMuscleBars: number;
  createdAt: string;
}

export interface MealItem {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodLogEntry {
  id: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  title: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  photoUrl?: string;
  loggedAt: string;
  date: string; // YYYY-MM-DD
  items?: MealItem[];
  healthScore?: number;
  dietaryTags?: string[];
  insights?: string;
}

export interface WaterLog {
  date: string; // YYYY-MM-DD
  intakeMl: number;
  targetMl: number;
  logs: { time: string; amountMl: number }[];
}

export interface WaterReminder {
  id: string;
  time: string; // "08:00"
  label: string;
  amountMl: number;
  enabled: boolean;
}

export interface MealRecipe {
  id: string;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepMinutes: number;
  cookMinutes?: number;
  ingredients: string[];
  instructions: string;
  imageUrl?: string;
}

export interface MealPlanDay {
  dayName: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  dayGoal: string;
  totalCalories: number;
  totalProtein: number;
  meals: MealRecipe[];
}

export interface WeeklyMealPlan {
  planTitle: string;
  summary: string;
  dailyTargetCalories: number;
  days: MealPlanDay[];
  batchPrepTips: string[];
  groceryList: {
    produce: string[];
    proteins: string[];
    grainsAndCarbs: string[];
    dairyAndAlternative: string[];
    pantryAndSpices: string[];
  };
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  targetMuscle: string;
  coachingCue: string;
  weightUsed?: string;
  completedSets?: boolean[];
}

export interface WorkoutDay {
  dayNumber: number;
  dayName: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  focus: string;
  durationMinutes: number;
  isRestDay: boolean;
  exercises: Exercise[];
  completed?: boolean;
}

export interface WeeklyWorkoutPlan {
  programName: string;
  description: string;
  weeklyGoal: string;
  days: WorkoutDay[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  iconName: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number; // 0 to 100
}

export interface StreakState {
  foodStreak: number;
  waterStreak: number;
  workoutStreak: number;
  totalXp: number;
  level: number;
  lastActiveDate: string;
}

export interface WeightLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  note?: string;
}

export interface DayReport {
  date: string;
  caloriesEaten: number;
  targetCalories: number;
  proteinGrams: number;
  targetProtein: number;
  waterMl: number;
  targetWaterMl: number;
  workoutCompleted: boolean;
  weightKg?: number;
}

export type NotificationCategory = 'hydration' | 'meal' | 'workout' | 'streak' | 'system';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  timestamp: string; // ISO string
  read: boolean;
  actionTab?: string;
  actionLabel?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  hydrationReminders: boolean;
  hydrationIntervalMinutes: number; // e.g., 60, 90, 120
  breakfastReminder: boolean;
  breakfastTime: string; // "08:30"
  lunchReminder: boolean;
  lunchTime: string; // "13:00"
  dinnerReminder: boolean;
  dinnerTime: string; // "19:30"
  workoutReminder: boolean;
  workoutTime: string; // "17:30"
  streakAlerts: boolean;
}
