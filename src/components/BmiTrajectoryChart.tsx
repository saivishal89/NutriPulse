import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Area
} from 'recharts';
import {
  Activity,
  TrendingDown,
  HeartPulse,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  Info,
  Calendar,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { WeightLogEntry, UserProfile } from '../types';
import { calculateBMI } from '../utils/calculator';

interface BmiTrajectoryChartProps {
  profile: UserProfile;
  weightLogs: WeightLogEntry[];
}

export const BmiTrajectoryChart: React.FC<BmiTrajectoryChartProps> = ({
  profile,
  weightLogs,
}) => {
  const [rangeFilter, setRangeFilter] = useState<'7d' | '14d' | '30d' | 'all'>('14d');
  const [selectedInsightTab, setSelectedInsightTab] = useState<'trajectory' | 'clinical' | 'milestones'>('trajectory');

  const heightM = (profile.heightCm || 178) / 100;

  // Chronologically sorted logs
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

  // Transform data for recharts
  const chartData = useMemo(() => {
    return filteredLogs.map((log) => {
      const bmiVal = Number((log.weightKg / (heightM * heightM)).toFixed(2));
      const { category } = calculateBMI(log.weightKg, profile.heightCm);
      return {
        date: log.date,
        displayDate: new Date(log.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        bmi: bmiVal,
        weightKg: log.weightKg,
        category,
        note: log.note,
      };
    });
  }, [filteredLogs, heightM, profile.heightCm]);

  // Key biometric milestones
  const startingWeight = sortedLogs.length > 0 ? sortedLogs[0].weightKg : profile.weightKg;
  const currentWeight = sortedLogs.length > 0 ? sortedLogs[sortedLogs.length - 1].weightKg : profile.weightKg;
  const targetWeight = profile.targetWeightKg || 74.0;

  const startingBmi = Number((startingWeight / (heightM * heightM)).toFixed(2));
  const currentBmi = Number((currentWeight / (heightM * heightM)).toFixed(2));
  const goalBmi = Number((targetWeight / (heightM * heightM)).toFixed(2));
  const bmiDelta = Number((currentBmi - startingBmi).toFixed(2));

  // Distance to Healthy Normal BMI (24.9)
  const distanceToNormal = Number((currentBmi - 24.9).toFixed(2));
  const isNormalOrBelow = currentBmi <= 24.9;

  // Weekly rate of BMI change (based on logs count/days)
  const daysDiff = sortedLogs.length > 1
    ? Math.max(1, Math.round((new Date(sortedLogs[sortedLogs.length - 1].date).getTime() - new Date(sortedLogs[0].date).getTime()) / (1000 * 60 * 60 * 24)))
    : 14;
  const bmiChangePerWeek = Math.abs(bmiDelta) / (daysDiff / 7);
  const estimatedWeeksToNormal = distanceToNormal > 0 && bmiChangePerWeek > 0
    ? Math.max(1, Math.ceil(distanceToNormal / Math.max(0.08, bmiChangePerWeek)))
    : 0;

  // Domain min & max
  const allBmis = chartData.map((d) => d.bmi);
  const minBmi = Math.min(...allBmis, goalBmi, 24.0);
  const maxBmi = Math.max(...allBmis, 29.5);
  const yDomainMin = Math.floor(minBmi - 0.5);
  const yDomainMax = Math.ceil(maxBmi + 0.5);

  // Position on BMI gradient spectrum (15 to 40)
  const bmiClamped = Math.min(40, Math.max(15, currentBmi));
  const spectrumPercentage = Math.round(((bmiClamped - 15) / (40 - 15)) * 100);

  // Custom Dark Tooltip
  const CustomBmiTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0f1422] border border-cyan-500/40 p-3.5 rounded-xl shadow-2xl text-xs space-y-1.5 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-1.5">
            <span className="text-slate-400 font-mono text-[11px]">{data.displayDate} ({data.date})</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
              data.category === 'Normal' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
              data.category === 'Overweight' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
              data.category === 'Obese' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
              'bg-blue-500/20 text-blue-300 border border-blue-500/30'
            }`}>
              {data.category}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-cyan-300 font-mono">{data.bmi}</span>
            <span className="text-slate-400 text-xs font-mono">BMI</span>
            <span className="text-slate-400 text-[11px] font-mono">({data.weightKg} kg)</span>
          </div>

          <div className="text-[10px] text-slate-300 font-mono">
            Variance from normal (24.9):{' '}
            <strong className={data.bmi <= 24.9 ? 'text-emerald-400' : 'text-orange-400'}>
              {data.bmi <= 24.9 ? 'Inside Healthy Range' : `+${(data.bmi - 24.9).toFixed(2)} pts`}
            </strong>
          </div>

          {data.note && (
            <div className="text-[10px] text-orange-300 italic pt-1 border-t border-white/10">
              "{data.note}"
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl relative overflow-hidden">
      
      {/* Background radial glow */}
      <div className="absolute right-0 top-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>BMI Health Trajectory & Metabolic Zone</span>
                <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full uppercase">
                  Clinical Trend
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Calculated from your logged weigh-ins at {profile.heightCm} cm height. Tracks migration toward the optimal 18.5–24.9 health zone.
              </p>
            </div>
          </div>
        </div>

        {/* Timeframe Range Tabs */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
          {(['7d', '14d', '30d', 'all'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRangeFilter(r)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                rangeFilter === r
                  ? 'bg-cyan-500 text-black shadow-sm font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPI Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* Current BMI */}
        <div className="bg-black/40 border border-cyan-500/30 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Current BMI</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
              currentBmi < 25 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-orange-500/20 text-orange-400'
            }`}>
              {currentBmi < 25 ? 'Normal' : 'Overweight'}
            </span>
          </div>
          <div className="text-2xl font-black text-cyan-300 font-mono">
            {currentBmi} <span className="text-xs font-normal text-slate-400">BMI</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono block">
            At {currentWeight} kg ({profile.heightCm}cm)
          </span>
        </div>

        {/* Total BMI Points Dropped */}
        <div className="bg-black/40 border border-emerald-500/30 rounded-xl p-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-emerald-400 block">BMI Progress</span>
          <div className="text-2xl font-black text-emerald-400 font-mono flex items-baseline gap-1">
            <TrendingDown className="w-4 h-4 text-emerald-400 self-center" />
            <span>{bmiDelta > 0 ? `+${bmiDelta}` : `${bmiDelta}`}</span>
            <span className="text-xs font-normal text-slate-400">pts</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono block">
            Down from {startingBmi} baseline
          </span>
        </div>

        {/* Distance to Normal Health Range */}
        <div className="bg-black/40 border border-amber-500/30 rounded-xl p-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-amber-400 block">To Healthy Zone</span>
          <div className="text-2xl font-black text-amber-300 font-mono">
            {isNormalOrBelow ? (
              <span className="text-emerald-400">Achieved!</span>
            ) : (
              <span>+{distanceToNormal} <span className="text-xs font-normal text-slate-400">pts</span></span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 font-mono block">
            Normal ceiling is 24.9 BMI
          </span>
        </div>

        {/* Goal BMI Target */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Goal BMI</span>
          <div className="text-2xl font-black text-white font-mono">
            {goalBmi} <span className="text-xs font-normal text-slate-400">BMI</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono block">
            Target Weight: {targetWeight} kg
          </span>
        </div>

      </div>

      {/* Interactive Visual Spectrum Gauge (Matching MadMuscles reference) */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="uppercase font-extrabold text-slate-300 text-[11px] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Physiological Classification Gauge</span>
          </span>
          <span className="font-mono text-cyan-400 text-xs font-bold">
            Current: {currentBmi} BMI
          </span>
        </div>

        {/* Gradient Color Spectrum Bar with Pointer */}
        <div className="relative pt-1 pb-4">
          <div className="h-3 w-full rounded-full bg-gradient-to-r from-blue-500 via-emerald-400 via-amber-400 to-rose-500 shadow-inner"></div>
          {/* Pointer Indicator */}
          <div
            className="absolute top-0 -ml-2.5 transition-all duration-500 ease-out"
            style={{ left: `${spectrumPercentage}%` }}
          >
            <div className="w-5 h-5 bg-white border-2 border-slate-900 rounded-full shadow-lg shadow-black/80 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-cyan-600 rounded-full"></div>
            </div>
            <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-white mx-auto"></div>
          </div>
        </div>

        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span className="text-blue-400">Underweight (&lt;18.5)</span>
          <span className="text-emerald-400 font-semibold">Normal (18.5–24.9)</span>
          <span className="text-amber-400 font-semibold">Overweight (25–29.9)</span>
          <span className="text-rose-400">Obese (&ge;30)</span>
        </div>
      </div>

      {/* Legend & Threshold Indicators */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono pt-1">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-cyan-300">
            <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]"></span>
            <span>Your BMI Trend</span>
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-3.5 h-0.5 bg-emerald-400"></span>
            <span>Normal Health Threshold (24.9)</span>
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-3.5 h-0.5 border-t border-dashed border-amber-400"></span>
            <span>Goal Target BMI ({goalBmi})</span>
          </span>
        </div>

        <div className="text-[11px] text-slate-400">
          Height: <strong className="text-white font-mono">{profile.heightCm} cm</strong>
        </div>
      </div>

      {/* RECHARTS COMPOSED BMI CHART */}
      <div className="w-full h-64 sm:h-72 bg-black/40 rounded-2xl p-2 sm:p-4 border border-white/5 relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 25, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="bmiAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
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
              tickFormatter={(v) => `${v}`}
            />

            <Tooltip content={<CustomBmiTooltip />} />

            {/* Reference Line for Normal Weight Boundary (24.9) */}
            <ReferenceLine
              y={24.9}
              stroke="#10b981"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              label={{
                value: 'Normal Zone (24.9)',
                fill: '#34d399',
                fontSize: 10,
                position: 'insideTopRight',
                offset: 6,
              }}
            />

            {/* Reference Line for Target Goal BMI */}
            <ReferenceLine
              y={goalBmi}
              stroke="#f59e0b"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              label={{
                value: `Target Goal: ${goalBmi}`,
                fill: '#f59e0b',
                fontSize: 10,
                position: 'insideBottomRight',
                offset: 6,
              }}
            />

            {/* Soft Area fill under BMI curve */}
            <Area
              type="monotone"
              dataKey="bmi"
              fill="url(#bmiAreaGrad)"
              stroke="none"
            />

            {/* Glowing Main BMI Line */}
            <Line
              type="monotone"
              dataKey="bmi"
              stroke="#06b6d4"
              strokeWidth={3}
              dot={{ r: 4, fill: '#06b6d4', stroke: '#090d16', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#67e8f9', stroke: '#ffffff', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* HEALTH TRAJECTORY INSIGHTS ACCORDION / TABS */}
      <div className="bg-black/50 border border-white/10 rounded-xl p-4 sm:p-5 space-y-4">
        
        {/* Sub-tab selection */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedInsightTab('trajectory')}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              selectedInsightTab === 'trajectory'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Trajectory Projection</span>
          </button>

          <button
            onClick={() => setSelectedInsightTab('clinical')}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              selectedInsightTab === 'clinical'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cardiovascular & Metabolic Benefits</span>
          </button>

          <button
            onClick={() => setSelectedInsightTab('milestones')}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              selectedInsightTab === 'milestones'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Joint & Longevity Markers</span>
          </button>
        </div>

        {/* Tab 1: Trajectory Forecast */}
        {selectedInsightTab === 'trajectory' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>Velocity: Dropping ~{(bmiChangePerWeek).toFixed(2)} BMI points per week</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Based on your consistent 1,573 kcal intake and 2.5L daily hydration adherence.
                </p>
              </div>

              {estimatedWeeksToNormal > 0 && (
                <div className="bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded-xl text-center self-start sm:self-auto font-mono">
                  <span className="text-[10px] text-cyan-400 uppercase font-bold block">Est. Normal Zone</span>
                  <span className="text-xs font-black text-white">~{estimatedWeeksToNormal} Weeks</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 space-y-1">
                <span className="font-bold text-cyan-400 block">Baseline Start:</span>
                <span className="font-mono text-white text-sm">{startingBmi} BMI</span>
                <span className="text-[11px] text-slate-400 block">Initial weigh-in at {startingWeight} kg</span>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 space-y-1">
                <span className="font-bold text-emerald-400 block">Current Status:</span>
                <span className="font-mono text-white text-sm">{currentBmi} BMI</span>
                <span className="text-[11px] text-slate-400 block">{bmiDelta} pts reduction achieved</span>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 space-y-1">
                <span className="font-bold text-amber-400 block">Goal Destination:</span>
                <span className="font-mono text-white text-sm">{goalBmi} BMI</span>
                <span className="text-[11px] text-slate-400 block">Optimal athletic body fat (8–10%)</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Clinical Benefits */}
        {selectedInsightTab === 'clinical' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-fadeIn">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-emerald-500/20 space-y-1">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Cardiovascular Pressure Reduction</span>
              </span>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Dropping from {startingBmi} to {currentBmi} BMI reduces peripheral vascular resistance, significantly easing left ventricular strain and resting blood pressure.
              </p>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-emerald-500/20 space-y-1">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Insulin & Glucose Optimization</span>
              </span>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Adipose cell deflation enhances GLUT-4 transporter translocation, driving carbohydrates directly into muscle glycogen stores rather than visceral fat tissue.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Joint Load & Longevity */}
        {selectedInsightTab === 'milestones' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-fadeIn">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-amber-500/20 space-y-1">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Knee & Lumbar Spine Relief</span>
              </span>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Every 1.0 drop in BMI reduces ~4 kg of kinetic impact force per step on knee cartilage and intervertebral discs during running and walking.
              </p>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-amber-500/20 space-y-1">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Systemic Inflammation Reduction</span>
              </span>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Lower circulating TNF-alpha and interleukin-6 markers accelerate workout recovery and enhance quality of sleep and daily energy.
              </p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
