import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  Check, 
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Plus
} from 'lucide-react';
import { WeeklyMealPlan, MealRecipe, UserProfile, FoodLogEntry } from '../types';
import { sounds } from '../utils/sound';

interface MealPrepPlannerProps {
  profile: UserProfile;
  mealPlan: WeeklyMealPlan;
  onUpdateMealPlan: (plan: WeeklyMealPlan) => void;
  onLogMeal: (meal: Omit<FoodLogEntry, 'id' | 'loggedAt' | 'date'>) => void;
}

export const MealPrepPlanner: React.FC<MealPrepPlannerProps> = ({
  profile,
  mealPlan,
  onUpdateMealPlan,
  onLogMeal,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(2); // Default Wednesday
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [justLoggedMealId, setJustLoggedMealId] = useState<string | null>(null);

  // Batch Prep Timer state (45 minutes = 2700 seconds)
  const [prepSecondsRemaining, setPrepSecondsRemaining] = useState(45 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Batch Prep Steps state
  const [prepSteps, setPrepSteps] = useState([
    { id: 1, text: 'Pre-cook 1kg free-range chicken breasts', status: 'Done', done: true },
    { id: 2, text: 'Roast 800g paprika sweet potato cubes', status: 'In Oven', done: false },
    { id: 3, text: 'Portion steamed jasmine rice into 4 glass bins', status: 'Next', done: false },
    { id: 4, text: 'Air-fry Atlantic cod with asparagus & lemon', status: 'Pending', done: false },
  ]);

  // Supermarket Checklist state
  const [groceries, setGroceries] = useState([
    { id: 'g1', aisle: 'Fresh Produce & Greens', name: 'Baby spinach & asparagus spears', checked: true },
    { id: 'g2', aisle: 'Fresh Produce & Greens', name: 'Paprika sweet potatoes (800g)', checked: true },
    { id: 'g3', aisle: 'Fresh Produce & Greens', name: 'Hass avocados (4 pack)', checked: false },
    { id: 'g4', aisle: 'Fresh Produce & Greens', name: 'Organic blueberries & lemon', checked: false },
    { id: 'g5', aisle: 'Clean Protein & Seafood', name: 'Free-range chicken breasts (1kg)', checked: true },
    { id: 'g6', aisle: 'Clean Protein & Seafood', name: 'Wild Atlantic cod fillets (600g)', checked: false },
    { id: 'g7', aisle: 'Clean Protein & Seafood', name: 'Lean 93% ground turkey (800g)', checked: false },
    { id: 'g8', aisle: 'Clean Protein & Seafood', name: 'Pasture-raised eggs (dozen)', checked: true },
    { id: 'g9', aisle: 'Grains & Pantry Staples', name: 'Fragrant jasmine rice (2kg)', checked: true },
    { id: 'g10', aisle: 'Grains & Pantry Staples', name: 'Tri-color organic quinoa', checked: false },
    { id: 'g11', aisle: 'Grains & Pantry Staples', name: 'Cold-pressed extra virgin olive oil', checked: true },
  ]);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && prepSecondsRemaining > 0) {
      interval = setInterval(() => {
        setPrepSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (prepSecondsRemaining === 0) {
      setIsTimerRunning(false);
      sounds.alarm();
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, prepSecondsRemaining]);

  const toggleTimer = () => {
    sounds.tap();
    setIsTimerRunning((prev) => !prev);
  };

  const resetTimer = () => {
    sounds.tap();
    setIsTimerRunning(false);
    setPrepSecondsRemaining(45 * 60);
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleStep = (id: number) => {
    sounds.tap();
    setPrepSteps((prev) =>
      prev.map((step) => {
        if (step.id === id) {
          const nextDone = !step.done;
          return {
            ...step,
            done: nextDone,
            status: nextDone ? 'Done' : 'Next',
          };
        }
        return step;
      })
    );
  };

  const toggleGrocery = (id: string) => {
    sounds.tap();
    setGroceries((prev) =>
      prev.map((g) => (g.id === id ? { ...g, checked: !g.checked } : g))
    );
  };

  const handleLogPlannedMeal = (meal: MealRecipe) => {
    sounds.success();
    setJustLoggedMealId(meal.id);

    onLogMeal({
      title: meal.name,
      mealType: meal.type.toLowerCase() as any,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      fiber: 6,
      dietaryTags: ['Weekly Meal Prep'],
    });

    setTimeout(() => {
      setJustLoggedMealId(null);
    }, 1200);
  };

  // Full 7-Day Plan AI Regeneration
  const handleRegenerateFullPlan = async () => {
    setIsRegenerating(true);
    setGenerationError(null);
    sounds.camera();

    try {
      const response = await fetch('/api/generate-meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            goal: profile.goal,
            targetCalories: profile.targetCalories,
            proteinGrams: profile.proteinGrams,
            carbsGrams: profile.carbsGrams,
            fatGrams: profile.fatGrams,
            dietaryPreference: profile.dietaryPreference,
            allergies: profile.allergies,
            allergiesList: profile.allergiesList,
            foodDislikes: profile.foodDislikes,
            cuisinePreference: profile.cuisinePreference,
            dailyBudget: profile.dailyBudget,
            cookingTimeMinutes: profile.cookingTimeMinutes,
            mealsPerDay: profile.mealsPerDay,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned error (${response.status})`);
      }

      const newPlan = await response.json();
      if (newPlan?.days?.length > 0) {
        onUpdateMealPlan(newPlan);
        sounds.success();
      } else {
        throw new Error('Meal plan response was empty or improperly structured.');
      }
    } catch (err: any) {
      console.error('Failed to regenerate meal plan:', err);
      setGenerationError(err?.message || 'Could not regenerate AI meal plan. Please check your connection and retry.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const daysLabels = [
    { name: 'Mon', num: '07', tag: null },
    { name: 'Tue', num: '08', tag: null },
    { name: 'Wed', num: '09', tag: 'HI-CARB', highlight: true },
    { name: 'Thu', num: '10', tag: null },
    { name: 'Fri', num: '11', tag: null },
    { name: 'Sat', num: '12', tag: null },
    { name: 'Sun', num: '13', tag: 'BATCH' },
  ];

  const currentDay = mealPlan.days[selectedDayIndex] || mealPlan.days[0];

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 space-y-5 pb-28">
      
      {/* Ambient Micro Header Status */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex flex-col">
          <span className="font-mono text-xs text-[#ff5708] uppercase tracking-widest font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ff5708] animate-pulse" />
            AI Cycle Sync Active
          </span>
          <h1 className="font-headline text-xl sm:text-2xl font-bold text-[#dfe2ef]">
            Weekly Meal Engine
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 bg-[#262a34] px-3 py-1.5 rounded-full border border-white/5 shadow-md">
            <span className="material-symbols-outlined text-[18px] text-[#4edea3]">bolt</span>
            <span className="font-mono text-xs text-[#4edea3] font-bold tracking-tight">
              MACROS LOCKED
            </span>
          </div>

          <button
            type="button"
            onClick={handleRegenerateFullPlan}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 bg-[#ff5708] hover:bg-[#ff8c42] text-white px-3.5 py-1.5 rounded-full font-headline text-xs font-bold shadow-[0_0_16px_rgba(255,87,8,0.35)] transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>{isRegenerating ? 'Generating...' : 'Re-Generate Plan'}</span>
          </button>
        </div>
      </div>

      {generationError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-400 text-[20px]">error</span>
            <span>{generationError}</span>
          </div>
          <button
            type="button"
            onClick={handleRegenerateFullPlan}
            className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg text-xs whitespace-nowrap cursor-pointer transition-colors"
          >
            Retry Now
          </button>
        </div>
      )}

      {/* 7-Day Interactive Schedule Carousel */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-[#e5beb2]/80 uppercase tracking-wider">
            Weekly Horizon • Week 14
          </span>
          <span className="font-mono text-xs text-[#4cd7f6]">
            Target: {profile.targetCalories} kcal avg
          </span>
        </div>

        {/* Day Pills Bar */}
        <div className="flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none" id="day-selector">
          {daysLabels.map((day, idx) => {
            const isSelected = selectedDayIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedDayIndex(idx)}
                className={`flex-shrink-0 flex flex-col items-center justify-center py-2.5 rounded-2xl active:scale-95 transition-all cursor-pointer ${
                  isSelected
                    ? 'w-22 bg-[#ff5708] text-white shadow-xl shadow-[#ff5708]/30 relative overflow-hidden'
                    : 'w-14 bg-[#262a34] text-[#e5beb2]/70 hover:text-white border border-white/5'
                }`}
              >
                {isSelected && (
                  <div className="absolute -top-4 -right-4 w-10 h-10 bg-white/20 rounded-full blur-sm pointer-events-none" />
                )}
                <div className="flex items-center gap-1">
                  <span className="font-mono text-xs uppercase font-bold">
                    {day.name}
                  </span>
                  {isSelected && (
                    <span className="material-symbols-outlined text-[13px] text-white">
                      local_fire_department
                    </span>
                  )}
                </div>
                <span className="font-headline text-base sm:text-lg mt-0.5 font-bold">
                  {day.num}
                </span>
                {day.tag ? (
                  <span
                    className={`font-mono text-[9px] px-1.5 py-0.2 rounded-full mt-1 whitespace-nowrap ${
                      isSelected
                        ? 'bg-black/30 text-white'
                        : day.tag === 'BATCH'
                        ? 'text-[#4edea3] font-semibold'
                        : 'text-[#ffb59c] font-semibold'
                    }`}
                  >
                    {day.tag}
                  </span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20 mt-2" />
                )}
              </button>
            );
          })}
        </div>

        {/* Micro Day Telemetry Banner */}
        <div className="bg-[#181b25] rounded-2xl p-3.5 flex items-center justify-between border border-white/5 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#ff5708]/20 flex items-center justify-center text-[#ff5708]">
              <span className="material-symbols-outlined text-[20px]">fitness_center</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline text-xs sm:text-sm font-bold text-[#dfe2ef]">
                {daysLabels[selectedDayIndex]?.name} • Heavy Leg & Core Hypertrophy
              </span>
              <span className="font-mono text-[10px] text-[#e5beb2]/70">
                Macro Split: 45% Carb • 35% Prot • 20% Fat
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="font-headline text-base sm:text-lg text-[#ffb59c] font-bold">
              {currentDay?.totalCalories || profile.targetCalories}
            </span>
            <span className="block font-mono text-[10px] text-[#e5beb2]/60 uppercase">KCAL</span>
          </div>
        </div>
      </section>

      {/* Daily Meal Plan Breakdown Cards */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-sm sm:text-base font-bold text-[#dfe2ef] flex items-center gap-2">
            <span>Today's Meal Telemetry</span>
            <span className="bg-[#262a34] text-[#e5beb2] text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/5">
              {currentDay?.meals?.length || 3} Loaded
            </span>
          </h2>
          <span className="font-mono text-xs text-[#4cd7f6] flex items-center gap-1">
            <span>Prep Ready</span>
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
          </span>
        </div>

        {/* Meal cards list */}
        <div className="flex flex-col gap-2.5">
          {currentDay?.meals?.map((meal, index) => {
            const samplePhotos = [
              "https://lh3.googleusercontent.com/aida-public/AB6AXuAEAND9sE_kjYpz_LhQ5txB8UfbaeZZiHY8-J-PSnjYm-t22_eaohDA4tzp9hqqjqGS9Pie8SGeTqb4qwV0u7duuxjD9RIH2a_yD08CtRaFY7LNvhjEIiseblQgqxJk2zUDU73i0tSAPk6S4UuFJqDKKnbwTjjtGLDsr9gqQ2iDzaC5xOESwggA4YPOMo7sjluQQ66ZaHwLbMqnbILWBPJ82x8xH9C8-L9wzosrJm3_YC6TTl3feHWyGQ",
              "https://lh3.googleusercontent.com/aida-public/AB6AXuAjb2kZvEHY2ZIV4XUTM7pTy1Oxva1VjshJo88ylYQAbdQlvEZvgiMGdt7yJOOSPMMb1v7SeupNw1EmOzY1N6PUaP5aqyvnsyDsMUuMRdRw86UAP6YbgCyPymboNQa7VBsLTy-1H4KEeCYHFdUxNeQk1J8aYsGF6sXPRO7_Bd-zMLjHo1wzACd08buhFKLNJRVsqXupSLG3gPcr33qUQ60kiK-fmyKH4A6yTJctzSorvu5Rpuu0z-GdgQ",
              "https://lh3.googleusercontent.com/aida-public/AB6AXuDo_WrQdZfzdUZ9kGU3Es29L-tQl9TFkRCXDJ1yaCAywGw8InpOCSRbdeM6kxMi1GQLDQdlsAuCVPOXJVG8YMpuPqIhBfaViUfgYuHs1bewYqfhmlZ0qxBUUVe_KKBHkiO7dxJHwmfkHg9b_OJRYE2_CsZ0ETdgtqi2L7iKS9IM0EEosmKz7bW1wAUkeW0GvVH533P6aSJ8Jap9mC0cc-8IeGjNIJtrUWQzUK1wiEOWVb-nRV7lFPtwhQ"
            ];
            const timeTags = ['07:30', '13:00', '19:30', '16:00'];
            const photoUrl = samplePhotos[index % samplePhotos.length];

            return (
              <article 
                key={meal.id || index}
                className="bg-[#1c1f29] rounded-2xl p-3.5 sm:p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-white/5 relative overflow-hidden group hover:border-white/15 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden flex-shrink-0 relative bg-[#262a34]">
                    <img 
                      src={photoUrl} 
                      alt={meal.name} 
                      className="w-full h-full object-cover" 
                    />
                    <span className="absolute top-1 left-1 bg-[#0a0e17]/85 backdrop-blur-sm text-[9px] font-mono text-white px-1.5 py-0.2 rounded">
                      {timeTags[index] || '12:00'}
                    </span>
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-[#4cd7f6] uppercase tracking-wider">
                        {meal.type} • Batch #{index + 1}
                      </span>
                      <span className="font-mono text-xs text-[#dfe2ef] font-semibold">
                        {meal.calories} kcal
                      </span>
                    </div>
                    <h3 className="font-headline text-sm sm:text-base font-semibold text-[#dfe2ef] truncate mt-0.5">
                      {meal.name}
                    </h3>
                    <p className="text-xs text-[#e5beb2]/70 truncate mt-0.5 max-w-md">
                      {meal.instructions || 'High-protein fitness portion prepared in advance.'}
                    </p>

                    {/* Macro badges */}
                    <div className="flex items-center gap-1.5 pt-2">
                      <span className="bg-[#262a34] font-mono text-[10px] text-[#ffb59c] px-2 py-0.5 rounded-lg border border-white/5">
                        {meal.protein}g P
                      </span>
                      <span className="bg-[#262a34] font-mono text-[10px] text-[#4cd7f6] px-2 py-0.5 rounded-lg border border-white/5">
                        {meal.carbs}g C
                      </span>
                      <span className="bg-[#262a34] font-mono text-[10px] text-[#4edea3] px-2 py-0.5 rounded-lg border border-white/5">
                        {meal.fat}g F
                      </span>
                    </div>
                  </div>
                </div>

                {/* Log button */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  <button
                    type="button"
                    onClick={() => handleLogPlannedMeal(meal)}
                    className="w-full sm:w-auto px-3 py-1.5 rounded-full bg-[#ff5708]/20 hover:bg-[#ff5708] text-[#ffdbcf] hover:text-white font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-[#ff5708]/30 active:scale-95 cursor-pointer"
                  >
                    {justLoggedMealId === meal.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Logged!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Log to Journal</span>
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Batch Cooking Guide Widget (Sunday Prep Protocol) */}
      <section className="bg-[#181b25] rounded-2xl p-4 sm:p-5 shadow-lg border border-white/5 relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00a572]/20 flex items-center justify-center text-[#4edea3]">
              <span className="material-symbols-outlined text-[22px]">timer</span>
            </div>
            <div>
              <h2 className="font-headline text-sm sm:text-base font-bold text-[#dfe2ef]">
                Sunday Prep Protocol
              </h2>
              <span className="font-mono text-[11px] text-[#e5beb2]/70">
                Batch Cooking • 4 Servings Stored
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-[#262a34] px-3 py-1 rounded-full border border-white/5">
            <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse" />
            <span className="font-mono text-sm text-[#4edea3] font-bold">
              {formatTimer(prepSecondsRemaining)}
            </span>
          </div>
        </div>

        {/* Step Checklist */}
        <div className="flex flex-col gap-2 pt-3">
          {prepSteps.map((step) => (
            <div
              key={step.id}
              onClick={() => toggleStep(step.id)}
              className="flex items-center justify-between p-3 rounded-xl bg-[#1c1f29] hover:bg-[#262a34] cursor-pointer transition-colors border border-white/5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center text-xs transition-all ${
                    step.done
                      ? 'bg-[#4edea3] text-black font-bold'
                      : 'bg-[#262a34] border border-white/20 text-transparent'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px] font-bold">check</span>
                </div>
                <span
                  className={`text-xs sm:text-sm text-[#dfe2ef] truncate ${
                    step.done ? 'line-through opacity-60' : ''
                  }`}
                >
                  {step.text}
                </span>
              </div>
              <span
                className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  step.done
                    ? 'text-[#4edea3] bg-[#00a572]/20'
                    : step.status === 'In Oven'
                    ? 'text-[#ff5708] bg-[#ff5708]/20'
                    : 'text-[#e5beb2]/70 bg-white/5'
                }`}
              >
                {step.status}
              </span>
            </div>
          ))}
        </div>

        {/* Timer Controls */}
        <div className="flex items-center justify-between pt-3 mt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTimer}
              className="px-3.5 py-1.5 rounded-xl bg-[#262a34] hover:bg-[#31353f] text-[#dfe2ef] font-mono text-xs font-semibold flex items-center gap-1.5 active:scale-95 cursor-pointer border border-white/5"
            >
              {isTimerRunning ? <Pause className="w-3.5 h-3.5 text-[#ff5708]" /> : <Play className="w-3.5 h-3.5 text-[#4edea3]" />}
              <span>{isTimerRunning ? 'Pause Timer' : 'Resume Timer'}</span>
            </button>
            <button
              type="button"
              onClick={resetTimer}
              className="w-8 h-8 rounded-xl bg-[#262a34] hover:bg-[#31353f] text-[#e5beb2]/80 flex items-center justify-center active:scale-95 cursor-pointer border border-white/5"
              title="Reset timer to 45:00"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="font-mono text-[11px] text-[#e5beb2]/70">
            Efficiency: 92% • Batch 4x
          </span>
        </div>
      </section>

      {/* Supermarket Grocery Checklist Module */}
      <section className="flex flex-col gap-3 bg-[#1c1f29] rounded-2xl p-4 sm:p-5 shadow-xl border border-white/5">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#03b5d3]/20 flex items-center justify-center text-[#4cd7f6]">
              <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
            </div>
            <div>
              <h2 className="font-headline text-sm sm:text-base font-bold text-[#dfe2ef]">
                Supermarket Checklist
              </h2>
              <span className="font-mono text-[10px] text-[#e5beb2]/70">
                Sorted by Aisles • {groceries.filter((g) => g.checked).length} of {groceries.length} Checked
              </span>
            </div>
          </div>
          <span className="font-mono text-xs text-[#4cd7f6] font-bold">
            {Math.round((groceries.filter((g) => g.checked).length / groceries.length) * 100)}%
          </span>
        </div>

        {/* Grocery items checklist */}
        <div className="space-y-3 pt-1">
          {['Fresh Produce & Greens', 'Clean Protein & Seafood', 'Grains & Pantry Staples'].map((aisle) => {
            const aisleItems = groceries.filter((g) => g.aisle === aisle);
            return (
              <div key={aisle} className="space-y-1.5">
                <span className="font-mono text-[10px] text-[#4cd7f6] uppercase tracking-wider font-semibold block">
                  {aisle}
                </span>
                <div className="space-y-1">
                  {aisleItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleGrocery(item.id)}
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-[#262a34]/60 hover:bg-[#262a34] cursor-pointer transition-colors border border-white/5"
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center text-xs transition-all ${
                          item.checked
                            ? 'bg-[#4cd7f6] text-black font-bold'
                            : 'bg-[#181b25] border border-white/20 text-transparent'
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span
                        className={`text-xs text-[#dfe2ef] ${
                          item.checked ? 'line-through opacity-50' : ''
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
