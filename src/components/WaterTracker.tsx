import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  Plus, 
  RotateCcw, 
  Bell, 
  BellRing, 
  Clock, 
  Check, 
  Flame, 
  Sparkles, 
  Volume2, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { WaterLog, WaterReminder, UserProfile } from '../types';
import { formatMl } from '../utils/calculator';
import { sounds } from '../utils/sound';

interface WaterTrackerProps {
  profile: UserProfile;
  waterLog: WaterLog;
  reminders: WaterReminder[];
  onAddWater: (amountMl: number) => void;
  onResetWater: () => void;
  onToggleReminder: (id: string) => void;
  onUpdateReminderTime: (id: string, newTime: string) => void;
  onOpenNotificationCenter?: () => void;
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({
  profile,
  waterLog,
  reminders,
  onAddWater,
  onResetWater,
  onToggleReminder,
  onUpdateReminderTime,
  onOpenNotificationCenter,
}) => {
  const [customMl, setCustomMl] = useState(250);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<string>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === 'granted') {
        new Notification('NutriPulse Hydration Alert', {
          body: 'Hydration reminders are active! Drink pure water to fuel metabolism.',
          icon: '/favicon.ico',
        });
      }
    }
  };

  const handleSimulateReminder = (reminder: WaterReminder) => {
    sounds.playNotificationChime();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate([150, 80, 150]); } catch (e) {}
    }
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`💧 Hydration: ${reminder.label}`, {
          body: `Time for a refill! Drink ${reminder.amountMl}ml to stay on track.`,
          icon: '/pwa-192x192.png',
        });
      } catch (e) {}
    }
    setActiveNotification(`💧 Reminder: ${reminder.label} (+${reminder.amountMl}ml)`);
    setTimeout(() => {
      setActiveNotification(null);
    }, 4000);
  };

  const handleQuickAdd = (amount: number) => {
    sounds.playWaterDrop();
    onAddWater(amount);
  };

  const targetMl = profile.waterTargetMl || 2500;
  const currentMl = waterLog.intakeMl;
  const progressPercent = Math.min(100, Math.round((currentMl / targetMl) * 100));

  // Visual glass count: Each glass = 250ml
  const totalGlasses = Math.max(8, Math.round(targetMl / 250));
  const filledGlasses = Math.min(totalGlasses, Math.floor(currentMl / 250));

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      
      {/* Top Banner (Matching Screenshot 1 & 3) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase mb-2">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              Metabolic Hydration Engine
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Daily Water Intake: <span className="font-mono text-cyan-400">{(targetMl / 1000).toFixed(1)} l</span>
              </h1>
              <div className="border border-[#ff5500]/60 bg-[#ff5500]/10 text-[#ff7733] text-[11px] font-bold px-2 py-0.5 rounded uppercase">
                recommended
              </div>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
              Drinking optimal water increases resting energy expenditure by 24-30% within 10 minutes, assisting rapid fat breakdown.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetWater}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors text-xs flex items-center gap-1.5"
              title="Reset today's water"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* In-App Simulated Toast Notification */}
      {activeNotification && (
        <div className="fixed top-24 right-4 z-50 bg-slate-900 border-2 border-cyan-400 text-white p-4 rounded-xl shadow-2xl flex items-center gap-3 max-w-md animate-bounce">
          <Droplets className="w-6 h-6 text-cyan-400 animate-pulse shrink-0" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-cyan-300">Hydration Alert!</h4>
            <p className="text-xs text-slate-200">{activeNotification}</p>
          </div>
          <button 
            onClick={() => setActiveNotification(null)}
            className="text-xs text-slate-400 hover:text-white p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Water Progress & Interactive Bottle */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left: Interactive Bottle & Gauge */}
        <div className="md:col-span-5 bg-slate-900/80 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-between text-center space-y-4">
          
          <div className="w-full flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Current Status</span>
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              {progressPercent}% Met
            </span>
          </div>

          {/* Big Glass / Bottle Visual Animation */}
          <div className="relative w-36 h-60 border-4 border-cyan-400/50 rounded-b-3xl rounded-t-xl overflow-hidden bg-slate-950/60 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex items-end justify-center">
            {/* Water Fill Level */}
            <div 
              className="w-full bg-gradient-to-t from-cyan-600 via-cyan-500 to-cyan-400/90 transition-all duration-700 ease-out relative"
              style={{ height: `${progressPercent}%` }}
            >
              {/* Wave surface shimmer */}
              <div className="absolute -top-3 left-0 right-0 h-4 bg-cyan-300/40 rounded-full blur-[2px] animate-pulse"></div>
            </div>

            {/* Centered Percentage Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none drop-shadow-md">
              <span className="text-3xl font-black text-white font-mono">{formatMl(currentMl)}</span>
              <span className="text-xs text-slate-200 font-semibold">of {formatMl(targetMl)}</span>
            </div>
          </div>

          <div className="text-xs text-slate-400">
            {currentMl >= targetMl ? (
              <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Target Smashed! Great Hydration Today.
              </span>
            ) : (
              <span>Drink <strong className="text-white">{formatMl(targetMl - currentMl)}</strong> more to reach today's goal</span>
            )}
          </div>

        </div>

        {/* Right: Interactive 8-10 Glasses & Quick Log Buttons */}
        <div className="md:col-span-7 bg-slate-900/80 border border-white/10 rounded-2xl p-6 space-y-6 flex flex-col justify-between">
          
          {/* Glass Grid (Screenshot 1 replica) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-300">
                Tap Any Glass to Log 250ml
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {filledGlasses} / {totalGlasses} glasses
              </span>
            </div>

            {/* Clickable glass icons */}
            <div className="grid grid-cols-5 gap-2.5 p-3 bg-black/40 rounded-xl border border-white/5">
              {Array.from({ length: totalGlasses }).map((_, idx) => {
                const isFilled = idx < filledGlasses;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (isFilled) {
                        // Subtract 250ml
                        handleQuickAdd(-250);
                      } else {
                        // Add 250ml
                        handleQuickAdd(250);
                      }
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                      isFilled
                        ? 'border-cyan-400/80 bg-cyan-950/40 text-cyan-300 scale-102 shadow-sm'
                        : 'border-white/10 bg-slate-950/40 text-slate-600 hover:border-white/30'
                    }`}
                    title={isFilled ? `Glass ${idx + 1} logged (Click to remove)` : `Click to log glass ${idx + 1}`}
                  >
                    {/* Glass Graphic */}
                    <div className="w-6 h-9 border-2 border-current rounded-b-md relative overflow-hidden">
                      <div 
                        className={`absolute inset-x-0 bottom-0 bg-current transition-all duration-300 ${
                          isFilled ? 'h-full' : 'h-0'
                        }`}
                      />
                    </div>
                    <span className="text-[10px] font-mono mt-1 font-semibold">{idx + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Add Presets */}
          <div className="space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 block">
              Quick Log Presets
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleQuickAdd(250)}
                className="bg-slate-800 hover:bg-slate-700 border border-white/10 hover:border-cyan-400/50 p-2.5 rounded-xl text-center transition-all group"
              >
                <div className="text-xs font-bold text-white group-hover:text-cyan-400">+250 ml</div>
                <div className="text-[10px] text-slate-400">Glass</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickAdd(350)}
                className="bg-slate-800 hover:bg-slate-700 border border-white/10 hover:border-cyan-400/50 p-2.5 rounded-xl text-center transition-all group"
              >
                <div className="text-xs font-bold text-white group-hover:text-cyan-400">+350 ml</div>
                <div className="text-[10px] text-slate-400">Coffee Mug</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickAdd(500)}
                className="bg-slate-800 hover:bg-slate-700 border border-white/10 hover:border-cyan-400/50 p-2.5 rounded-xl text-center transition-all group"
              >
                <div className="text-xs font-bold text-white group-hover:text-cyan-400">+500 ml</div>
                <div className="text-[10px] text-slate-400">Water Bottle</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickAdd(750)}
                className="bg-slate-800 hover:bg-slate-700 border border-white/10 hover:border-cyan-400/50 p-2.5 rounded-xl text-center transition-all group"
              >
                <div className="text-xs font-bold text-white group-hover:text-cyan-400">+750 ml</div>
                <div className="text-[10px] text-slate-400">Gym Shaker</div>
              </button>
            </div>
          </div>

          {/* Custom ml input */}
          <div className="flex items-center gap-2 pt-1 border-t border-white/10">
            <input 
              type="number"
              step="50"
              min="50"
              value={customMl}
              onChange={(e) => setCustomMl(parseInt(e.target.value) || 250)}
              className="w-28 bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-cyan-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleQuickAdd(customMl)}
              className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all"
            >
              <Plus className="w-4 h-4 text-black" />
              <span>Log {customMl} ml</span>
            </button>
          </div>

        </div>

      </div>

      {/* Progress Reminders Throughout the Day (Prompt Requirement) */}
      <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <BellRing className="w-5 h-5 text-orange-400" />
              <span>Smart Hydration Reminders Throughout the Day</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Custom scheduled reminders strategically timed around meals and workouts to keep you consistent without thinking.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {onOpenNotificationCenter && (
              <button
                onClick={onOpenNotificationCenter}
                className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-bold text-xs py-2 px-3 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Configure All Reminders</span>
              </button>
            )}

            {notificationPermission !== 'granted' && (
              <button
                onClick={requestNotificationPermission}
                className="bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 font-bold text-xs py-2 px-3 rounded-xl flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Enable Phone Alerts</span>
              </button>
            )}
          </div>
        </div>

        {/* Reminders List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {reminders.map((rem) => (
            <div 
              key={rem.id}
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-2 ${
                rem.enabled 
                  ? 'bg-black/50 border-cyan-500/30 shadow-sm' 
                  : 'bg-black/20 border-white/5 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <input 
                  type="time" 
                  value={rem.time}
                  onChange={(e) => onUpdateReminderTime(rem.id, e.target.value)}
                  className="bg-slate-800 border border-white/10 rounded px-2 py-0.5 text-xs font-mono font-bold text-white focus:outline-none"
                />
                
                <button
                  type="button"
                  onClick={() => onToggleReminder(rem.id)}
                  className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                    rem.enabled ? 'bg-cyan-500' : 'bg-slate-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    rem.enabled ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-200 block">{rem.label}</span>
                <span className="text-[11px] text-cyan-400 font-mono font-semibold">+{rem.amountMl} ml</span>
              </div>

              <button
                type="button"
                onClick={() => handleSimulateReminder(rem)}
                className="text-[10px] text-slate-400 hover:text-orange-400 flex items-center gap-1 pt-1 border-t border-white/5"
              >
                <Volume2 className="w-3 h-3" />
                <span>Test Alert</span>
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
