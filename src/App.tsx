import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { AiPhotoScanner } from './components/AiPhotoScanner';
import { MealPrepPlanner } from './components/MealPrepPlanner';
import { WaterTracker } from './components/WaterTracker';
import { WorkoutPlanner } from './components/WorkoutPlanner';
import { StreaksAndMilestones } from './components/StreaksAndMilestones';
import { WeeklyReports } from './components/WeeklyReports';
import { ProfileModal } from './components/ProfileModal';
import { ManualFoodModal } from './components/ManualFoodModal';

import { 
  UserProfile, 
  FoodLogEntry, 
  WaterLog, 
  WaterReminder, 
  WeeklyMealPlan, 
  WeeklyWorkoutPlan, 
  StreakState, 
  Milestone,
  WeightLogEntry
} from './types';

import { 
  initialProfile, 
  defaultWeeklyMealPlan, 
  defaultWeeklyWorkoutPlan, 
  defaultMilestones, 
  defaultWaterReminders, 
  initialFoodLogs,
  initialWeightLogs
} from './data/mockData';
import { calculateBMI } from './utils/calculator';
import { sounds } from './utils/sound';
import { User } from 'firebase/auth';
import { initAuth } from './utils/auth';

export default function App() {
  // 1. User Profile State (persisted in LocalStorage)
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('nutripulse_profile');
    return saved ? JSON.parse(saved) : initialProfile;
  });

  // 2. Active Tab State
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Google OAuth User State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setCurrentUser(user);
        if (user?.displayName) {
          setProfile((prev) => ({
            ...prev,
            name: user.displayName || prev.name,
          }));
        }
      },
      () => {
        setCurrentUser(null);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // 3. Modals State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualMealType, setManualMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');

  // 4. Food Journal Logs (Today's entries)
  const [foodLogs, setFoodLogs] = useState<FoodLogEntry[]>(() => {
    const saved = localStorage.getItem('nutripulse_food_logs');
    return saved ? JSON.parse(saved) : initialFoodLogs;
  });

  // 5. Water Log State
  const [waterLog, setWaterLog] = useState<WaterLog>(() => {
    const saved = localStorage.getItem('nutripulse_water_log');
    return saved ? JSON.parse(saved) : {
      date: new Date().toISOString().slice(0, 10),
      intakeMl: 1750, // 7 glasses of 250ml
      targetMl: initialProfile.waterTargetMl,
      logs: [{ time: '08:30 AM', amountMl: 500 }, { time: '11:45 AM', amountMl: 250 }, { time: '01:30 PM', amountMl: 500 }, { time: '03:15 PM', amountMl: 500 }],
    };
  });

  // 6. Water Reminders State
  const [reminders, setReminders] = useState<WaterReminder[]>(() => {
    const saved = localStorage.getItem('nutripulse_water_reminders');
    return saved ? JSON.parse(saved) : defaultWaterReminders;
  });

  // 7. Weekly Meal Plan State
  const [mealPlan, setMealPlan] = useState<WeeklyMealPlan>(() => {
    const saved = localStorage.getItem('nutripulse_meal_plan');
    return saved ? JSON.parse(saved) : defaultWeeklyMealPlan;
  });

  // 8. Weekly Workout Plan State
  const [workoutPlan, setWorkoutPlan] = useState<WeeklyWorkoutPlan>(() => {
    const saved = localStorage.getItem('nutripulse_workout_plan');
    return saved ? JSON.parse(saved) : defaultWeeklyWorkoutPlan;
  });

  // 9. Streaks & Gamification State
  const [streaks, setStreaks] = useState<StreakState>(() => {
    const saved = localStorage.getItem('nutripulse_streaks');
    return saved ? JSON.parse(saved) : {
      foodStreak: 4,
      waterStreak: 5,
      workoutStreak: 3,
      totalXp: 670,
      level: 3,
      lastActiveDate: new Date().toISOString().slice(0, 10),
    };
  });

  // 10. Milestones State
  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    const saved = localStorage.getItem('nutripulse_milestones');
    return saved ? JSON.parse(saved) : defaultMilestones;
  });

  // 11. Weight Tracker Logs State
  const [weightLogs, setWeightLogs] = useState<WeightLogEntry[]>(() => {
    const saved = localStorage.getItem('nutripulse_weight_logs');
    return saved ? JSON.parse(saved) : initialWeightLogs;
  });

  // LocalStorage synchronizations
  useEffect(() => {
    localStorage.setItem('nutripulse_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('nutripulse_food_logs', JSON.stringify(foodLogs));
  }, [foodLogs]);

  useEffect(() => {
    localStorage.setItem('nutripulse_water_log', JSON.stringify(waterLog));
  }, [waterLog]);

  useEffect(() => {
    localStorage.setItem('nutripulse_water_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('nutripulse_meal_plan', JSON.stringify(mealPlan));
  }, [mealPlan]);

  useEffect(() => {
    localStorage.setItem('nutripulse_workout_plan', JSON.stringify(workoutPlan));
  }, [workoutPlan]);

  useEffect(() => {
    localStorage.setItem('nutripulse_streaks', JSON.stringify(streaks));
  }, [streaks]);

  useEffect(() => {
    localStorage.setItem('nutripulse_milestones', JSON.stringify(milestones));
  }, [milestones]);

  useEffect(() => {
    localStorage.setItem('nutripulse_weight_logs', JSON.stringify(weightLogs));
  }, [weightLogs]);

  // Handlers for Weight Tracking
  const handleAddWeightLog = (entry: Omit<WeightLogEntry, 'id'>) => {
    const newLog: WeightLogEntry = {
      ...entry,
      id: `w-${Date.now()}`,
    };
    setWeightLogs((prev) => [...prev, newLog]);

    // Recalculate BMI and update current profile weight
    const { bmi, category } = calculateBMI(entry.weightKg, profile.heightCm);
    setProfile((prev) => ({
      ...prev,
      weightKg: entry.weightKg,
      bmi,
      bmiCategory: category,
    }));

    // Award XP
    setStreaks((prev) => ({
      ...prev,
      totalXp: prev.totalXp + 25,
    }));
  };

  const handleDeleteWeightLog = (id: string) => {
    sounds.playWaterDrop();
    setWeightLogs((prev) => prev.filter((w) => w.id !== id));
  };

  const handleUpdateGoalWeight = (newGoalKg: number) => {
    setProfile((prev) => ({
      ...prev,
      targetWeightKg: newGoalKg,
    }));
  };

  // Handlers for Food Logging
  const handleAddMeal = (mealData: Omit<FoodLogEntry, 'id' | 'loggedAt' | 'date'>) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newEntry: FoodLogEntry = {
      ...mealData,
      id: `food-${Date.now()}`,
      loggedAt: timeStr,
      date: now.toISOString().slice(0, 10),
    };

    setFoodLogs((prev) => [newEntry, ...prev]);

    // Award XP
    setStreaks((prev) => ({
      ...prev,
      totalXp: prev.totalXp + 35,
    }));
  };

  const handleDeleteFoodLog = (id: string) => {
    sounds.playWaterDrop();
    setFoodLogs((prev) => prev.filter((item) => item.id !== id));
  };

  const handleOpenManualFoodModal = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    setManualMealType(mealType);
    setIsManualModalOpen(true);
  };

  // Handlers for Water Logging
  const handleAddWater = (amountMl: number) => {
    setWaterLog((prev) => {
      const newIntake = Math.max(0, prev.intakeMl + amountMl);
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return {
        ...prev,
        intakeMl: newIntake,
        logs: [{ time: now, amountMl }, ...prev.logs],
      };
    });

    if (amountMl > 0) {
      setStreaks((prev) => ({
        ...prev,
        totalXp: prev.totalXp + 10,
      }));
    }
  };

  const handleResetWater = () => {
    sounds.playWaterDrop();
    setWaterLog((prev) => ({
      ...prev,
      intakeMl: 0,
      logs: [],
    }));
  };

  const handleToggleReminder = (id: string) => {
    sounds.playWaterDrop();
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleUpdateReminderTime = (id: string, newTime: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, time: newTime } : r))
    );
  };

  // Workout Completion
  const handleCompleteWorkout = (dayNumber: number) => {
    setStreaks((prev) => ({
      ...prev,
      workoutStreak: prev.workoutStreak + 1,
      totalXp: prev.totalXp + 150,
      level: Math.floor((prev.totalXp + 150) / 250) + 1,
    }));
  };

  return (
    <div className="min-h-screen bg-[#090d16] bg-mesh text-slate-100 flex flex-col selection:bg-orange-500 selection:text-black">
      
      {/* Sticky Header with NutriPulse styling */}
      <Header
        profile={profile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        streaks={streaks}
        waterLog={waterLog}
        currentUser={currentUser}
        onUserChanged={(user) => {
          setCurrentUser(user);
          if (user?.displayName) {
            setProfile((p) => ({ ...p, name: user.displayName || p.name }));
          }
        }}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Main App Content View Switcher */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {activeTab === 'dashboard' && (
          <Dashboard
            profile={profile}
            foodLogs={foodLogs}
            waterLog={waterLog}
            mealPlan={mealPlan}
            workoutPlan={workoutPlan}
            streaks={streaks}
            weightLogs={weightLogs}
            onNavigateTab={setActiveTab}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onOpenManualFoodModal={handleOpenManualFoodModal}
            onDeleteFoodLog={handleDeleteFoodLog}
            onAddWater={handleAddWater}
            onAddWeightLog={handleAddWeightLog}
            onDeleteWeightLog={handleDeleteWeightLog}
            onUpdateGoalWeight={handleUpdateGoalWeight}
            onQuickLogPlannedMeal={(recipe) => {
              handleAddMeal({
                mealType: recipe.type.toLowerCase(),
                title: recipe.name,
                calories: recipe.calories,
                protein: recipe.protein,
                carbs: recipe.carbs,
                fat: recipe.fat,
                fiber: 5,
                healthScore: 9.3,
                dietaryTags: ['Weekly Meal Prep'],
              });
            }}
          />
        )}

        {activeTab === 'scanner' && (
          <AiPhotoScanner
            onAddMealLog={handleAddMeal}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'mealprep' && (
          <MealPrepPlanner
            profile={profile}
            mealPlan={mealPlan}
            onUpdateMealPlan={setMealPlan}
            onLogMeal={handleAddMeal}
          />
        )}

        {activeTab === 'water' && (
          <WaterTracker
            profile={profile}
            waterLog={waterLog}
            reminders={reminders}
            onAddWater={handleAddWater}
            onResetWater={handleResetWater}
            onToggleReminder={handleToggleReminder}
            onUpdateReminderTime={handleUpdateReminderTime}
          />
        )}

        {activeTab === 'workout' && (
          <WorkoutPlanner
            profile={profile}
            workoutPlan={workoutPlan}
            onUpdateWorkoutPlan={setWorkoutPlan}
            onCompleteWorkout={handleCompleteWorkout}
          />
        )}

        {activeTab === 'streaks' && (
          <StreaksAndMilestones
            streaks={streaks}
            milestones={milestones}
          />
        )}

        {activeTab === 'reports' && (
          <WeeklyReports
            profile={profile}
            mealPlan={mealPlan}
            workoutPlan={workoutPlan}
            foodLogs={foodLogs}
            waterLog={waterLog}
          />
        )}

      </main>

      {/* Modals */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onUpdateProfile={(updated) => {
          setProfile(updated);
          // Also sync water target in water log if needed
          setWaterLog((w) => ({ ...w, targetMl: updated.waterTargetMl }));
        }}
      />

      <ManualFoodModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onAddMeal={handleAddMeal}
        defaultMealType={manualMealType}
      />

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 pb-28 md:pb-8 bg-[#0a0e17] text-center text-xs text-[#e5beb2]/50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-headline font-bold text-[#dfe2ef]">NutriPulse Pro</span>
            <span className="text-[#ff5708] font-mono">• AI Diet & Workout Engine</span>
          </div>
          <div className="font-mono text-[11px] text-[#e5beb2]/40">
            Multimodal Food Recognition • Automated Meal Prep • Biometric Trajectory
          </div>
        </div>
      </footer>

      {/* Stitch Fixed Mobile Bottom Navigation Bar */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-50 pb-safe bg-[#0a0e17]/90 backdrop-blur-xl border-t border-white/5 shadow-[0_-8px_32px_rgba(0,0,0,0.6)]"
      >
        <div className="flex justify-around items-center h-16 sm:h-20 px-3 max-w-lg mx-auto">
          {/* Today / Dashboard */}
          <button
            type="button"
            onClick={() => {
              sounds.tap();
              setActiveTab('dashboard');
            }}
            className={`flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[44px] transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'text-[#ff5708] drop-shadow-[0_0_12px_rgba(255,87,8,0.5)] font-bold'
                : 'text-[#e5beb2]/60 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">vital_signs</span>
            <span className="font-mono text-[10px] tracking-wide">Today</span>
          </button>

          {/* Elevated Floating Camera Scan AI Button */}
          <button
            type="button"
            onClick={() => {
              sounds.camera();
              setActiveTab('scanner');
            }}
            className="flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[44px] -mt-5 group cursor-pointer"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-[0_0_24px_rgba(255,87,8,0.45)] ${
              activeTab === 'scanner'
                ? 'bg-[#ff5708] text-white ring-2 ring-[#ffdbcf]'
                : 'bg-gradient-to-tr from-[#ff5708] to-[#ff8c42] text-white hover:scale-105'
            }`}>
              <span className="material-symbols-outlined text-[24px]">photo_camera</span>
            </div>
            <span className={`font-mono text-[10px] font-bold tracking-wide mt-0.5 ${
              activeTab === 'scanner' ? 'text-[#ff5708]' : 'text-[#dfe2ef] group-hover:text-[#ff5708]'
            }`}>
              Scan AI
            </span>
          </button>

          {/* Meals & Prep */}
          <button
            type="button"
            onClick={() => {
              sounds.tap();
              setActiveTab('mealprep');
            }}
            className={`flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[44px] transition-all cursor-pointer ${
              activeTab === 'mealprep'
                ? 'text-[#ff5708] drop-shadow-[0_0_12px_rgba(255,87,8,0.5)] font-bold'
                : 'text-[#e5beb2]/60 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">restaurant_menu</span>
            <span className="font-mono text-[10px] tracking-wide">Meals</span>
          </button>

          {/* Workouts */}
          <button
            type="button"
            onClick={() => {
              sounds.tap();
              setActiveTab('workout');
            }}
            className={`flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[44px] transition-all cursor-pointer ${
              activeTab === 'workout'
                ? 'text-[#ff5708] drop-shadow-[0_0_12px_rgba(255,87,8,0.5)] font-bold'
                : 'text-[#e5beb2]/60 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">fitness_center</span>
            <span className="font-mono text-[10px] tracking-wide">Workouts</span>
          </button>
        </div>
      </nav>

    </div>
  );
}
