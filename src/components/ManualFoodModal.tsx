import React, { useState } from 'react';
import { X, Plus, Search, Flame, Sparkles } from 'lucide-react';
import { FoodLogEntry } from '../types';
import { sounds } from '../utils/sound';

interface ManualFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMeal: (meal: Omit<FoodLogEntry, 'id' | 'loggedAt' | 'date'>) => void;
  defaultMealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

const quickFoodDatabase = [
  { name: 'Grilled Chicken Breast', portion: '150g', calories: 247, protein: 46, carbs: 0, fat: 5, category: 'Protein' },
  { name: 'Cooked Brown Rice', portion: '150g', calories: 168, protein: 4, carbs: 36, fat: 1.5, category: 'Carbs' },
  { name: 'Rolled Oats (Dry)', portion: '50g', calories: 190, protein: 7, carbs: 34, fat: 3, category: 'Carbs' },
  { name: 'Eggs (Whole, Large)', portion: '2 eggs (100g)', calories: 144, protein: 13, carbs: 1, fat: 10, category: 'Protein' },
  { name: 'Egg Whites', portion: '150g (approx 4 whites)', calories: 78, protein: 16, carbs: 1, fat: 0.3, category: 'Protein' },
  { name: 'Whey Protein Isolate', portion: '1 scoop (30g)', calories: 120, protein: 25, carbs: 2, fat: 1, category: 'Protein' },
  { name: 'Greek Yogurt 0% Fat', portion: '170g', calories: 100, protein: 18, carbs: 6, fat: 0, category: 'Dairy' },
  { name: 'Atlantic Salmon Fillet', portion: '150g', calories: 312, protein: 34, carbs: 0, fat: 18, category: 'Protein' },
  { name: 'Avocado (Fresh)', portion: 'Half (75g)', calories: 120, protein: 1.5, carbs: 6, fat: 11, category: 'Healthy Fats' },
  { name: 'Sweet Potato (Baked)', portion: '150g', calories: 135, protein: 3, carbs: 31, fat: 0.2, category: 'Carbs' },
  { name: 'Steamed Broccoli', portion: '150g', calories: 52, protein: 4, carbs: 10, fat: 0.6, category: 'Veggies' },
  { name: 'Almonds (Raw)', portion: '25g', calories: 145, protein: 5, carbs: 5, fat: 12, category: 'Healthy Fats' },
];

export const ManualFoodModal: React.FC<ManualFoodModalProps> = ({
  isOpen,
  onClose,
  onAddMeal,
  defaultMealType = 'lunch',
}) => {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>(defaultMealType);
  const [customTitle, setCustomTitle] = useState('');
  const [customCalories, setCustomCalories] = useState<number>(300);
  const [customProtein, setCustomProtein] = useState<number>(30);
  const [customCarbs, setCustomCarbs] = useState<number>(30);
  const [customFat, setCustomFat] = useState<number>(8);
  const [customFiber, setCustomFiber] = useState<number>(4);

  const filteredFoods = quickFoodDatabase.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectQuickFood = (food: typeof quickFoodDatabase[0]) => {
    sounds.playSuccessChime();
    onAddMeal({
      mealType,
      title: `${food.name} (${food.portion})`,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: 3,
      healthScore: 9.2,
      dietaryTags: ['Logged from Quick DB', food.category],
    });
    onClose();
  };

  const handleSaveCustom = () => {
    if (!customTitle.trim()) return;
    sounds.playSuccessChime();
    onAddMeal({
      mealType,
      title: customTitle.trim(),
      calories: customCalories,
      protein: customProtein,
      carbs: customCarbs,
      fat: customFat,
      fiber: customFiber,
      healthScore: 8.9,
      dietaryTags: ['Manual Entry'],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-[#121620] border border-white/15 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="bg-[#ff5500] text-black font-extrabold px-2 py-0.5 rounded text-xs uppercase">
              Food Journal
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white">Quick Log Food</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Meal Category Select */}
        <div className="grid grid-cols-4 gap-1.5">
          {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMealType(m)}
              className={`py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                mealType === m
                  ? 'bg-[#ff5500] text-black'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Search Fast Food DB */}
        <div className="space-y-2">
          <label className="text-[11px] uppercase font-bold text-slate-400 block">
            Select from Fitness Database
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input 
              type="text"
              placeholder="Search chicken breast, oats, salmon, eggs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-white/15 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 divide-y divide-white/5 bg-black/40 rounded-xl p-2 border border-white/10">
            {filteredFoods.map((f) => (
              <button
                key={f.name}
                type="button"
                onClick={() => handleSelectQuickFood(f)}
                className="w-full pt-1.5 pb-1 flex items-center justify-between text-left hover:bg-white/5 px-2 rounded-lg transition-colors group"
              >
                <div>
                  <span className="text-xs font-bold text-white group-hover:text-orange-400 block">
                    {f.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{f.portion}</span>
                </div>
                <div className="text-right font-mono text-xs">
                  <div className="text-emerald-400 font-bold">{f.calories} kcal</div>
                  <div className="text-[10px] text-slate-400">P:{f.protein}g C:{f.carbs}g F:{f.fat}g</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Or Custom Quick Entry */}
        <div className="border-t border-white/10 pt-4 space-y-3">
          <label className="text-[11px] uppercase font-bold text-slate-400 block">
            Or Custom Item & Macros
          </label>

          <input 
            type="text"
            placeholder="e.g. Protein Smoothie Bowl with Chia"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Calories</label>
              <input 
                type="number"
                value={customCalories}
                onChange={(e) => setCustomCalories(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-white/15 rounded-lg px-2 py-1 text-xs font-mono text-white text-center focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase font-bold text-cyan-400 block mb-0.5">Protein (g)</label>
              <input 
                type="number"
                value={customProtein}
                onChange={(e) => setCustomProtein(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-white/15 rounded-lg px-2 py-1 text-xs font-mono text-white text-center focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase font-bold text-amber-400 block mb-0.5">Carbs (g)</label>
              <input 
                type="number"
                value={customCarbs}
                onChange={(e) => setCustomCarbs(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-white/15 rounded-lg px-2 py-1 text-xs font-mono text-white text-center focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase font-bold text-rose-400 block mb-0.5">Fat (g)</label>
              <input 
                type="number"
                value={customFat}
                onChange={(e) => setCustomFat(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-white/15 rounded-lg px-2 py-1 text-xs font-mono text-white text-center focus:border-rose-400"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveCustom}
            disabled={!customTitle.trim()}
            className="w-full bg-[#ff5500] hover:bg-[#ff6a1a] disabled:opacity-40 text-black font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>Add Custom Food Entry</span>
          </button>
        </div>

      </div>
    </div>
  );
};
