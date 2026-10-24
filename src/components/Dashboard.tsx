import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Check, 
  Dumbbell, 
  Sliders, 
  ChevronRight,
  TrendingUp,
  Flame
} from 'lucide-react';
import { UserProfile, FoodLogEntry, WaterLog, WeeklyMealPlan, WeeklyWorkoutPlan, StreakState, WeightLogEntry } from '../types';
import { sounds } from '../utils/sound';
import { WeightTracker } from './WeightTracker';
import { BmiTrajectoryChart } from './BmiTrajectoryChart';

interface DashboardProps {
  profile: UserProfile;
  foodLogs: FoodLogEntry[];
  waterLog: WaterLog;
  mealPlan: WeeklyMealPlan;
  workoutPlan: WeeklyWorkoutPlan;
  streaks: StreakState;
  weightLogs: WeightLogEntry[];
  onNavigateTab: (tab: string) => void;
  onOpenProfile: () => void;
  onOpenManualFoodModal: (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => void;
  onDeleteFoodLog: (id: string) => void;
  onAddWater: (amountMl: number) => void;
  onQuickLogPlannedMeal: (recipe: any) => void;
  onAddWeightLog: (entry: Omit<WeightLogEntry, 'id'>) => void;
  onDeleteWeightLog: (id: string) => void;
  onUpdateGoalWeight: (newGoalKg: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  foodLogs,
  waterLog,
  mealPlan,
  workoutPlan,
  streaks,
  weightLogs,
  onNavigateTab,
  onOpenProfile,
  onOpenManualFoodModal,
  onDeleteFoodLog,
  onAddWater,
  onQuickLogPlannedMeal,
  onAddWeightLog,
  onDeleteWeightLog,
  onUpdateGoalWeight,
}) => {
  // Aggregate today's macros
  const totalCaloriesEaten = foodLogs.reduce((acc, item) => acc + item.calories, 0);
  const totalProteinEaten = foodLogs.reduce((acc, item) => acc + item.protein, 0);
  const totalCarbsEaten = foodLogs.reduce((acc, item) => acc + item.carbs, 0);
  const totalFatEaten = foodLogs.reduce((acc, item) => acc + item.fat, 0);

  const targetCalories = profile.targetCalories || 2400;
  const remainingCalories = Math.max(0, targetCalories - totalCaloriesEaten);
  const caloriePercent = Math.min(100, Math.round((totalCaloriesEaten / targetCalories) * 100));

  // Target macros
  const targetProtein = profile.proteinGrams || 180;
  const targetCarbs = profile.carbsGrams || 260;
  const targetFat = profile.fatGrams || 70;

  const proteinPct = Math.min(100, Math.round((totalProteinEaten / targetProtein) * 100));
  const carbsPct = Math.min(100, Math.round((totalCarbsEaten / targetCarbs) * 100));
  const fatPct = Math.min(100, Math.round((totalFatEaten / targetFat) * 100));

  // Trajectory Chart View Switcher (Weight vs BMI)
  const [trajectoryView, setTrajectoryView] = useState<'weight' | 'bmi'>('weight');

  // Inline Quick Macro Entry Drawer state
  const [isQuickDrawerOpen, setIsQuickDrawerOpen] = useState(false);
  const [quickMealName, setQuickMealName] = useState('');
  const [quickCalories, setQuickCalories] = useState('');
  const [quickProtein, setQuickProtein] = useState('');
  const [quickCarbs, setQuickCarbs] = useState('');
  const [quickFat, setQuickFat] = useState('');
  const [quickMealType, setQuickMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);

  // Water units: 10 units of 250ml each = 2500ml target
  const filledUnits = Math.min(10, Math.floor(waterLog.intakeMl / 250));

  const handleToggleWaterUnit = (index: number) => {
    sounds.water();
    if (index < filledUnits) {
      // remove 250ml
      onAddWater(-250);
    } else {
      // add 250ml
      onAddWater(250);
    }
  };

  const handleSaveQuickLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickMealName.trim() || !quickCalories) return;

    sounds.success();
    setIsSavedFeedback(true);

    onQuickLogPlannedMeal({
      type: quickMealType,
      name: quickMealName.trim(),
      calories: parseInt(quickCalories, 10) || 0,
      protein: parseInt(quickProtein, 10) || 0,
      carbs: parseInt(quickCarbs, 10) || 0,
      fat: parseInt(quickFat, 10) || 0,
    });

