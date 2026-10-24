import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine,
  Area,
  ComposedChart
} from 'recharts';
import { 
  Scale, 
  Plus, 
  TrendingDown, 
  Target, 
  Calendar, 
  Trash2, 
  Edit3, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Info
} from 'lucide-react';
import { WeightLogEntry, UserProfile } from '../types';
import { sounds } from '../utils/sound';

interface WeightTrackerProps {
  profile: UserProfile;
  weightLogs: WeightLogEntry[];
  onAddWeightLog: (entry: Omit<WeightLogEntry, 'id'>) => void;
  onDeleteWeightLog: (id: string) => void;
  onUpdateGoalWeight: (newGoalKg: number) => void;
}

export const WeightTracker: React.FC<WeightTrackerProps> = ({
  profile,
  weightLogs,
  onAddWeightLog,
  onDeleteWeightLog,
  onUpdateGoalWeight,
}) => {
  const [isLogFormOpen, setIsLogFormOpen] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [rangeFilter, setRangeFilter] = useState<'7d' | '14d' | '30d' | 'all'>('14d');
  const [showHistory, setShowHistory] = useState(false);

  // Form states
  const latestWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weightKg : profile.weightKg;
  const [inputWeight, setInputWeight] = useState<number>(latestWeight);
  const [inputDate, setInputDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [inputNote, setInputNote] = useState<string>('Morning fasted');

  // Goal weight edit state
  const [goalInput, setGoalInput] = useState<number>(profile.targetWeightKg || 74.0);

  // Sort logs chronologically
  const sortedLogs = useMemo(() => {
    return [...weightLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [weightLogs]);

  // Filter logs by range
  const filteredLogs = useMemo(() => {
    if (rangeFilter === 'all') return sortedLogs;
    const days = rangeFilter === '7d' ? 7 : rangeFilter === '14d' ? 14 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const result = sortedLogs.filter((log) => new Date(log.date) >= cutoff);
    return result.length > 0 ? result : sortedLogs;
  }, [sortedLogs, rangeFilter]);

  // Chart data format
  const chartData = useMemo(() => {
    return filteredLogs.map((log) => ({
      date: log.date,
      displayDate: new Date(log.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      weight: log.weightKg,
      goal: profile.targetWeightKg,
      note: log.note,
    }));
  }, [filteredLogs, profile.targetWeightKg]);

  // Calculate domain min & max with padding
  const weights = filteredLogs.map((l) => l.weightKg);
  const minWeight = Math.min(...weights, profile.targetWeightKg);
  const maxWeight = Math.max(...weights, profile.targetWeightKg);
  const yDomainMin = Math.floor(minWeight - 1);
  const yDomainMax = Math.ceil(maxWeight + 1);

  // Progress metrics
  const startingWeight = sortedLogs.length > 0 ? sortedLogs[0].weightKg : profile.weightKg;
  const currentWeight = sortedLogs.length > 0 ? sortedLogs[sortedLogs.length - 1].weightKg : profile.weightKg;
  const targetWeight = profile.targetWeightKg || 74.0;
  const totalLost = Math.round((startingWeight - currentWeight) * 10) / 10;
  const toGoal = Math.round((currentWeight - targetWeight) * 10) / 10;
  const totalTargetLoss = Math.max(0.1, startingWeight - targetWeight);
  const percentToGoal = Math.min(100, Math.max(0, Math.round((totalLost / totalTargetLoss) * 100)));

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputWeight || inputWeight <= 0) return;
    sounds.playSuccessChime();
    onAddWeightLog({
      date: inputDate,
      weightKg: Math.round(inputWeight * 10) / 10,
      note: inputNote.trim() || undefined,
    });
    setIsLogFormOpen(false);
  };

  const handleSaveGoal = () => {
    if (!goalInput || goalInput <= 0) return;
    sounds.playSuccessChime();
    onUpdateGoalWeight(Math.round(goalInput * 10) / 10);
    setIsEditingGoal(false);
  };

  // Custom Recharts Dark Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const diffFromStart = Math.round((data.weight - startingWeight) * 10) / 10;
      return (
        <div className="bg-[#121620] border border-white/20 p-3 rounded-xl shadow-2xl text-xs space-y-1">
          <div className="text-slate-400 font-mono text-[11px]">{data.displayDate} ({data.date})</div>
          <div className="text-base font-extrabold text-emerald-400 font-mono">
            {data.weight} kg
          </div>
          <div className="text-[10px] text-slate-300 font-mono">
            Change from start: <span className={diffFromStart <= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {diffFromStart > 0 ? `+${diffFromStart}` : diffFromStart} kg
            </span>
          </div>
          {data.note && (
            <div className="text-[10px] text-orange-400 italic pt-1 border-t border-white/10">
              "{data.note}"
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl">
      
      {/* Header with Title and Quick Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Weight Progress & Target Tracker</span>
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">
                  Recharts
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Monitor your daily scale weigh-ins with real-time target trajectory to reach your goal.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsLogFormOpen(!isLogFormOpen)}
            className="bg-[#ff5500] hover:bg-[#ff6a1a] text-black font-extrabold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition-all transform active:scale-98"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>{isLogFormOpen ? 'Cancel' : 'Log Today\'s Weight'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* Current Weight */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Weight</span>
          <div className="text-2xl font-black text-white font-mono">
            {currentWeight} <span className="text-xs font-normal text-slate-400">kg</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono block">
            {(currentWeight * 2.20462).toFixed(1)} lbs
          </span>
        </div>

        {/* Goal Weight with 1-click edit */}
        <div className="bg-black/40 border border-amber-500/30 rounded-xl p-3.5 space-y-1 relative group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-amber-400 block">Goal Weight</span>
            <button
              onClick={() => setIsEditingGoal(!isEditingGoal)}
              className="text-slate-400 hover:text-white p-0.5 rounded"
              title="Edit target goal weight"
            >
              <Edit3 className="w-3 h-3 text-amber-400" />
            </button>
          </div>

          {isEditingGoal ? (
            <div className="flex items-center gap-1.5 pt-0.5">
              <input
                type="number"
                step="0.5"
                value={goalInput}
                onChange={(e) => setGoalInput(parseFloat(e.target.value) || targetWeight)}
                className="w-16 bg-slate-800 border border-amber-500 rounded px-1.5 py-0.5 text-xs font-mono text-white text-center focus:outline-none"
              />
              <button
                onClick={handleSaveGoal}
                className="bg-amber-500 text-black p-1 rounded hover:bg-amber-400"
              >
                <Check className="w-3 h-3 stroke-[3]" />
              </button>
            </div>
          ) : (
            <>
              <div className="text-2xl font-black text-amber-400 font-mono">
                {targetWeight} <span className="text-xs font-normal text-slate-400">kg</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono block">
                Target: {profile.goal.toUpperCase()}
              </span>
            </>
          )}
        </div>

        {/* Total Lost */}
        <div className="bg-black/40 border border-emerald-500/30 rounded-xl p-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-emerald-400 block">Total Lost</span>
          <div className="text-2xl font-black text-emerald-400 font-mono flex items-baseline gap-1">
            <TrendingDown className="w-4 h-4 text-emerald-400 self-center" />
            <span>{totalLost > 0 ? `-${totalLost}` : `${totalLost}`}</span>
            <span className="text-xs font-normal text-slate-400">kg</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono block">
            From {startingWeight} kg start
          </span>
        </div>

        {/* Remaining to Goal */}
        <div className="bg-black/40 border border-cyan-500/30 rounded-xl p-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-cyan-400 block">Distance to Goal</span>
          <div className="text-2xl font-black text-cyan-300 font-mono">
            {toGoal > 0 ? `${toGoal}` : 'Goal Met!'} <span className="text-xs font-normal text-slate-400">kg left</span>
          </div>
          <div className="flex items-center gap-1.5 pt-0.5">
            <div className="h-1.5 flex-1 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-400 rounded-full" 
                style={{ width: `${percentToGoal}%` }} 
              />
            </div>
            <span className="text-[9px] font-mono text-cyan-400 font-bold">{percentToGoal}%</span>
          </div>
        </div>

      </div>

      {/* Expandable Daily Weight Logging Drawer */}
      {isLogFormOpen && (
        <form onSubmit={handleSaveLog} className="bg-black/60 border border-orange-500/30 rounded-xl p-4 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs uppercase font-extrabold text-orange-400 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              <span>Log New Daily Scale Weigh-In</span>
            </span>
            <span className="text-[11px] text-slate-400">Weigh in first thing in the morning fasted</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 font-semibold block mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="300"
                required
                value={inputWeight}
                onChange={(e) => setInputWeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-semibold block mb-1">Date</label>
              <input
                type="date"
                required
                value={inputDate}
                onChange={(e) => setInputDate(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-semibold block mb-1">Condition / Note</label>
              <input
                type="text"
                placeholder="e.g. Morning fasted, post-workout"
                value={inputNote}
                onChange={(e) => setInputNote(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsLogFormOpen(false)}
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#ff5500] hover:bg-[#ff6a1a] text-black font-extrabold text-xs py-1.5 px-4 rounded-lg shadow transition-all"
            >
              Save Weigh-In
            </button>
          </div>
        </form>
      )}

      {/* Chart Section Header with Range Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-[0_0_8px_#10b981]"></span>
            <span>Recorded Weight (kg)</span>
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-4 h-0.5 border-t border-dashed border-amber-400"></span>
            <span>Target Goal ({targetWeight} kg)</span>
          </span>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
          {(['7d', '14d', '30d', 'all'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRangeFilter(r)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                rangeFilter === r
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* RECHARTS INTERACTIVE LINE CHART */}
      <div className="w-full h-64 sm:h-72 bg-black/40 rounded-2xl p-2 sm:p-4 border border-white/5 relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="weightAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />

            <XAxis 
              dataKey="displayDate" 
              stroke="#64748b" 
              fontSize={11} 
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />

            <YAxis 
              domain={[yDomainMin, yDomainMax]} 
              stroke="#64748b" 
              fontSize={11} 
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={(v) => `${v}kg`}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Reference Line for Target Weight */}
            <ReferenceLine 
              y={targetWeight} 
              stroke="#f59e0b" 
              strokeDasharray="4 4" 
              strokeWidth={1.5}
              label={{ 
                value: `Goal: ${targetWeight}kg`, 
                fill: '#f59e0b', 
                fontSize: 10, 
                position: 'insideTopRight',
                offset: 5 
              }} 
            />

            {/* Soft Area fill under weight curve */}
            <Area
              type="monotone"
              dataKey="weight"
              fill="url(#weightAreaGrad)"
              stroke="none"
            />

            {/* Glowing Main Weight Line */}
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 4, fill: '#10b981', stroke: '#090d16', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#34d399', stroke: '#ffffff', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Expandable Recent Weight Logs History Drawer */}
      <div className="space-y-2 pt-1 border-t border-white/5">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-xs text-slate-400 hover:text-white flex items-center justify-between w-full p-1"
        >
          <span className="font-semibold flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-orange-400" />
            <span>View All Weigh-In Logs ({weightLogs.length} entries)</span>
          </span>
          {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showHistory && (
          <div className="bg-black/50 border border-white/10 rounded-xl divide-y divide-white/5 max-h-48 overflow-y-auto pr-1">
            {sortedLogs.slice().reverse().map((log) => (
              <div key={log.id} className="p-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white text-sm">{log.weightKg} kg</span>
                    <span className="text-[10px] text-slate-400 font-mono">({(log.weightKg * 2.20462).toFixed(1)} lbs)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{log.date} {log.note ? `• ${log.note}` : ''}</span>
                </div>

                <button
                  onClick={() => onDeleteWeightLog(log.id)}
                  className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                  title="Delete weigh-in entry"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
