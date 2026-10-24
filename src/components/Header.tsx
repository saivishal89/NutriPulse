import React from 'react';
import { 
  Flame, 
  Droplet, 
  Dumbbell, 
  Sliders, 
  Calendar, 
  Camera, 
  BarChart3, 
  Award,
  Sparkles,
  Zap
} from 'lucide-react';
import { User } from 'firebase/auth';
import { UserProfile, StreakState, WaterLog } from '../types';
import { formatMl } from '../utils/calculator';
import { GoogleAuthButton } from './GoogleAuthButton';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  profile: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  streaks: StreakState;
  waterLog: WaterLog;
  currentUser: User | null;
  onUserChanged: (user: User | null) => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  activeTab,
  setActiveTab,
  streaks,
  waterLog,
  currentUser,
  onUserChanged,
  onOpenProfile,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Today', icon: BarChart3, symbol: 'vital_signs' },
    { id: 'scanner', label: 'Scan AI', icon: Camera, symbol: 'photo_camera', highlight: true },
    { id: 'mealprep', label: 'Meals & Prep', icon: Calendar, symbol: 'restaurant_menu' },
    { id: 'workout', label: 'Workouts', icon: Dumbbell, symbol: 'fitness_center' },
    { id: 'water', label: 'Hydration', icon: Droplet, symbol: 'water_drop' },
    { id: 'streaks', label: 'Milestones', icon: Award, symbol: 'military_tech' },
    { id: 'reports', label: 'Insights', icon: Sparkles, symbol: 'insights' },
  ];

  return (
    <header className="sticky top-0 w-full z-40 pt-safe bg-[#0f131c]/90 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 group text-left cursor-pointer"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#ff5708] to-[#ff8c42] text-white flex items-center justify-center shadow-[0_0_20px_rgba(255,87,8,0.35)] group-hover:scale-105 transition-transform flex-shrink-0">
                <Zap className="w-5 h-5 fill-white text-white stroke-[2.5]" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-headline text-base sm:text-lg font-bold tracking-tight text-[#dfe2ef] truncate uppercase">
                    NUTRIPULSE
                  </span>
                  <span className="hidden xs:inline px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#ff5708]/20 text-[#ffdbcf] border border-[#ff5708]/30">
                    PRO
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#e5beb2]/70 uppercase tracking-wider truncate hidden sm:block">
                  AI Diet & Workout Engine
                </span>
              </div>
            </button>
          </div>

          {/* Athletic Telemetry Quick Status Strip */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            
            {/* Streak Counter Capsule */}
            <button 
              onClick={() => setActiveTab('streaks')}
              className="flex items-center gap-1.5 bg-[#262a34]/60 hover:bg-[#262a34] backdrop-blur-md px-2.5 py-1 sm:py-1.5 rounded-full border border-white/5 transition-colors cursor-pointer"
              title="Daily Active Streak"
            >
              <span className="text-xs">🔥</span>
              <span className="font-mono text-xs font-semibold text-[#ffdbcf]">
                {streaks.foodStreak} <span className="hidden sm:inline font-normal text-slate-400">Days</span>
              </span>
            </button>

            {/* Hydration Capsule */}
            <button 
              onClick={() => setActiveTab('water')}
              className="hidden xs:flex items-center gap-1.5 bg-[#262a34]/60 hover:bg-[#262a34] backdrop-blur-md px-2.5 py-1 sm:py-1.5 rounded-full border border-white/5 transition-colors cursor-pointer"
              title="Water Logged Today"
            >
              <span className="text-xs">💧</span>
              <span className="font-mono text-xs font-semibold text-[#4cd7f6]">
                {(waterLog.intakeMl / 1000).toFixed(1)}L
              </span>
            </button>

            {/* Health Target & Profile Modal Trigger */}
            <button
              onClick={onOpenProfile}
              className="bg-[#1c1f29] hover:bg-[#262a34] border border-white/10 hover:border-[#ff5708]/50 text-[#dfe2ef] px-2.5 sm:px-3 py-1.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              title="Configure Profile, Goal & BMI"
            >
              <Sliders className="w-3.5 h-3.5 text-[#ffb59c]" />
              <div className="text-left text-xs hidden md:block">
                <div className="flex items-center gap-1">
                  <span className="font-bold font-mono text-white">{profile.bmi} BMI</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-[#ff5708]/15 text-[#ffdbcf] rounded font-semibold uppercase">
                    {profile.bmiCategory}
                  </span>
                </div>
              </div>
            </button>

            {/* PWA / APK Phone Download Button */}
            <PWAInstallButton />

            {/* Google OAuth Login Button */}
            <GoogleAuthButton 
              currentUser={currentUser} 
              onUserChanged={onUserChanged} 
            />

          </div>
        </div>
      </div>

      {/* Desktop/Tablet Horizontal Nav Strip */}
      <nav className="hidden md:block border-t border-white/5 bg-[#181b25]/80 backdrop-blur-md overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 sm:gap-2 py-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#ff5708] text-white shadow-[0_0_16px_rgba(255,87,8,0.4)] font-bold'
                    : tab.highlight
                    ? 'text-[#ffb59c] hover:text-white hover:bg-[#ff5708]/15 border border-[#ff5708]/30'
                    : 'text-[#dfe2ef]/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.highlight ? 'text-[#ffb59c]' : 'text-[#dfe2ef]/70'}`} />
                <span>{tab.label}</span>
                {tab.highlight && !isActive && (
                  <span className="text-[9px] bg-[#ff5708] text-white px-1.5 py-0.2 rounded-full font-bold uppercase">
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