    setTimeout(() => {
      setIsSavedFeedback(false);
      setIsQuickDrawerOpen(false);
      setQuickMealName('');
      setQuickCalories('');
      setQuickProtein('');
      setQuickCarbs('');
      setQuickFat('');
    }, 700);
  };

  // SVGs for circular progress ring (radius 40, circumference ~251.32)
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (caloriePercent / 100) * circumference;

  return (
    <div className="relative w-full max-w-5xl mx-auto space-y-5 px-3 sm:px-6 pb-24">
      
      {/* Subtle Ambient Glow Background Layers */}
      <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-[340px] h-[340px] bg-[#ff5708]/10 rounded-full blur-[90px] -z-10" />
      <div className="pointer-events-none absolute top-[480px] -right-16 w-[280px] h-[280px] bg-[#4cd7f6]/10 rounded-full blur-[80px] -z-10" />
      <div className="pointer-events-none absolute bottom-12 -left-12 w-[260px] h-[260px] bg-[#4edea3]/10 rounded-full blur-[80px] -z-10" />

      {/* Athletic Quick State Ribbon */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-2.5 h-2.5 rounded-full bg-[#4edea3] animate-pulse shadow-[0_0_8px_rgba(78,222,163,0.8)]" />
          <span className="font-mono text-xs uppercase tracking-wider text-[#e5beb2] font-medium">
            Telemetry Synced • {profile.goal.toUpperCase()} PHASE
          </span>
        </div>
        <button 
          onClick={onOpenProfile}
          className="font-mono text-xs text-[#ffdbcf] bg-[#262a34] hover:bg-[#31353f] px-2.5 py-0.5 rounded-full transition-colors cursor-pointer"
        >
          Day {streaks.foodStreak} / 60
        </button>
      </div>

      {/* 1. Calorie Target Telemetry Card */}
      <section className="w-full rounded-2xl bg-[#1c1f29]/80 backdrop-blur-xl p-4 sm:p-5 shadow-xl border border-white/5 relative overflow-hidden">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <p className="font-mono text-xs text-[#e5beb2]/80 uppercase tracking-wider">Caloric Expenditure</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-headline text-3xl sm:text-4xl font-bold text-[#dfe2ef] tracking-tight">
                {remainingCalories.toLocaleString()}
              </span>
              <span className="font-mono text-xs text-[#e5beb2]/70 uppercase">
                / {targetCalories.toLocaleString()} kcal remaining
              </span>
            </div>
            <p className="text-xs text-[#4edea3] mt-1.5 flex items-center gap-1 font-mono">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{totalCaloriesEaten.toLocaleString()} kcal consumed today ({caloriePercent}%)</span>
            </p>
          </div>

          {/* Animated Circular Progress Ring */}
          <div className="relative w-22 h-22 sm:w-24 sm:h-24 flex-shrink-0 flex items-center justify-center">
            <svg className="w-22 h-22 sm:w-24 sm:h-24 transform -rotate-90" viewBox="0 0 96 96">
              <circle 
                cx="48" 
                cy="48" 
                fill="transparent" 
                r="40" 
                stroke="rgba(255,255,255,0.08)" 
                strokeWidth="7" 
              />
              <circle 
                cx="48" 
                cy="48" 
                fill="transparent" 
                r="40" 
                stroke="#ff5708" 
                strokeDasharray={circumference} 
                strokeDashoffset={strokeDashoffset} 
                strokeLinecap="round" 
                strokeWidth="7" 
                className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(255,87,8,0.5)]" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-mono text-base sm:text-lg text-[#ffdbcf] font-bold leading-none">
                {caloriePercent}%
              </span>
              <span className="font-mono text-[9px] text-[#e5beb2]/70 uppercase mt-0.5">
                Target
              </span>
            </div>
          </div>
        </div>

        {/* 3 Core Macros Linear Telemetry */}
        <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-white/5">
          {/* Protein */}
          <div className="bg-[#181b25]/80 rounded-xl p-3 border border-white/5">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[11px] uppercase tracking-wide text-[#4edea3] font-semibold">Protein</span>
              <span className="font-mono text-[11px] font-semibold text-[#dfe2ef]">{proteinPct}%</span>
            </div>
            <p className="font-mono text-sm text-[#dfe2ef] font-semibold">
              {totalProteinEaten}<span className="text-[#e5beb2]/70 text-[10px]">/{targetProtein}g</span>
            </p>
            <div className="w-full bg-[#31353f]/60 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-[#4edea3] h-full rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(78,222,163,0.5)]" 
                style={{ width: `${proteinPct}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div className="bg-[#181b25]/80 rounded-xl p-3 border border-white/5">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[11px] uppercase tracking-wide text-[#ff5708] font-semibold">Carbs</span>
              <span className="font-mono text-[11px] font-semibold text-[#dfe2ef]">{carbsPct}%</span>
            </div>
            <p className="font-mono text-sm text-[#dfe2ef] font-semibold">
              {totalCarbsEaten}<span className="text-[#e5beb2]/70 text-[10px]">/{targetCarbs}g</span>
            </p>
            <div className="w-full bg-[#31353f]/60 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-[#ff5708] h-full rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(255,87,8,0.5)]" 
                style={{ width: `${carbsPct}%` }}
              />
            </div>
          </div>

          {/* Fats */}
          <div className="bg-[#181b25]/80 rounded-xl p-3 border border-white/5">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[11px] uppercase tracking-wide text-[#4cd7f6] font-semibold">Fats</span>
              <span className="font-mono text-[11px] font-semibold text-[#dfe2ef]">{fatPct}%</span>
            </div>
            <p className="font-mono text-sm text-[#dfe2ef] font-semibold">
              {totalFatEaten}<span className="text-[#e5beb2]/70 text-[10px]">/{targetFat}g</span>
            </p>
            <div className="w-full bg-[#31353f]/60 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-[#4cd7f6] h-full rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(76,215,246,0.5)]" 
                style={{ width: `${fatPct}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Hydration Water Tracker Card */}
      <section className="w-full rounded-2xl bg-[#1c1f29]/80 backdrop-blur-xl p-4 sm:p-5 shadow-xl border border-white/5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#03b5d3]/20 flex items-center justify-center text-[#4cd7f6]">
              <span className="material-symbols-outlined text-[18px]">water_drop</span>
            </div>
            <div>
              <h2 className="font-headline text-base font-bold text-[#dfe2ef] tracking-tight">Hydration Matrix</h2>
              <span className="font-mono text-xs text-[#4cd7f6]">
                {(waterLog.intakeMl / 1000).toFixed(1)}L of {(waterLog.targetMl / 1000).toFixed(1)}L Target
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-[#262a34] px-2.5 py-1 rounded-full border border-white/5">
            <span className="material-symbols-outlined text-[14px] text-[#4cd7f6]">alarm</span>
            <span className="font-mono text-[11px] text-[#e5beb2]/80">Next: 2:30 PM</span>
          </div>
        </div>

        {/* Interactive Glass Tap Indicators (10 x 250ml units = 2.5L) */}
        <div className="grid grid-cols-10 gap-1 sm:gap-2 pt-1 pb-2">
          {Array.from({ length: 10 }).map((_, idx) => {
            const isFilled = idx < filledUnits;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleToggleWaterUnit(idx)}
                aria-label={`Water unit ${idx + 1}`}
                className={`h-9 sm:h-10 rounded-lg flex flex-col items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer ${
                  isFilled
                    ? 'bg-[#4cd7f6] text-[#003640] shadow-[0_0_10px_rgba(76,215,246,0.4)]'
                    : 'bg-[#262a34] text-[#e5beb2]/40 hover:bg-[#4cd7f6]/30 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[14px] font-bold">
                  {isFilled ? 'check' : 'add'}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[#e5beb2]/70 font-mono text-xs mt-1">
          <span className="flex items-center gap-1 text-[#4edea3]">
            <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
            <span>{filledUnits >= 8 ? 'Optimal Hydration' : 'Drink regularly'}</span>
          </span>
          <span>Tap bar to toggle 250ml</span>
        </div>
      </section>

      {/* 3. Interactive Quick Switchable Chart: Weight & Biometric Trajectory */}
      <section className="w-full rounded-2xl bg-[#1c1f29]/80 backdrop-blur-xl p-4 sm:p-5 shadow-xl border border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline text-base sm:text-lg font-bold text-[#dfe2ef] tracking-tight">
                {trajectoryView === 'weight' ? 'Weight Trajectory' : 'BMI Health Trajectory'}
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#4edea3]/15 text-[#4edea3] border border-[#4edea3]/30">
                {trajectoryView === 'weight' ? 'Progress' : `${profile.bmiCategory}`}
              </span>
            </div>
            <p className="font-mono text-xs text-[#e5beb2]/80 mt-0.5">
              Current: {profile.weightKg} kg • Goal: {profile.targetWeightKg} kg • {profile.bmi} BMI
            </p>
          </div>

          {/* Segmented Metric Switcher */}
          <div className="flex bg-[#0a0e17] p-1 rounded-xl border border-white/5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setTrajectoryView('weight')}
              className={`px-3 py-1 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer ${
                trajectoryView === 'weight'
                  ? 'bg-[#262a34] text-white shadow-sm'
                  : 'text-[#e5beb2]/60 hover:text-white'
              }`}
            >
              Weight
            </button>
            <button
              type="button"
              onClick={() => setTrajectoryView('bmi')}
              className={`px-3 py-1 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer ${
                trajectoryView === 'bmi'
                  ? 'bg-[#262a34] text-white shadow-sm'
                  : 'text-[#e5beb2]/60 hover:text-white'
              }`}
            >
              BMI Index
            </button>
          </div>
        </div>

        {/* Embedded Recharts Component */}
        <div className="w-full">
          {trajectoryView === 'weight' ? (
            <WeightTracker
              profile={profile}
              weightLogs={weightLogs}
              onAddWeightLog={onAddWeightLog}
              onDeleteWeightLog={onDeleteWeightLog}
              onUpdateGoalWeight={onUpdateGoalWeight}
            />
          ) : (
            <BmiTrajectoryChart
              profile={profile}
              weightLogs={weightLogs}
            />
          )}
        </div>
      </section>

      {/* 4. Today's Fuel Journal Section */}
      <section className="w-full space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ff5708] text-[20px]">restaurant</span>
            <h2 className="font-headline text-base sm:text-lg font-bold text-[#dfe2ef] tracking-tight">
              Today's Fuel Journal
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsQuickDrawerOpen((prev) => !prev)}
            className="flex items-center gap-1.5 text-[#ffdbcf] bg-[#ff5708]/20 hover:bg-[#ff5708]/30 px-3 py-1.5 rounded-full font-mono text-xs font-semibold transition-all active:scale-95 cursor-pointer border border-[#ff5708]/30"
          >
            <Plus className="w-3.5 h-3.5 text-[#ffb59c]" />
            <span>{isQuickDrawerOpen ? 'Close Entry' : 'Speed Macro Entry'}</span>
          </button>
        </div>

        {/* Interactive Quick Log Action Overlay (Modal-free inline drawer) */}
        {isQuickDrawerOpen && (
          <form 
            onSubmit={handleSaveQuickLog}
            className="w-full rounded-2xl bg-[#262a34]/95 backdrop-blur-2xl p-4 sm:p-5 shadow-2xl border border-[#ff5708]/30 space-y-3 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ff5708] text-[20px]">bolt</span>
                <span className="font-headline text-sm font-bold text-[#dfe2ef]">Speed Macro Entry</span>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickDrawerOpen(false)}
                className="w-7 h-7 rounded-full bg-[#31353f] flex items-center justify-center text-[#e5beb2] hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                placeholder="Item name (e.g. Protein Shake & Banana)"
                value={quickMealName}
                onChange={(e) => setQuickMealName(e.target.value)}
                required
                className="w-full bg-[#0a0e17] text-[#dfe2ef] text-sm px-3.5 py-2.5 rounded-xl border border-white/10 outline-none focus:border-[#ff5708]"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Est. Calories"
                  value={quickCalories}
                  onChange={(e) => setQuickCalories(e.target.value)}
                  required
                  className="w-full bg-[#0a0e17] text-[#dfe2ef] font-mono text-sm px-3.5 py-2.5 rounded-xl border border-white/10 outline-none focus:border-[#ff5708]"
                />
                <select
                  value={quickMealType}
                  onChange={(e) => setQuickMealType(e.target.value as any)}
                  className="bg-[#0a0e17] text-[#dfe2ef] text-xs px-2.5 py-2.5 rounded-xl border border-white/10 outline-none font-mono"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <input
                type="number"
                placeholder="Protein (g)"
                value={quickProtein}
                onChange={(e) => setQuickProtein(e.target.value)}
                className="w-full bg-[#0a0e17] text-[#dfe2ef] font-mono text-xs px-3 py-2 rounded-xl border border-white/10 outline-none focus:border-[#4edea3]"
              />
              <input
                type="number"
                placeholder="Carbs (g)"
                value={quickCarbs}
                onChange={(e) => setQuickCarbs(e.target.value)}
                className="w-full bg-[#0a0e17] text-[#dfe2ef] font-mono text-xs px-3 py-2 rounded-xl border border-white/10 outline-none focus:border-[#ff5708]"
              />
              <input
                type="number"
                placeholder="Fat (g)"
                value={quickFat}
                onChange={(e) => setQuickFat(e.target.value)}
                className="w-full bg-[#0a0e17] text-[#dfe2ef] font-mono text-xs px-3 py-2 rounded-xl border border-white/10 outline-none focus:border-[#4cd7f6]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#ff5708] to-[#ff8c42] text-white font-headline text-sm font-bold tracking-wide shadow-md active:scale-98 transition-transform cursor-pointer"
            >
              {isSavedFeedback ? '✓ Meal Successfully Synced!' : 'Record to Fuel Log'}
            </button>
          </form>
        )}

        {/* Meal Cards List */}
        {foodLogs.length === 0 ? (
          <div className="rounded-2xl bg-[#1c1f29]/60 p-8 text-center border border-white/5">
            <span className="material-symbols-outlined text-[36px] text-[#ff5708]/60 mb-2">restaurant</span>
            <p className="text-sm font-medium text-[#dfe2ef]">No meals logged for today yet</p>
            <p className="text-xs text-[#e5beb2]/60 mt-1">
              Snap a food photo or log your breakfast to start tracking macros.
            </p>
            <button
              type="button"
              onClick={() => onNavigateTab('scanner')}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#ff5708] text-white text-xs font-headline font-bold shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">photo_camera</span>
              <span>Open AI Camera Scanner</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {foodLogs.map((meal) => (
              <article 
                key={meal.id}
                className="w-full rounded-2xl bg-[#1c1f29]/80 backdrop-blur-xl p-3.5 sm:p-4 shadow-md border border-white/5 flex items-center justify-between gap-3 relative overflow-hidden group hover:border-white/15 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-[#262a34]">
                    {meal.photoUrl ? (
                      <img 
                        src={meal.photoUrl} 
                        alt={meal.title} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#262a34] text-[#ffb59c]">
                        <span className="material-symbols-outlined text-[24px]">lunch_dining</span>
                      </div>
                    )}
                    <span className="absolute top-1 left-1 bg-[#0a0e17]/90 text-[#4edea3] rounded-full p-0.5 flex items-center justify-center shadow">
                      <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        verified
                      </span>
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-[#e5beb2]/80 uppercase tracking-wider">
                        {meal.mealType} • {meal.loggedAt || 'Today'}
                      </span>
                      {meal.dietaryTags?.includes('Weekly Meal Prep') && (
                        <span className="px-1.5 py-0.2 rounded bg-[#00a572]/20 text-[#6ffbbe] text-[9px] font-mono uppercase font-semibold">
                          Prep Plan
                        </span>
                      )}
                    </div>
                    <h3 className="font-headline text-sm font-semibold text-[#dfe2ef] truncate mt-0.5">
                      {meal.title}
                    </h3>
                    <p className="font-mono text-xs text-[#e5beb2]/70 mt-0.5">
                      {meal.protein}g P • {meal.carbs}g C • {meal.fat}g F
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex flex-col items-end">
                    <span className="font-mono text-base font-bold text-[#dfe2ef]">
                      {meal.calories}
                    </span>
                    <span className="font-mono text-[9px] text-[#e5beb2]/70 uppercase">
                      kcal
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteFoodLog(meal.id)}
                    className="w-8 h-8 rounded-lg bg-[#262a34]/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-all cursor-pointer"
                    title="Delete meal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* 5. Quick Shortcut Strip to Meal Prep & Workout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          onClick={() => onNavigateTab('mealprep')}
          className="rounded-2xl bg-[#1c1f29]/80 hover:bg-[#262a34] p-4 border border-white/5 flex items-center justify-between text-left transition-all cursor-pointer group shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00a572]/20 text-[#4edea3] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">restaurant_menu</span>
            </div>
            <div>
              <span className="font-mono text-[10px] text-[#4edea3] uppercase font-bold tracking-wider block">
                Weekly Meal Engine
              </span>
              <span className="font-headline text-sm font-bold text-[#dfe2ef]">
                7-Day Prep & Batch Guide
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#e5beb2]/60 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('workout')}
          className="rounded-2xl bg-[#1c1f29]/80 hover:bg-[#262a34] p-4 border border-white/5 flex items-center justify-between text-left transition-all cursor-pointer group shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ff5708]/20 text-[#ffb59c] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">fitness_center</span>
            </div>
            <div>
              <span className="font-mono text-[10px] text-[#ffb59c] uppercase font-bold tracking-wider block">
                Active Routine
              </span>
              <span className="font-headline text-sm font-bold text-[#dfe2ef]">
                Live Workout & HUD Deck
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#e5beb2]/60 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </div>
  );
};
