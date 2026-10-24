import React from 'react';
import { 
  Flame, 
  Droplet, 
  Dumbbell, 
  Award, 
  Zap, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  Trophy, 
  Target,
  Crown
} from 'lucide-react';
import { StreakState, Milestone } from '../types';

interface StreaksAndMilestonesProps {
  streaks: StreakState;
  milestones: Milestone[];
}

export const StreaksAndMilestones: React.FC<StreaksAndMilestonesProps> = ({
  streaks,
  milestones,
}) => {
  const currentXp = streaks.totalXp;
  const xpForNextLevel = streaks.level * 250;
  const progressToNextLevel = Math.min(100, Math.round((currentXp % 250) / 2.5));

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#ff5500]/15 text-[#ff7733] border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase mb-2">
            <Trophy className="w-3.5 h-3.5" />
            Discipline & Achievement Matrix
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Consistency Streaks & Milestones
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Transformation isn't built in a day — it's built by stacking micro-habits daily. Every log, glass of water, and workout levels up your physique and XP.
          </p>
        </div>
      </div>

      {/* 3 Core Streaks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Food Streak */}
        <div className="bg-slate-900/80 border border-orange-500/30 rounded-2xl p-5 relative overflow-hidden group hover:border-orange-500/60 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-extrabold text-orange-400">Diet Journal Streak</span>
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
              <Flame className="w-5 h-5 fill-orange-500 text-orange-500 animate-pulse" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {streaks.foodStreak} <span className="text-sm font-normal text-slate-400">Days</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Logged meals consecutively. Nutrition adherence is 80% of fat loss results.
          </p>
        </div>

        {/* Water Streak */}
        <div className="bg-slate-900/80 border border-cyan-500/30 rounded-2xl p-5 relative overflow-hidden group hover:border-cyan-500/60 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-extrabold text-cyan-400">Hydration Streak</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Droplet className="w-5 h-5 fill-cyan-400 text-cyan-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {streaks.waterStreak} <span className="text-sm font-normal text-slate-400">Days</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Hit 2.5L+ daily water goal. Boosts metabolic rate and cell volumization.
          </p>
        </div>

        {/* Workout Streak */}
        <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/60 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-extrabold text-emerald-400">Workout Streak</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Dumbbell className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {streaks.workoutStreak} <span className="text-sm font-normal text-slate-400">Days</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Completed daily training or active recovery mobility sessions.
          </p>
        </div>

      </div>

      {/* Level & XP Progression Card */}
      <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ff5500] to-amber-400 text-black flex items-center justify-center font-black text-lg shadow-lg shadow-orange-500/25">
              <Crown className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs uppercase font-extrabold text-orange-400">Discipline Level</div>
              <h2 className="text-xl font-black text-white">Level {streaks.level} Titan</h2>
            </div>
          </div>

          <div className="text-left sm:text-right font-mono">
            <div className="text-xs text-slate-400">Total Lifetime XP</div>
            <div className="text-lg font-black text-emerald-400">{currentXp} XP</div>
          </div>
        </div>

        {/* Progress bar to next level */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs text-slate-400 font-mono">
            <span>Level {streaks.level}</span>
            <span>{currentXp % 250} / 250 XP to Level {streaks.level + 1}</span>
          </div>
          <div className="h-3 w-full bg-black/60 rounded-full overflow-hidden border border-white/10">
            <div 
              className="h-full bg-gradient-to-r from-[#ff5500] to-amber-400 transition-all duration-500 rounded-full"
              style={{ width: `${progressToNextLevel}%` }}
            />
          </div>
        </div>
      </div>

      {/* Milestone Badges Collection */}
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-400" />
              <span>Milestone Badges & Honors</span>
            </h2>
            <p className="text-xs text-slate-400">
              Unlock prestigious badges by reaching consistency milestones.
            </p>
          </div>
          <span className="text-xs font-mono text-orange-400 font-bold bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
            {milestones.filter((m) => m.unlocked).length} / {milestones.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {milestones.map((m) => (
            <div 
              key={m.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                m.unlocked
                  ? 'bg-black/50 border-orange-500/40 shadow-sm shadow-orange-500/10'
                  : 'bg-black/20 border-white/5 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  m.unlocked 
                    ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-black shadow-md' 
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  {m.unlocked ? <CheckCircle2 className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </div>

                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  +{m.xpReward} XP
                </span>
              </div>

              <div>
                <h4 className={`text-sm font-bold ${m.unlocked ? 'text-white' : 'text-slate-400'}`}>
                  {m.title}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  {m.description}
                </p>
              </div>

              {m.unlocked ? (
                <div className="text-[10px] text-orange-400 font-mono font-semibold pt-1 border-t border-white/5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Unlocked {m.unlockedAt || 'Recently'}</span>
                </div>
              ) : (
                <div className="space-y-1 pt-1 border-t border-white/5">
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>In Progress</span>
                    <span>{m.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 rounded-full" 
                      style={{ width: `${m.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
