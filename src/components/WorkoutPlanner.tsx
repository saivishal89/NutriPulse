import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ChevronRight,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Check,
  Edit3
} from 'lucide-react';
import { WeeklyWorkoutPlan, UserProfile } from '../types';
import { sounds } from '../utils/sound';

interface WorkoutPlannerProps {
  profile: UserProfile;
  workoutPlan: WeeklyWorkoutPlan;
  onUpdateWorkoutPlan: (plan: WeeklyWorkoutPlan) => void;
  onCompleteWorkout: (dayNumber: number) => void;
}

export const WorkoutPlanner: React.FC<WorkoutPlannerProps> = ({
  profile,
  workoutPlan,
  onUpdateWorkoutPlan,
  onCompleteWorkout,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [isSessionPaused, setIsSessionPaused] = useState(false);
  const [isAudioBeepOn, setIsAudioBeepOn] = useState(true);

  // Rest Timer state
  const [restSecondsLeft, setRestSecondsLeft] = useState(75); // 01:15
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);

  // Active Exercise & Sets tracking
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [exerciseSetsState, setExerciseSetsState] = useState<Record<string, boolean[]>>({
    'ex-0': [true, true, true, false],
    'ex-1': [false, false, false],
    'ex-2': [false, false, false],
  });

  // Load adjustment drawer
  const [isLoadDrawerOpen, setIsLoadDrawerOpen] = useState(false);
  const [currentWeightKg, setCurrentWeightKg] = useState(32);
  const [currentReps, setCurrentReps] = useState(10);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isWorkoutFinished, setIsWorkoutFinished] = useState(false);

  const currentDay = workoutPlan.days[selectedDayIndex] || workoutPlan.days[0];

  // Rest timer countdown
  useEffect(() => {
    let interval: any = null;
    if (isRestTimerActive && restSecondsLeft > 0) {
      interval = setInterval(() => {
        setRestSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsRestTimerActive(false);
            if (isAudioBeepOn) sounds.alarm();
            return 0;
          }
          if (prev <= 3 && isAudioBeepOn) {
            sounds.tap();
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRestTimerActive, restSecondsLeft, isAudioBeepOn]);

  const toggleSetChip = (exIndex: number, setIndex: number) => {
    sounds.tap();
    const key = `ex-${exIndex}`;
    const sets = exerciseSetsState[key] ? [...exerciseSetsState[key]] : [false, false, false, false];
    sets[setIndex] = !sets[setIndex];

    setExerciseSetsState((prev) => ({
      ...prev,
      [key]: sets,
    }));

    if (sets[setIndex]) {
      // Trigger rest timer
      setRestSecondsLeft(75);
      setIsRestTimerActive(true);
      sounds.success();
    }
  };

  const handleNextMove = () => {
    sounds.tap();
    if (activeExerciseIndex < (currentDay?.exercises?.length || 3) - 1) {
      setActiveExerciseIndex((prev) => prev + 1);
    } else {
      // Finish Workout
      sounds.success();
      setIsWorkoutFinished(true);
      onCompleteWorkout(currentDay.dayNumber || 1);
    }
  };

  const handleConfirmSetLoad = () => {
    sounds.success();
    // Complete current pending set in active exercise
    const key = `ex-${activeExerciseIndex}`;
    const sets = exerciseSetsState[key] ? [...exerciseSetsState[key]] : [false, false, false, false];
    const firstPendingIdx = sets.findIndex((s) => !s);
    if (firstPendingIdx !== -1) {
      sets[firstPendingIdx] = true;
      setExerciseSetsState((prev) => ({ ...prev, [key]: sets }));
    }

    setRestSecondsLeft(75);
    setIsRestTimerActive(true);
    setIsLoadDrawerOpen(false);
  };

  const formatRestTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleRegenerateSplit = async () => {
    setIsRegenerating(true);
    sounds.camera();

    try {
      const response = await fetch('/api/generate-workout-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fitnessLevel: profile.experienceLevel,
          goal: profile.goal,
          equipment: profile.equipment,
          daysPerWeek: 5,
        }),
      });

      if (response.ok) {
        const newPlan = await response.json();
        if (newPlan?.days?.length > 0) {
          onUpdateMealPlanFallback(newPlan);
          sounds.success();
        }
      }
    } catch (err) {
      console.error('Failed to regenerate workouts:', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const onUpdateMealPlanFallback = (plan: WeeklyWorkoutPlan) => {
    onUpdateWorkoutPlan(plan);
  };

  // Pre-configured exercise photos matching Stitch Screen 4
  const exercisePhotos = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAL-2tNdCEADJBCL3H5bY2O4KgDc4HDxIP9qMHhYMn0VfnsTJNbKFiq5GEd06CvQE_tCQ4CQT8xMOnFqIixj8pxx2GPQJTJYHdR6KauQmmWpjRdCj43t0NFlTAfu0OSybxnsRlySXEvLlDJ0BBw2mP5NFUthOGx1Gy6nQpM_D-8KmhPlEgaWujdqHZs2hXWXze9yaJWWVMu1mfgJHuMMh6op3QgAs3Qn_MoRQgHRb9waMttZbVmOB_vRA",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCMv6jnBCXc7wvY9m1nVmbJwnAlHvYkQ7r3Bm6eoftX5Il-Fc0pm00dSCFfaUbqZFQ2y6PDEIazG0UfepS239P8xjm49VwBu53hVh7ff5pav5FkdpMykPDoaryKXdnyIwOCK6Qz-4IBmdeqwazxyTMCxmBqeMhho83O1zPuRJ4zZ8giJCgOFdWl2Pl3Rqm8VEo3_DtHEo_TBaP0TqvRPjjvffTIXI3NqIJtn0WxprJ2oMfDzcxo1DOsbg",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBLU5DTWtHM1Y4S2j_EoWwMCT9q90bUh6-TCSeLumX99Xaq4QpR02L1ad9StYjZuCd9NTMXFJIiMOIM1FEpwBkNOREsfevoqwae5GL1lZj3sLjFd8ILk09_Fx9WabFIGAcQaEtlVDJ5OdmHnn_wgu6VBjWKiCExG-a_D5GAtMjqZNHZHmBPqM5oGU2guF37ggMyp135_swEAq3l-k7Eep3QXuIKWBkAeDD8lFO9vJktJm1fiyjKGDv_Aw"
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 space-y-4 pb-28">
      
      {/* Workout Routine Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#262a34] p-4 sm:p-5 shadow-lg border border-white/5">
        <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-[#ff5708]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#ff5708]/20 text-[#ffb59c] font-mono text-[10px] font-semibold uppercase tracking-wider border border-[#ff5708]/30">
                Live Session
              </span>
              <span className="inline-flex items-center gap-1 text-[#e5beb2]/80 font-mono text-xs">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                <span>{currentDay?.durationMinutes || 25} Min</span>
              </span>
            </div>
            <h1 className="font-headline text-lg sm:text-xl font-bold text-[#dfe2ef] truncate">
              {currentDay?.focus || 'Hypertrophy Push Split'}
            </h1>
            <p className="text-xs text-[#e5beb2]/70 mt-0.5">
              {currentDay?.focus || 'Chest, Shoulders & Triceps Focus'} • {profile.goal.toUpperCase()}
            </p>
          </div>

          <button
            type="button"
            onClick={handleRegenerateSplit}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 bg-[#1c1f29] hover:bg-[#31353f] border border-white/10 text-[#dfe2ef] px-3 py-1.5 rounded-xl font-headline text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 text-[#ffb59c] ${isRegenerating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">AI Split Engine</span>
          </button>
        </div>
      </div>

      {/* Live Telemetry HUD Deck */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Rest Countdown Timer */}
        <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1c1f29] backdrop-blur-md shadow-md text-center relative overflow-hidden border border-white/5">
          <div className="flex items-center gap-1 text-[#e5beb2]/80 mb-0.5">
            <span className="material-symbols-outlined text-[14px] text-[#ff5708]">timer</span>
            <span className="font-mono text-[10px] uppercase tracking-wide">Rest Timer</span>
          </div>
          <div className="flex items-baseline justify-center">
            <span className="font-headline text-2xl font-bold text-[#ffb59c] tracking-tight">
              {formatRestTimer(restSecondsLeft)}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <button
              type="button"
              onClick={() => setIsAudioBeepOn((prev) => !prev)}
              className="flex items-center gap-1 text-[#e5beb2]/80 hover:text-[#ff5708] transition-colors cursor-pointer text-[10px] font-mono"
            >
              {isAudioBeepOn ? (
                <>
                  <Volume2 className="w-3 h-3 text-[#ff5708]" />
                  <span>Beep ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3 h-3 text-slate-500" />
                  <span>Beep OFF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Heart Rate Telemetry */}
        <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1c1f29] backdrop-blur-md shadow-md text-center relative overflow-hidden border border-white/5">
          <div className="flex items-center gap-1 text-[#e5beb2]/80 mb-0.5">
            <span className="material-symbols-outlined text-[14px] text-[#4cd7f6] animate-pulse">favorite</span>
            <span className="font-mono text-[10px] uppercase tracking-wide">Pulse</span>
          </div>
          <div className="flex items-baseline justify-center gap-1">
            <span className="font-headline text-2xl text-[#4cd7f6] font-bold">138</span>
            <span className="font-mono text-[10px] text-[#acedff]">BPM</span>
          </div>
          <span className="mt-1 px-1.5 py-0.2 rounded bg-[#03b5d3]/20 text-[#4cd7f6] font-mono text-[9px] uppercase tracking-wider font-semibold border border-[#03b5d3]/30">
            Aerobic Cyan
          </span>
        </div>

        {/* Active Set Counter Tracker */}
        <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1c1f29] backdrop-blur-md shadow-md text-center relative overflow-hidden border border-white/5">
          <div className="flex items-center gap-1 text-[#e5beb2]/80 mb-0.5">
            <span className="material-symbols-outlined text-[14px] text-[#4edea3]">repeat</span>
            <span className="font-mono text-[10px] uppercase tracking-wide">Current</span>
          </div>
          <div className="flex items-baseline justify-center gap-1">
            <span className="font-headline text-2xl text-[#dfe2ef] font-bold">
              Set {exerciseSetsState[`ex-${activeExerciseIndex}`]?.filter(Boolean).length || 3}
            </span>
            <span className="font-mono text-xs text-[#e5beb2]/70">/ 4</span>
          </div>
          <div className="w-full bg-[#31353f] h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-[#4edea3] h-full rounded-full transition-all duration-300"
              style={{
                width: `${((exerciseSetsState[`ex-${activeExerciseIndex}`]?.filter(Boolean).length || 0) / 4) * 100}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Active Exercise & Routine List */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <span className="font-mono text-xs uppercase tracking-wider text-[#e5beb2]/80">
            Prescribed Movements
          </span>
          <span className="font-mono text-xs text-[#ff5708] font-medium">
            {currentDay?.exercises?.length || 3} Exercises
          </span>
        </div>

        {/* Exercise cards */}
        {currentDay?.exercises?.map((exercise, exIdx) => {
          const isActive = exIdx === activeExerciseIndex;
          const photo = exercisePhotos[exIdx % exercisePhotos.length];
          const setsKey = `ex-${exIdx}`;
          const currentSets = exerciseSetsState[setsKey] || [false, false, false, false];

          return (
            <div
              key={exercise.name || exIdx}
              className={`rounded-2xl p-4 shadow-md relative overflow-hidden transition-all border ${
                isActive
                  ? 'bg-[#262a34] border-[#ff5708]/40 shadow-[0_0_20px_rgba(255,87,8,0.15)]'
                  : 'bg-[#1c1f29] border-white/5 hover:border-white/10'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff5708] via-[#ffb59c] to-[#4cd7f6]" />
              )}

              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-xl bg-[#0a0e17] overflow-hidden flex-shrink-0 relative shadow-inner">
                  <img
                    src={photo}
                    alt={exercise.name}
                    className="w-full h-full object-cover"
                  />
                  {isActive && (
                    <div className="absolute bottom-0 inset-x-0 bg-[#ff5708]/90 text-white font-mono text-[9px] text-center font-bold py-0.5 uppercase">
                      Active
                    </div>
                  )}
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h2 className="font-headline text-sm sm:text-base font-semibold text-[#dfe2ef] truncate">
                      {exercise.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-[#ff5708]/15 text-[#ffdbcf] font-mono text-[10px] font-semibold border border-[#ff5708]/20">
                      {exercise.targetMuscle || 'Hypertrophy'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-[#e5beb2]/80 font-mono text-xs">
                    <span>
                      Target: <strong className="text-[#dfe2ef]">{exercise.weightUsed ? `${exercise.weightUsed} × ` : ''}{exercise.reps} reps</strong>
                    </span>
                    <span>•</span>
                    <span className="text-[#4edea3]">{exercise.sets || 4} Sets</span>
                  </div>

                  {/* Set Visual Interactive Chips */}
                  <div className="grid grid-cols-4 gap-1.5 mt-3">
                    {Array.from({ length: exercise.sets || 4 }).map((_, setIdx) => {
                      const isDone = currentSets[setIdx];
                      const isNextToExecute = isActive && !isDone && (setIdx === 0 || currentSets[setIdx - 1]);

                      return (
                        <button
                          key={setIdx}
                          type="button"
                          onClick={() => toggleSetChip(exIdx, setIdx)}
                          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
                            isDone
                              ? 'bg-[#00a572]/20 text-[#4edea3] border border-[#00a572]/30'
                              : isNextToExecute
                              ? 'bg-[#ff5708] text-white shadow-[0_0_12px_rgba(255,87,8,0.4)] animate-pulse'
                              : 'bg-[#181b25] text-[#e5beb2]/50 hover:bg-[#31353f] border border-white/5'
                          }`}
                        >
                          <span className="font-mono text-[10px] font-bold">
                            SET {setIdx + 1}
                          </span>
                          {isDone ? (
                            <span className="material-symbols-outlined text-[15px] font-bold">
                              check_circle
                            </span>
                          ) : isNextToExecute ? (
                            <span className="font-mono text-[10px] font-bold">
                              GO!
                            </span>
                          ) : (
                            <span className="material-symbols-outlined text-[15px] opacity-40">
                              circle
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-Time Workout Control Console */}
      <div className="rounded-2xl bg-[#262a34] p-4 shadow-lg flex flex-col gap-3 border border-white/5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wide text-[#e5beb2]/80">
            Active Command
          </span>
          <span className="font-mono text-xs text-[#ff5708] font-bold">
            Live Synced
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {/* Pause / Resume Session Button */}
          <button
            type="button"
            onClick={() => {
              sounds.tap();
              setIsSessionPaused((prev) => !prev);
            }}
            className="flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl bg-[#1c1f29] hover:bg-[#31353f] text-[#dfe2ef] transition-all active:scale-95 shadow-sm cursor-pointer border border-white/5"
          >
            <span className="material-symbols-outlined text-[24px]">
              {isSessionPaused ? 'play_circle' : 'pause_circle'}
            </span>
            <span className="font-mono text-xs font-semibold">
              {isSessionPaused ? 'Resume' : 'Pause'}
            </span>
          </button>

          {/* Log Set Trigger */}
          <button
            type="button"
            onClick={() => {
              sounds.tap();
              setIsLoadDrawerOpen((prev) => !prev);
            }}
            className="flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl bg-[#1c1f29] hover:bg-[#31353f] text-[#4cd7f6] transition-all active:scale-95 shadow-sm cursor-pointer border border-white/5"
          >
            <span className="material-symbols-outlined text-[24px]">edit_note</span>
            <span className="font-mono text-xs font-semibold">
              {isLoadDrawerOpen ? 'Close Load' : 'Log Load'}
            </span>
          </button>

          {/* Next Move / Finish */}
          <button
            type="button"
            onClick={handleNextMove}
            className="flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl bg-[#ff5708] text-white shadow-[0_4px_16px_rgba(255,87,8,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px]">skip_next</span>
            <span className="font-mono text-xs font-semibold">Next Move</span>
          </button>
        </div>

        {/* Quick Inline Rep & Load Micro-Adjustment Form */}
        {isLoadDrawerOpen && (
          <div className="flex flex-col gap-3 pt-3 border-t border-white/5 mt-1">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] text-[#e5beb2]/80 uppercase">
                  Weight (KG)
                </label>
                <div className="flex items-center bg-[#0a0e17] rounded-xl p-1.5 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setCurrentWeightKg((w) => Math.max(0, w - 2.5))}
                    className="w-8 h-8 rounded-lg bg-[#1c1f29] text-white flex items-center justify-center active:scale-95 font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-full text-center font-mono text-sm font-bold text-[#dfe2ef]">
                    {currentWeightKg}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentWeightKg((w) => w + 2.5)}
                    className="w-8 h-8 rounded-lg bg-[#1c1f29] text-white flex items-center justify-center active:scale-95 font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] text-[#e5beb2]/80 uppercase">
                  Reps Done
                </label>
                <div className="flex items-center bg-[#0a0e17] rounded-xl p-1.5 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setCurrentReps((r) => Math.max(1, r - 1))}
                    className="w-8 h-8 rounded-lg bg-[#1c1f29] text-white flex items-center justify-center active:scale-95 font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-full text-center font-mono text-sm font-bold text-[#dfe2ef]">
                    {currentReps}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentReps((r) => r + 1)}
                    className="w-8 h-8 rounded-lg bg-[#1c1f29] text-white flex items-center justify-center active:scale-95 font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmSetLoad}
              className="w-full py-2.5 rounded-xl bg-[#00a572] hover:bg-[#008f62] text-white font-headline text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">done_all</span>
              <span>Confirm & Start 75s Rest</span>
            </button>
          </div>
        )}
      </div>

      {/* Post-Session Biometric Forecast Card */}
      <div className="rounded-2xl bg-[#1c1f29] p-4 shadow-md border border-white/5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#ff5708]">local_fire_department</span>
            <span className="font-headline text-sm text-[#dfe2ef] font-semibold">
              Post-Session Estimate
            </span>
          </div>
          <span className="font-mono text-[10px] text-[#4edea3] uppercase tracking-wider font-semibold">
            EPOC Active
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex flex-col p-3 rounded-xl bg-[#262a34]/70 border border-white/5 shadow-inner">
            <span className="font-mono text-[10px] text-[#e5beb2]/80 uppercase">Projected Burn</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-headline text-2xl text-[#ff5708] font-bold">285</span>
              <span className="font-mono text-[10px] text-[#e5beb2]/70 font-semibold">kCal</span>
            </div>
            <span className="text-[10px] text-[#e5beb2]/60 mt-0.5">High metabolic demand</span>
          </div>

          <div className="flex flex-col p-3 rounded-xl bg-[#262a34]/70 border border-white/5 shadow-inner">
            <span className="font-mono text-[10px] text-[#e5beb2]/80 uppercase">Target Muscle Load</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-headline text-2xl text-[#4cd7f6] font-bold">94%</span>
              <span className="font-mono text-[10px] text-[#e5beb2]/70 font-semibold">Optimal</span>
            </div>
            <span className="text-[10px] text-[#e5beb2]/60 mt-0.5">Hypertrophy stimulus achieved</span>
          </div>
        </div>
      </div>

      {/* Finish Notification Modal if completed */}
      {isWorkoutFinished && (
        <div className="rounded-2xl bg-gradient-to-r from-[#00a572] to-[#007b55] p-5 text-white shadow-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Check className="w-6 h-6 text-white stroke-[3]" />
            </div>
            <div>
              <h3 className="font-headline text-base font-bold">Session Completed!</h3>
              <p className="font-mono text-xs text-white/80">
                +285 kcal burned • +1 Day added to workout streak
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsWorkoutFinished(false)}
            className="px-4 py-2 rounded-xl bg-white text-black font-headline text-xs font-bold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

    </div>
  );
};
