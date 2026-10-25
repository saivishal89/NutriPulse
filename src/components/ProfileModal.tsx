import React, { useState } from 'react';
import { 
  X, 
  Check, 
  ArrowRight, 
  TrendingDown, 
  Droplets, 
  Flame, 
  Dumbbell, 
  Clock, 
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';
import { UserProfile, FitnessGoal, DietaryPreference, ActivityLevel, EquipmentType } from '../types';
import { calculateNutritionTargets, calculateBMI } from '../utils/calculator';
import { sounds } from '../utils/sound';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onRegenerateAllPlans?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onRegenerateAllPlans,
}) => {
  if (!isOpen) return null;

  // Local state for editing
  const [age, setAge] = useState(profile.age);
  const [gender, setGender] = useState(profile.gender);
  const [heightCm, setHeightCm] = useState(profile.heightCm);
  const [weightKg, setWeightKg] = useState(profile.weightKg);
  const [targetWeightKg, setTargetWeightKg] = useState(profile.targetWeightKg);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activityLevel);
  const [goal, setGoal] = useState<FitnessGoal>(profile.goal);
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>(profile.dietaryPreference);
  const [equipment, setEquipment] = useState<EquipmentType>(profile.equipment);
  const [customCalories, setCustomCalories] = useState(profile.targetCalories);
  const [isCalorieCustom, setIsCalorieCustom] = useState(false);
  const [allergies, setAllergies] = useState(profile.allergies || '');
  const [allergiesList, setAllergiesList] = useState<string[]>(profile.allergiesList || []);
  const [foodDislikes, setFoodDislikes] = useState(profile.foodDislikes || '');
  const [cuisinePreference, setCuisinePreference] = useState(profile.cuisinePreference || 'Indian');
  const [dailyBudget, setDailyBudget] = useState<'budget' | 'moderate' | 'premium'>(profile.dailyBudget || 'moderate');
  const [cookingTimeMinutes, setCookingTimeMinutes] = useState(profile.cookingTimeMinutes || 30);
  const [mealsPerDay, setMealsPerDay] = useState(profile.mealsPerDay || 4);

  const commonAllergens = [
    'Peanuts',
    'Tree Nuts',
    'Dairy / Lactose',
    'Gluten / Wheat',
    'Shellfish',
    'Eggs',
    'Soy',
    'Fish',
    'Sesame'
  ];

  const toggleAllergen = (item: string) => {
    setAllergiesList(prev => 
      prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
    );
  };

  // Calculate live dynamic metrics
  const calculated = calculateNutritionTargets({
    age,
    gender,
    heightCm,
    weightKg,
    activityLevel,
    goal,
    dietaryPreference,
  });

  const displayCalories = isCalorieCustom ? customCalories : calculated.targetCalories;

  // Calculate BMI gauge percentage for the visual bar (range 15 to 40)
  const bmiClamped = Math.min(40, Math.max(15, calculated.bmi));
  const bmiPercentage = Math.round(((bmiClamped - 15) / (40 - 15)) * 100);

  const handleSave = () => {
    sounds.playSuccessChime();
    const updated: UserProfile = {
      ...profile,
      age,
      gender,
      heightCm,
      weightKg,
      targetWeightKg,
      activityLevel,
      goal,
      dietaryPreference,
      equipment,
      allergies,
      allergiesList,
      foodDislikes,
      cuisinePreference,
      dailyBudget,
      cookingTimeMinutes,
      mealsPerDay,
      targetCalories: displayCalories,
      proteinGrams: calculated.proteinGrams,
      carbsGrams: calculated.carbsGrams,
      fatGrams: calculated.fatGrams,
      fiberGrams: calculated.fiberGrams,
      waterTargetMl: calculated.waterTargetMl,
      bmi: calculated.bmi,
      bmiCategory: calculated.bmiCategory,
      nowBodyFat: calculated.nowBodyFat,
      goalBodyFat: calculated.goalBodyFat,
      nowMuscleBars: calculated.nowMuscleBars,
      goalMuscleBars: calculated.goalMuscleBars,
    };
    onUpdateProfile(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-[#121620] border border-white/15 rounded-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Modal Top Header with NutriPulse badge */}
        <div className="sticky top-0 z-10 bg-[#121620]/95 backdrop-blur-md px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#ff5500] text-black font-black px-2 py-0.5 rounded text-xs uppercase tracking-tight">
              NUTRIPULSE
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white">Your Health Profile & Transformation</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          
          {/* 1. VISUAL TRANSFORMATION SECTION (Matching Screenshot 2) */}
          <div className="bg-slate-900/90 border border-white/10 rounded-xl p-4 sm:p-5">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-3 text-center">
              Target Transformation Roadmap
            </h3>

            <div className="grid grid-cols-2 gap-4 divide-x divide-white/10">
              
              {/* NOW COLUMN */}
              <div className="text-center pr-2">
                <div className="inline-block px-3 py-1 bg-slate-800 text-slate-300 font-bold text-xs uppercase rounded-full mb-3">
                  Now
                </div>
                {/* Visual Avatar / Physique Representation */}
                <div className="h-28 flex items-center justify-center">
                  <div className="relative w-20 h-28 bg-gradient-to-b from-amber-900/40 to-slate-800/80 rounded-2xl border border-amber-500/20 flex flex-col items-center justify-center p-2 shadow-inner">
                    <div className="w-9 h-9 rounded-full bg-amber-400/30 border border-amber-400/40 mb-1 flex items-center justify-center text-xs font-bold text-amber-200">
                      NOW
                    </div>
                    <div className="w-12 h-10 bg-amber-600/30 rounded-lg border border-amber-500/30"></div>
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-left">
                  <div>
                    <div className="text-[11px] text-slate-400 font-medium">Body fat</div>
                    <div className="text-base sm:text-lg font-bold text-[#ff5500] font-mono">
                      {calculated.nowBodyFat}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 font-medium">Body muscles</div>
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((bar) => (
                        <div 
                          key={bar} 
                          className={`h-2 flex-1 rounded-sm ${
                            bar <= calculated.nowMuscleBars ? 'bg-[#ff5500]' : 'bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* YOUR GOAL COLUMN */}
              <div className="text-center pl-4">
                <div className="inline-block px-3 py-1 bg-[#ff5500]/20 text-[#ff7733] font-bold text-xs uppercase rounded-full mb-3 border border-orange-500/30">
                  Your Goal
                </div>
                {/* Visual Lean Muscle Avatar */}
                <div className="h-28 flex items-center justify-center">
                  <div className="relative w-20 h-28 bg-gradient-to-b from-emerald-950/40 to-cyan-950/40 rounded-2xl border border-emerald-500/40 flex flex-col items-center justify-center p-2 shadow-lg shadow-emerald-500/10">
                    <div className="w-9 h-9 rounded-full bg-emerald-400/30 border border-emerald-400/50 mb-1 flex items-center justify-center text-xs font-bold text-emerald-200">
                      FIT
                    </div>
                    <div className="w-10 h-10 bg-emerald-500/30 rounded-lg border border-emerald-400/40"></div>
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-left">
                  <div>
                    <div className="text-[11px] text-slate-400 font-medium">Body fat</div>
                    <div className="text-base sm:text-lg font-bold text-emerald-400 font-mono">
                      {calculated.goalBodyFat}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 font-medium">Body muscles</div>
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((bar) => (
                        <div 
                          key={bar} 
                          className={`h-2 flex-1 rounded-sm ${
                            bar <= calculated.goalMuscleBars ? 'bg-emerald-400' : 'bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <p className="text-[10px] text-slate-400 text-center mt-4">
              *Calculated based on your physiological data, Mifflin-St Jeor TDEE equations, and personalized caloric deficit.
            </p>
          </div>

          {/* 2. BMI & HEALTH GAUGES (Matching Screenshot 3) */}
          <div className="space-y-4">
            
            {/* BMI Card */}
            <div className="bg-slate-900/90 border border-white/10 rounded-xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Current BMI</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                  calculated.bmiCategory === 'Normal' ? 'bg-emerald-500/20 text-emerald-300' :
                  calculated.bmiCategory === 'Overweight' ? 'bg-orange-500/20 text-orange-400' :
                  calculated.bmiCategory === 'Obese' ? 'bg-rose-500/20 text-rose-400' :
                  'bg-blue-500/20 text-blue-300'
                }`}>
                  {calculated.bmiCategory}
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mb-3">
                {calculated.bmi} <span className="text-sm font-normal text-slate-400">BMI</span>
              </div>

              {/* Gradient Color Spectrum Bar */}
              <div className="relative pt-1 pb-4">
                <div className="h-3 w-full rounded-full bg-gradient-to-r from-blue-500 via-emerald-400 via-amber-400 to-rose-500 shadow-inner"></div>
                {/* Pointer Indicator */}
                <div 
                  className="absolute top-0 -ml-2 transition-all duration-300"
                  style={{ left: `${bmiPercentage}%` }}
                >
                  <div className="w-4 h-4 bg-white border-2 border-slate-900 rounded-full shadow-md"></div>
                  <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-white mx-auto"></div>
                </div>
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
                <span>Underweight (&lt;18.5)</span>
                <span>Normal (18.5-24.9)</span>
                <span>Overweight (25-29.9)</span>
                <span>Obese (&gt;30)</span>
              </div>
              <p className="text-xs text-slate-400 mt-3 bg-white/5 p-2.5 rounded-lg border border-white/5">
                The body mass index (BMI) uses your height ({heightCm}cm) and weight ({weightKg}kg) to formulate optimal caloric expenditure and safe weight management.
              </p>
            </div>

            {/* Daily Calorie Intake Slider (Matching Screenshot 3) */}
            <div className="bg-slate-900/90 border border-white/10 rounded-xl p-4 sm:p-5 relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🍔</span>
                  <div>
                    <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 block">Daily Calorie Intake</span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                      {displayCalories} <span className="text-sm font-normal text-slate-400">kcal</span>
                    </span>
                  </div>
                </div>
                <div className="border border-[#ff5500]/60 bg-[#ff5500]/10 text-[#ff7733] text-[11px] font-bold px-2 py-0.5 rounded uppercase">
                  recommended
                </div>
              </div>

              {/* Slider (1000 - 5000 kcal) */}
              <div className="mt-4">
                <input 
                  type="range"
                  min="1000"
                  max="4500"
                  step="25"
                  value={displayCalories}
                  onChange={(e) => {
                    setIsCalorieCustom(true);
                    setCustomCalories(parseInt(e.target.value, 10));
                  }}
                  className="w-full accent-[#ff5500] cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1 font-mono">
                  <span>1000 kcal</span>
                  <span className="text-orange-400 font-bold">{displayCalories} kcal</span>
                  <span>4500 kcal</span>
                </div>
              </div>

              {isCalorieCustom && (
                <button 
                  onClick={() => setIsCalorieCustom(false)}
                  className="mt-2 text-xs text-orange-400 hover:underline"
                >
                  Reset to recommended ({calculated.targetCalories} kcal)
                </button>
              )}
            </div>

            {/* Daily Water Intake (Matching Screenshot 1 & 3) */}
            <div className="bg-slate-900/90 border border-white/10 rounded-xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 block">Daily Water Intake</span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                      {(calculated.waterTargetMl / 1000).toFixed(1)} <span className="text-sm font-normal text-slate-400">l</span>
                    </span>
                  </div>
                </div>
                <div className="border border-[#ff5500]/60 bg-[#ff5500]/10 text-[#ff7733] text-[11px] font-bold px-2 py-0.5 rounded uppercase">
                  recommended
                </div>
              </div>

              {/* 8-10 Visual Glass Representation (Matching Screenshot 1) */}
              <div className="flex items-center justify-between gap-1 mt-4 p-3 bg-black/40 rounded-xl border border-white/5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((glassIndex) => (
                  <div key={glassIndex} className="flex flex-col items-center">
                    <div className="w-6 h-8 border-2 border-cyan-400/40 rounded-b-md relative overflow-hidden bg-cyan-950/20">
                      <div className="absolute inset-x-0 bottom-0 h-5 bg-cyan-400/80"></div>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono mt-1">{glassIndex}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* 3. PHYSICAL METRICS EDITING FORM */}
          <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 sm:p-5 space-y-4">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-300 flex items-center gap-2">
              <Info className="w-4 h-4 text-orange-400" />
              Physique & Training Inputs
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">Age</label>
                <input 
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Math.max(16, parseInt(e.target.value) || 28))}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">Gender</label>
                <select 
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:border-orange-500 focus:outline-none"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">Height (cm)</label>
                <input 
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Math.max(120, parseInt(e.target.value) || 178))}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">Current Weight (kg)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Math.max(35, parseFloat(e.target.value) || 88.8))}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">Fitness Goal</label>
                <select 
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as FitnessGoal)}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white text-xs sm:text-sm focus:border-orange-500 focus:outline-none"
                >
                  <option value="shred">Fat Shred & Cut (Lean Physique)</option>
                  <option value="build_muscle">Hypertrophy & Muscle Build</option>
                  <option value="recomp">Body Recomposition & Tone</option>
                  <option value="endurance">Athletic Stamina & Performance</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">Dietary Preference</label>
                <select 
                  value={dietaryPreference}
                  onChange={(e) => setDietaryPreference(e.target.value as DietaryPreference)}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white text-xs sm:text-sm focus:border-orange-500 focus:outline-none"
                >
                  <option value="vegetarian">Vegetarian (Lacto-Vegetarian)</option>
                  <option value="vegan">Pure Vegan (100% Plant-Based)</option>
                  <option value="eggetarian">Eggetarian (Vegetarian + Eggs)</option>
                  <option value="non-vegetarian">Non-Vegetarian (Omnivore)</option>
                  <option value="high_protein">High Protein Athletic</option>
                  <option value="balanced">Balanced Whole Foods</option>
                  <option value="keto">Ketogenic (Ultra Low Carb)</option>
                  <option value="low_carb">Low Carb High Fat</option>
                  <option value="mediterranean">Mediterranean Heart-Healthy</option>
                  <option value="pescatarian">Pescatarian (Fish & Seafood)</option>
                  <option value="paleo">Paleo Clean Eating</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">Equipment</label>
                <select 
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value as EquipmentType)}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white text-xs sm:text-sm focus:border-orange-500 focus:outline-none"
                >
                  <option value="gym">Full Gym Access</option>
                  <option value="home_dumbbells">Home Dumbbells & Bench</option>
                  <option value="bodyweight">Bodyweight / Calisthenics</option>
                </select>
              </div>
            </div>

            {/* Lifestyle, Cuisine & Prep Preferences */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/5">
              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">Cuisine Style</label>
                <select 
                  value={cuisinePreference}
                  onChange={(e) => setCuisinePreference(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white text-xs sm:text-sm focus:border-orange-500 focus:outline-none"
                >
                  <option value="Indian">Indian (Dal, Roti, Paneer, Sabzi)</option>
                  <option value="South Indian">South Indian (Idli, Dosa, Sambar, Fish)</option>
                  <option value="North Indian">North Indian (Tandoori, Rajma, Curries)</option>
                  <option value="Mediterranean">Mediterranean (Olive oil, Feta, Greens)</option>
                  <option value="Western">Western / Continental (Oats, Grills, Bowls)</option>
                  <option value="East Asian">East Asian (Tofu, Stir-fry, Edamame)</option>
                  <option value="Universal">Universal / Diverse</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">Meals Per Day</label>
                <select 
                  value={mealsPerDay}
                  onChange={(e) => setMealsPerDay(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white text-xs sm:text-sm focus:border-orange-500 focus:outline-none"
                >
                  <option value={2}>2 Meals (Intermittent Fasting)</option>
                  <option value={3}>3 Main Meals</option>
                  <option value={4}>4 Meals (3 Meals + 1 Snack)</option>
                  <option value={5}>5 Small Frequent Meals</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">Available Cooking Time</label>
                <select 
                  value={cookingTimeMinutes}
                  onChange={(e) => setCookingTimeMinutes(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white text-xs sm:text-sm focus:border-orange-500 focus:outline-none"
                >
                  <option value={15}>15 mins (Quick / Minimal Prep)</option>
                  <option value={30}>30 mins (Moderate Home Cooking)</option>
                  <option value={45}>45 mins (Batch Cooking Enthusiast)</option>
                  <option value={60}>60+ mins (Gourmet / Deep Prep)</option>
                </select>
              </div>
            </div>

            {/* Strict Food Allergies Checklist */}
            <div className="pt-2 border-t border-white/5 space-y-2">
              <label className="text-[11px] text-slate-400 font-semibold block">
                Strict Food Allergies (Excluded completely from all AI recipes)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {commonAllergens.map((allergen) => {
                  const isChecked = allergiesList.includes(allergen);
                  return (
                    <button
                      key={allergen}
                      type="button"
                      onClick={() => toggleAllergen(allergen)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                        isChecked
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                          : 'bg-slate-800/80 text-slate-400 border border-white/5 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <span>{isChecked ? '✕' : '+'}</span>
                      <span>{allergen}</span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Other specific allergies</label>
                  <input 
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="e.g. Mustard, Kiwi, MSG..."
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Disliked ingredients to avoid</label>
                  <input 
                    type="text"
                    value={foodDislikes}
                    onChange={(e) => setFoodDislikes(e.target.value)}
                    placeholder="e.g. Cilantro, Bitter gourd, Mushrooms..."
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Scientific BMR & TDEE Transparency Box */}
            <div className="p-3 bg-slate-800/40 rounded-xl border border-white/5 text-[11px] text-slate-400 space-y-1">
              <div className="flex justify-between font-mono text-slate-300">
                <span>Mifflin-St Jeor Basal Metabolic Rate (BMR):</span>
                <span className="font-bold text-white">{calculated.bmr} kcal/day</span>
              </div>
              <div className="flex justify-between font-mono text-slate-300">
                <span>Total Daily Energy Expenditure (TDEE):</span>
                <span className="font-bold text-white">{calculated.tdee} kcal/day</span>
              </div>
              <div className="flex justify-between font-mono text-orange-300 font-semibold pt-1 border-t border-white/5">
                <span>Target Intake for Goal ({goal}):</span>
                <span>{displayCalories} kcal/day</span>
              </div>
            </div>
          </div>

          {/* 4. "WHAT YOU GET" BANNER (Matching Screenshot 1) */}
          <div className="bg-black/40 border border-white/10 rounded-xl p-4 sm:p-5 space-y-3">
            <h3 className="text-sm sm:text-base font-extrabold text-white">What you get:</h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center shrink-0 text-orange-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-200">A structured workout plan</h4>
                  <p className="text-[11px] text-slate-400">Tailored to your age, body type, and wellness goals.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center shrink-0 text-cyan-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-200">15-30 minutes a day plan</h4>
                  <p className="text-[11px] text-slate-400">Designed to build muscle and shed weight rapidly without burnout.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center shrink-0 text-emerald-400">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-200">Step-by-step approach</h4>
                  <p className="text-[11px] text-slate-400">Suitable for beginners to get visible results in 3-4 weeks.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Bottom CTA (Matching Screenshot 1, 2, 3 "Get my plan ->") */}
        <div className="sticky bottom-0 z-10 bg-[#121620]/95 backdrop-blur-md px-5 py-4 border-t border-white/10 flex items-center justify-between gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="text-xs sm:text-sm font-semibold text-slate-400 hover:text-white px-4 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>

          <button 
            type="button"
            onClick={handleSave}
            className="flex-1 max-w-sm bg-[#ff5500] hover:bg-[#ff6a1a] text-black font-extrabold text-sm sm:text-base py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all transform active:scale-98"
          >
            <span>Get my plan & Apply</span>
            <ArrowRight className="w-5 h-5 text-black" />
          </button>
        </div>

      </div>
    </div>
  );
};
