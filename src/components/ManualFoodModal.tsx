import React, { useState, useMemo } from 'react';
import { X, Plus, Search, Flame, Check, ShieldCheck, Scale, Sparkles } from 'lucide-react';
import { FoodLogEntry, VerifiedFoodItem } from '../types';
import { searchVerifiedFoods, calculateCustomPortionMacros } from '../data/verifiedFoodDatabase';
import { sounds } from '../utils/sound';

interface ManualFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMeal: (meal: Omit<FoodLogEntry, 'id' | 'loggedAt' | 'date'>) => void;
  defaultMealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

const CATEGORIES = [
  'All',
  'Protein',
  'Indian Staples',
  'Legumes & Dals',
  'Carbs',
  'Dairy',
  'Healthy Fats',
  'Veggies',
  'Fruits',
];

export const ManualFoodModal: React.FC<ManualFoodModalProps> = ({
  isOpen,
  onClose,
  onAddMeal,
  defaultMealType = 'lunch',
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'verified' | 'custom'>('verified');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>(defaultMealType);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Selected item for portion customization
  const [selectedItem, setSelectedItem] = useState<VerifiedFoodItem | null>(null);
  const [customGrams, setCustomGrams] = useState<number>(100);

  // Custom freeform manual food state
  const [customTitle, setCustomTitle] = useState('');
  const [customCalories, setCustomCalories] = useState<number>(300);
  const [customProtein, setCustomProtein] = useState<number>(30);
  const [customCarbs, setCustomCarbs] = useState<number>(30);
  const [customFat, setCustomFat] = useState<number>(8);
  const [customFiber, setCustomFiber] = useState<number>(4);

  const filteredFoods = useMemo(() => {
    return searchVerifiedFoods(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory]);

  const portionCalculatedMacros = useMemo(() => {
    if (!selectedItem) return null;
    return calculateCustomPortionMacros(selectedItem, customGrams);
  }, [selectedItem, customGrams]);

  const handleSelectItem = (item: VerifiedFoodItem) => {
    sounds.tap();
    setSelectedItem(item);
    setCustomGrams(item.servingWeightGrams);
  };

  const handleLogVerifiedItem = () => {
    if (!selectedItem || !portionCalculatedMacros) return;
    sounds.playSuccessChime();

    onAddMeal({
      mealType,
      title: `${selectedItem.name} (${customGrams}g)`,
      calories: portionCalculatedMacros.calories,
      protein: portionCalculatedMacros.protein,
      carbs: portionCalculatedMacros.carbs,
      fat: portionCalculatedMacros.fat,
      fiber: portionCalculatedMacros.fiber,
      healthScore: 9.4,
      dietaryTags: [
        'Verified Database',
        selectedItem.category,
        selectedItem.source,
        ...(selectedItem.dietaryTags || []),
      ],
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-xl bg-[#121620] border border-white/15 rounded-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-[#121620]/95 backdrop-blur-md px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#ff5500] text-black font-black px-2 py-0.5 rounded text-xs uppercase tracking-tight">
              JOURNAL
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white">Log Nutrition & Foods</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto">

          {/* Meal Slot Select */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Meal Slot</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMealType(m)}
                  className={`py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                    mealType === m
                      ? 'bg-[#ff5500] text-black shadow-md shadow-orange-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-white/5">
            <button
              type="button"
              onClick={() => setActiveTab('verified')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'verified'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Food Database (USDA & ICMR)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('custom')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'custom'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-orange-400" />
              <span>Custom Food Entry</span>
            </button>
          </div>

          {/* Verified Database Tab */}
          {activeTab === 'verified' && (
            <div className="space-y-3">
              
              {/* Search & Categories */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input 
                    type="text"
                    placeholder="Search 100+ foods (e.g. paneer, oats, salmon, chicken, roti, eggs)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap font-medium transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                          : 'bg-slate-800/80 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Verified Foods List */}
              <div className="max-h-56 overflow-y-auto space-y-1 pr-1 divide-y divide-white/5 bg-black/40 rounded-xl p-2 border border-white/10">
                {filteredFoods.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No verified foods found matching "{searchQuery}". Try another keyword or switch to Custom Entry.
                  </div>
                ) : (
                  filteredFoods.map((f) => {
                    const isSelected = selectedItem?.id === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => handleSelectItem(f)}
                        className={`w-full py-2 px-2.5 flex items-center justify-between text-left rounded-lg transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/15 border border-emerald-500/40 text-white'
                            : 'hover:bg-white/5 text-slate-200'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold truncate text-white">{f.name}</span>
                            {f.dietaryTags?.includes('High Protein') && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-orange-500/20 text-orange-300 font-mono">
                                HIGH P
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Standard: {f.servingSize} ({f.servingWeightGrams}g) • {f.source}
                          </div>
                        </div>
                        <div className="text-right font-mono text-xs flex-shrink-0">
                          <div className="text-emerald-400 font-bold">{f.calories} kcal</div>
                          <div className="text-[10px] text-slate-400">
                            P:{f.protein}g C:{f.carbs}g F:{f.fat}g
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Portion Weight Adjuster & Live Macro Preview */}
              {selectedItem && portionCalculatedMacros && (
                <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Selected: {selectedItem.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Adjust your exact portion weight below:</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                      {selectedItem.source}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <input 
                        type="range"
                        min="20"
                        max="500"
                        step="5"
                        value={customGrams}
                        onChange={(e) => setCustomGrams(parseInt(e.target.value, 10))}
                        className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
                      />
                    </div>
                    <div className="flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-lg border border-white/10">
                      <input
                        type="number"
                        min="1"
                        max="2000"
                        value={customGrams}
                        onChange={(e) => setCustomGrams(Math.max(1, parseInt(e.target.value, 10) || 0))}
                        className="w-14 bg-transparent font-mono text-xs text-white text-right outline-none font-bold"
                      />
                      <span className="text-xs font-mono text-slate-400">g</span>
                    </div>
                  </div>

                  {/* Calculated Macros Strip */}
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/10 text-center font-mono">
                    <div className="bg-black/30 p-1.5 rounded-lg">
                      <div className="text-[10px] text-slate-400">Calories</div>
                      <div className="text-sm font-bold text-emerald-400">{portionCalculatedMacros.calories} kcal</div>
                    </div>
                    <div className="bg-black/30 p-1.5 rounded-lg">
                      <div className="text-[10px] text-cyan-400">Protein</div>
                      <div className="text-sm font-bold text-white">{portionCalculatedMacros.protein}g</div>
                    </div>
                    <div className="bg-black/30 p-1.5 rounded-lg">
                      <div className="text-[10px] text-amber-400">Carbs</div>
                      <div className="text-sm font-bold text-white">{portionCalculatedMacros.carbs}g</div>
                    </div>
                    <div className="bg-black/30 p-1.5 rounded-lg">
                      <div className="text-[10px] text-rose-400">Fat</div>
                      <div className="text-sm font-bold text-white">{portionCalculatedMacros.fat}g</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogVerifiedItem}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs sm:text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-black" />
                    <span>Log {selectedItem.name} ({customGrams}g)</span>
                  </button>
                </div>
              )}

            </div>
          )}

          {/* Custom Entry Tab */}
          {activeTab === 'custom' && (
            <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-white/10">
              <label className="text-[11px] uppercase font-bold text-slate-300 block">
                Custom Food Name
              </label>

              <input 
                type="text"
                placeholder="e.g. Protein Smoothie Bowl with Chia Seeds"
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
                    className="w-full bg-slate-950 border border-white/15 rounded-lg px-2 py-1.5 text-xs font-mono text-white text-center focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-cyan-400 block mb-0.5">Protein (g)</label>
                  <input 
                    type="number"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-white/15 rounded-lg px-2 py-1.5 text-xs font-mono text-white text-center focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-amber-400 block mb-0.5">Carbs (g)</label>
                  <input 
                    type="number"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-white/15 rounded-lg px-2 py-1.5 text-xs font-mono text-white text-center focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-rose-400 block mb-0.5">Fat (g)</label>
                  <input 
                    type="number"
                    value={customFat}
                    onChange={(e) => setCustomFat(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-white/15 rounded-lg px-2 py-1.5 text-xs font-mono text-white text-center focus:border-rose-400"
                  />
                </div>
              </div>

              <div className="w-1/2 pr-1">
                <label className="text-[9px] uppercase font-bold text-emerald-400 block mb-0.5">Fiber (g)</label>
                <input 
                  type="number"
                  value={customFiber}
                  onChange={(e) => setCustomFiber(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-white/15 rounded-lg px-2 py-1.5 text-xs font-mono text-white text-center focus:border-emerald-400"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveCustom}
                disabled={!customTitle.trim()}
                className="w-full bg-[#ff5500] hover:bg-[#ff6a1a] disabled:opacity-40 text-black font-extrabold text-xs sm:text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-black" />
                <span>Add Custom Food Entry</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
