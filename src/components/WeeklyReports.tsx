import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingDown, 
  Calendar, 
  Printer, 
  Download, 
  CheckCircle2, 
  Flame, 
  Sparkles, 
  Award, 
  Dumbbell, 
  Droplet,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { UserProfile, WeeklyMealPlan, WeeklyWorkoutPlan, FoodLogEntry, WaterLog } from '../types';

interface WeeklyReportsProps {
  profile: UserProfile;
  mealPlan: WeeklyMealPlan;
  workoutPlan: WeeklyWorkoutPlan;
  foodLogs: FoodLogEntry[];
  waterLog: WaterLog;
}

export const WeeklyReports: React.FC<WeeklyReportsProps> = ({
  profile,
  mealPlan,
  workoutPlan,
  foodLogs,
  waterLog,
}) => {
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Sample 7-day adherence mock history
  const weekData = [
    { day: 'Mon', calories: 1560, target: profile.targetCalories, protein: 142, water: 2500, workoutDone: true },
    { day: 'Tue', calories: 1575, target: profile.targetCalories, protein: 144, water: 2500, workoutDone: true },
    { day: 'Wed', calories: 1540, target: profile.targetCalories, protein: 138, water: 2750, workoutDone: true },
    { day: 'Thu', calories: 1580, target: profile.targetCalories, protein: 145, water: 2500, workoutDone: false },
    { day: 'Fri', calories: 1565, target: profile.targetCalories, protein: 141, water: 2250, workoutDone: true },
    { day: 'Sat', calories: 1590, target: profile.targetCalories, protein: 140, water: 2500, workoutDone: false },
    { day: 'Sun', calories: 1550, target: profile.targetCalories, protein: 143, water: 2500, workoutDone: true },
  ];

  const totalWeeklyCalories = weekData.reduce((acc, d) => acc + d.calories, 0);
  const avgCalories = Math.round(totalWeeklyCalories / 7);
  const avgProtein = Math.round(weekData.reduce((acc, d) => acc + d.protein, 0) / 7);
  const workoutsCompleted = weekData.filter((d) => d.workoutDone).length;
  const adherenceScore = 96;

  // Estimated fat loss (assuming 500 kcal daily deficit = 3500 kcal/wk = 0.45kg fat loss)
  const estimatedKgBurned = 0.45;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#ff5500]/15 text-[#ff7733] border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase mb-2">
              <BarChart3 className="w-3.5 h-3.5" />
              Weekly Metabolic Analytics
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Weekly Transformation Performance
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Consolidated biometric summary of your caloric intake, protein adherence, hydration metrics, and workout volume.
            </p>
          </div>

          <button
            onClick={() => setShowPrintModal(true)}
            className="bg-[#ff5500] hover:bg-[#ff6a1a] text-black font-extrabold text-xs sm:text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all shrink-0"
          >
            <Printer className="w-4 h-4 text-black" />
            <span>Printable Plan for 2026</span>
          </button>
        </div>
      </div>

      {/* High-Level Scorecards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4">
          <div className="text-[11px] uppercase font-bold text-slate-400">Adherence Grade</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-1 flex items-baseline gap-1">
            <span>A+</span>
            <span className="text-xs text-slate-400 font-normal">({adherenceScore}%)</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Near-perfect execution</div>
        </div>

        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4">
          <div className="text-[11px] uppercase font-bold text-slate-400">Avg Daily Calories</div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
            {avgCalories} <span className="text-xs font-normal text-slate-400">kcal</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">Target: {profile.targetCalories} kcal</div>
        </div>

        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4">
          <div className="text-[11px] uppercase font-bold text-slate-400">Avg Daily Protein</div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono mt-1">
            {avgProtein}g
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Target: {profile.proteinGrams}g</div>
        </div>

        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4">
          <div className="text-[11px] uppercase font-bold text-slate-400">Est. Fat Loss</div>
          <div className="text-2xl sm:text-3xl font-black text-[#ff5500] font-mono mt-1">
            -{estimatedKgBurned} <span className="text-xs font-normal text-slate-400">kg/wk</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Pure adipose tissue</div>
        </div>

      </div>

      {/* Visual Calorie Adherence Bar Chart */}
      <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-sm font-extrabold text-white">7-Day Caloric Intake vs Target Line</h3>
            <p className="text-xs text-slate-400">Orange dotted line indicates your {profile.targetCalories} kcal deficit goal.</p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 bg-emerald-500 rounded-sm"></span> On Target
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-0.5 bg-[#ff5500]"></span> Target ({profile.targetCalories})
            </span>
          </div>
        </div>

        {/* Bar chart visual */}
        <div className="relative pt-6 pb-2">
          {/* Target line */}
          <div className="absolute inset-x-0 top-1/2 border-b-2 border-dashed border-[#ff5500]/60 z-10 pointer-events-none">
            <span className="absolute -top-4 right-0 text-[10px] font-mono font-bold text-[#ff5500] bg-black/60 px-1.5 py-0.5 rounded">
              Target {profile.targetCalories} kcal
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 sm:gap-4 h-48 items-end">
            {weekData.map((d) => {
              const heightPercent = Math.min(100, Math.round((d.calories / 2000) * 100));
              const isCloseToTarget = Math.abs(d.calories - profile.targetCalories) <= 60;
              return (
                <div key={d.day} className="flex flex-col items-center h-full justify-end group">
                  <span className="text-[10px] font-mono font-bold text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                    {d.calories}
                  </span>
                  <div 
                    className={`w-full max-w-[40px] rounded-t-lg transition-all ${
                      isCloseToTarget ? 'bg-gradient-to-t from-emerald-600 to-emerald-400' : 'bg-gradient-to-t from-amber-600 to-amber-400'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-xs font-bold text-slate-300 mt-2 font-mono">
                    {d.day}
                  </span>
                  <span className="text-[9px] text-cyan-400 font-mono">
                    {d.protein}g P
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Macronutrient Distribution & Workout Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Macro Distribution */}
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-300">
            Macronutrient Ratio Adherence
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-cyan-400">Protein (35%)</span>
                <span className="text-white font-mono">{profile.proteinGrams}g / day</span>
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: '98%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-amber-400">Complex Carbs (40%)</span>
                <span className="text-white font-mono">{profile.carbsGrams}g / day</span>
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-rose-400">Essential Fats (25%)</span>
                <span className="text-white font-mono">{profile.fatGrams}g / day</span>
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-400 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 bg-black/40 p-3 rounded-xl border border-white/5">
            Your high-protein distribution maintains a positive nitrogen balance to avoid catabolic muscle breakdown while operating at your 1,573 kcal shred target.
          </p>
        </div>

        {/* Workout Discipline */}
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-300">
              Workout Consistency
            </h3>
            <span className="text-xs font-bold text-orange-400 font-mono">
              {workoutsCompleted} of 5 Sessions Done
            </span>
          </div>

          <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Target: 15-30 Min Short High-Yield Sets</div>
                <div className="text-xs text-slate-400">Progressive overload applied to chest, back, legs & core.</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-800/60 p-3 rounded-xl border border-white/5">
              <span className="text-slate-400 block mb-0.5">Hydration Adherence</span>
              <span className="text-base font-bold text-cyan-400 font-mono">98% (2.5L/day)</span>
            </div>
            <div className="bg-slate-800/60 p-3 rounded-xl border border-white/5">
              <span className="text-slate-400 block mb-0.5">Meal Prep Compliance</span>
              <span className="text-base font-bold text-emerald-400 font-mono">100% Home Cooked</span>
            </div>
          </div>
        </div>

      </div>

      {/* Printable Plan Modal (Screenshot 4 replica) */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-[#121620] border border-white/15 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
            
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="bg-[#ff5500] text-black font-extrabold px-2 py-0.5 rounded text-xs uppercase tracking-tight inline-block mb-1">
                  NUTRIPULSE
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">Printable Plan for 2026</h2>
                <p className="text-xs text-slate-400">
                  Comprehensive 7-day training & meal prep blueprint for {profile.name} ({profile.targetCalories} kcal / 2.5L Water)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="bg-[#ff5500] hover:bg-[#ff6a1a] text-black font-bold text-xs py-2 px-3.5 rounded-lg flex items-center gap-1.5 shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Schedule Content */}
            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workoutPlan.days.map((day) => (
                  <div key={day.dayName} className="p-3 bg-black/40 rounded-xl border border-white/10 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-[#ff5500] uppercase">{day.dayName}</span>
                      <span className="font-mono text-slate-400">{day.isRestDay ? 'Rest' : `${day.durationMinutes} min`}</span>
                    </div>
                    <div className="font-bold text-white">{day.focus}</div>
                    {!day.isRestDay && (
                      <ul className="text-slate-400 list-disc list-inside space-y-0.5 text-[11px]">
                        {day.exercises.map((ex, i) => (
                          <li key={i}>{ex.name} ({ex.sets}x{ex.reps})</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              {/* Meal Prep Summary Section */}
              <div className="p-4 bg-black/40 rounded-xl border border-white/10 space-y-2 text-xs">
                <h4 className="font-bold text-white uppercase text-xs text-orange-400">Weekly Nutrition Targets</h4>
                <div className="grid grid-cols-4 gap-2 font-mono text-center">
                  <div className="bg-slate-900 p-2 rounded">Cals: <strong>{profile.targetCalories}</strong></div>
                  <div className="bg-slate-900 p-2 rounded">Protein: <strong>{profile.proteinGrams}g</strong></div>
                  <div className="bg-slate-900 p-2 rounded">Carbs: <strong>{profile.carbsGrams}g</strong></div>
                  <div className="bg-slate-900 p-2 rounded">Fat: <strong>{profile.fatGrams}g</strong></div>
                </div>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2 px-4 rounded-xl"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
