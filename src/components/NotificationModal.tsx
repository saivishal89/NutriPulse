import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellRing, 
  X, 
  Check, 
  Clock, 
  Droplet, 
  Utensils, 
  Dumbbell, 
  Flame, 
  Volume2, 
  VolumeX, 
  Vibrate, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Send, 
  Settings2, 
  Inbox, 
  ExternalLink 
} from 'lucide-react';
import { AppNotification, NotificationSettings, NotificationCategory } from '../types';
import { 
  requestNotificationPermission, 
  getNotificationPermissionStatus,
  dispatchNotification 
} from '../utils/notifications';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NotificationSettings;
  onUpdateSettings: (newSettings: NotificationSettings) => void;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onClearHistory: () => void;
  onSelectActionTab: (tab: string) => void;
  onTriggerTestNotification: (category?: NotificationCategory) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  notifications,
  onMarkAllAsRead,
  onClearHistory,
  onSelectActionTab,
  onTriggerTestNotification,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'inbox' | 'settings'>('inbox');
  const [permissionStatus, setPermissionStatus] = useState<string>('default');
  const [isRequestingPerm, setIsRequestingPerm] = useState(false);
  const [toastFeedback, setToastFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPermissionStatus(getNotificationPermissionStatus());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleRequestPermission = async () => {
    setIsRequestingPerm(true);
    const status = await requestNotificationPermission();
    setPermissionStatus(status);
    setIsRequestingPerm(false);

    if (status === 'granted') {
      setToastFeedback('✓ Notifications enabled for your device!');
      onTriggerTestNotification('system');
      setTimeout(() => setToastFeedback(null), 3500);
    } else if (status === 'denied') {
      setToastFeedback('⚠️ Permission was blocked in browser settings.');
      setTimeout(() => setToastFeedback(null), 4000);
    }
  };

  const handleToggle = (key: keyof NotificationSettings) => {
    onUpdateSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  const handleTimeChange = (key: keyof NotificationSettings, value: string) => {
    onUpdateSettings({
      ...settings,
      [key]: value,
    });
  };

  const handleIntervalChange = (minutes: number) => {
    onUpdateSettings({
      ...settings,
      hydrationIntervalMinutes: minutes,
    });
  };

  const formatTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diff = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (e) {
      return 'Recently';
    }
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'hydration':
        return <Droplet className="w-4 h-4 text-cyan-400" />;
      case 'meal':
        return <Utensils className="w-4 h-4 text-amber-400" />;
      case 'workout':
        return <Dumbbell className="w-4 h-4 text-emerald-400" />;
      case 'streak':
        return <Flame className="w-4 h-4 text-[#ff5708]" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl max-h-[90vh] bg-[#10141f] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#dfe2ef]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/5 bg-[#141926]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ff5708]/20 border border-[#ff5708]/30 flex items-center justify-center text-[#ff8c42]">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Notification Center
                {unreadCount > 0 && (
                  <span className="bg-[#ff5708] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Hydration, meal schedules, workout prompts & streaks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Banner */}
        {toastFeedback && (
          <div className="bg-[#ff5708]/15 border-b border-[#ff5708]/30 px-5 py-2 text-xs font-semibold text-[#ffdbcf] flex items-center gap-2 animate-in fade-in">
            <Sparkles className="w-4 h-4 text-[#ff8c42]" />
            <span>{toastFeedback}</span>
          </div>
        )}

        {/* Permission Status Callout */}
        <div className="px-5 sm:px-6 pt-4 pb-2">
          {permissionStatus === 'granted' ? (
            <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-emerald-300">Device Notifications Active</span>
                  <p className="text-slate-400 text-[11px]">System notifications are enabled on this device.</p>
                </div>
              </div>
              <button
                onClick={() => onTriggerTestNotification()}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0"
              >
                <Send className="w-3 h-3" />
                <span>Test Alert</span>
              </button>
            </div>
          ) : permissionStatus === 'denied' ? (
            <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-amber-300">Notifications Blocked in Browser</span>
                <p className="text-slate-400 text-[11px]">
                  To receive phone alerts, tap the lock/tune icon near your browser address bar and switch Notifications to Allow.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#ff5708]/10 border border-[#ff5708]/30 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Bell className="w-5 h-5 text-[#ff8c42] flex-shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-white">Enable Phone & System Notifications</span>
                  <p className="text-slate-400 text-[11px]">Receive reminders for water intake, meals, and workout streaks.</p>
                </div>
              </div>
              <button
                onClick={handleRequestPermission}
                disabled={isRequestingPerm}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff5708] to-[#ff8c42] text-white text-xs font-bold shadow-[0_0_15px_rgba(255,87,8,0.4)] hover:brightness-110 transition-all flex items-center justify-center gap-1.5 cursor-pointer flex-shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isRequestingPerm ? 'Enabling...' : 'Enable Alerts'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Tab switcher: Inbox vs Settings */}
        <div className="flex items-center gap-2 px-5 sm:px-6 pt-2 pb-1 border-b border-white/5">
          <button
            onClick={() => setActiveSubTab('inbox')}
            className={`flex items-center gap-2 pb-2.5 px-3 border-b-2 font-medium text-xs sm:text-sm transition-all cursor-pointer ${
              activeSubTab === 'inbox'
                ? 'border-[#ff5708] text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Alerts Feed</span>
            {unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#ff5708]" />
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('settings')}
            className={`flex items-center gap-2 pb-2.5 px-3 border-b-2 font-medium text-xs sm:text-sm transition-all cursor-pointer ${
              activeSubTab === 'settings'
                ? 'border-[#ff5708] text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings2 className="w-4 h-4" />
            <span>Schedules & Controls</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
          
          {/* TAB 1: INBOX */}
          {activeSubTab === 'inbox' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs text-slate-400 font-medium">
                  {notifications.length} {notifications.length === 1 ? 'alert' : 'alerts'} logged
                </span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={onMarkAllAsRead}
                      className="text-[11px] text-[#ff8c42] hover:text-white transition-colors cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={onClearHistory}
                      className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-white/10 rounded-2xl">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <Bell className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">No alerts yet</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    You're all caught up! Hydration checks, meal timers, and workout reminders will appear here.
                  </p>
                  <button
                    onClick={() => onTriggerTestNotification('hydration')}
                    className="mt-4 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <Droplet className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Send Hydration Test Alert</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        notif.read 
                          ? 'bg-[#151924]/50 border-white/5 text-slate-300' 
                          : 'bg-[#1a2030] border-[#ff5708]/30 shadow-md text-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            {getCategoryIcon(notif.category)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs sm:text-sm font-bold text-white">
                                {notif.title}
                              </h4>
                              {!notif.read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#ff5708]" />
                              )}
                            </div>
                            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-slate-500 font-mono mt-1.5 block">
                              {formatTimestamp(notif.timestamp)}
                            </span>
                          </div>
                        </div>

                        {notif.actionTab && (
                          <button
                            onClick={() => {
                              onSelectActionTab(notif.actionTab!);
                              onClose();
                            }}
                            className="px-2.5 py-1 bg-white/5 hover:bg-[#ff5708] border border-white/10 hover:border-[#ff5708] rounded-lg text-[11px] font-semibold text-slate-200 hover:text-white transition-all flex items-center gap-1 cursor-pointer flex-shrink-0"
                          >
                            <span>{notif.actionLabel || 'View'}</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SCHEDULES & CONTROLS */}
          {activeSubTab === 'settings' && (
            <div className="space-y-4">
              
              {/* Master Alert Switch */}
              <div className="p-4 rounded-2xl bg-[#151926] border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Master Notification Engine</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Allow scheduled timers to prompt alerts
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('enabled')}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    settings.enabled ? 'bg-[#ff5708]' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Hydration Reminders Card */}
              <div className="p-4 rounded-2xl bg-[#151926] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                      <Droplet className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Hydration Drink Reminders</h4>
                      <p className="text-xs text-slate-400">Regular water prompts during active hours</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle('hydrationReminders')}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      settings.hydrationReminders ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                        settings.hydrationReminders ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {settings.hydrationReminders && (
                  <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-slate-400">Remind me every:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[30, 45, 60, 90, 120].map((mins) => (
                        <button
                          key={mins}
                          onClick={() => handleIntervalChange(mins)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                            settings.hydrationIntervalMinutes === mins
                              ? 'bg-cyan-500 text-slate-950 shadow-sm'
                              : 'bg-white/5 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Meal Times Schedule Card */}
              <div className="p-4 rounded-2xl bg-[#151926] border border-white/10 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Daily Meal Schedule Alerts</h4>
                    <p className="text-xs text-slate-400">Prompts to record food & maintain macros</p>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  {/* Breakfast */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">Breakfast</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={settings.breakfastTime}
                        onChange={(e) => handleTimeChange('breakfastTime', e.target.value)}
                        className="bg-[#0e111a] border border-white/10 rounded-lg px-2 py-1 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-400"
                      />
                      <button
                        onClick={() => handleToggle('breakfastReminder')}
                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                          settings.breakfastReminder ? 'bg-amber-500' : 'bg-slate-700'
                        }`}
                      >
                        <span
                          className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                            settings.breakfastReminder ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Lunch */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">Lunch</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={settings.lunchTime}
                        onChange={(e) => handleTimeChange('lunchTime', e.target.value)}
                        className="bg-[#0e111a] border border-white/10 rounded-lg px-2 py-1 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-400"
                      />
                      <button
                        onClick={() => handleToggle('lunchReminder')}
                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                          settings.lunchReminder ? 'bg-amber-500' : 'bg-slate-700'
                        }`}
                      >
                        <span
                          className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                            settings.lunchReminder ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Dinner */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">Dinner</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={settings.dinnerTime}
                        onChange={(e) => handleTimeChange('dinnerTime', e.target.value)}
                        className="bg-[#0e111a] border border-white/10 rounded-lg px-2 py-1 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-400"
                      />
                      <button
                        onClick={() => handleToggle('dinnerReminder')}
                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                          settings.dinnerReminder ? 'bg-amber-500' : 'bg-slate-700'
                        }`}
                      >
                        <span
                          className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                            settings.dinnerReminder ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Workout Alert Card */}
              <div className="p-4 rounded-2xl bg-[#151926] border border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Daily Workout Call</h4>
                    <p className="text-xs text-slate-400">Gym or home session prompt</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={settings.workoutTime}
                    onChange={(e) => handleTimeChange('workoutTime', e.target.value)}
                    className="bg-[#0e111a] border border-white/10 rounded-lg px-2 py-1 text-xs font-mono text-emerald-400 focus:outline-none"
                  />
                  <button
                    onClick={() => handleToggle('workoutReminder')}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                      settings.workoutReminder ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        settings.workoutReminder ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Streak Guardian */}
              <div className="p-4 rounded-2xl bg-[#151926] border border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#ff5708]/20 text-[#ff8c42] flex items-center justify-center">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Streak Guardian</h4>
                    <p className="text-xs text-slate-400">Alert at 8:00 PM if targets are not yet logged</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle('streakAlerts')}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    settings.streakAlerts ? 'bg-[#ff5708]' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.streakAlerts ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Sound & Haptics */}
              <div className="p-4 rounded-2xl bg-[#151926] border border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-slate-300" />
                    <span className="text-xs font-medium text-white">Chime Sound</span>
                  </div>
                  <button
                    onClick={() => handleToggle('soundEnabled')}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                      settings.soundEnabled ? 'bg-[#ff5708]' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        settings.soundEnabled ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2">
                    <Vibrate className="w-4 h-4 text-slate-300" />
                    <span className="text-xs font-medium text-white">Phone Vibration</span>
                  </div>
                  <button
                    onClick={() => handleToggle('vibrationEnabled')}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                      settings.vibrationEnabled ? 'bg-[#ff5708]' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        settings.vibrationEnabled ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer with Quick Test triggers */}
        <div className="p-4 sm:p-5 border-t border-white/5 bg-[#141926] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-mono text-slate-400 mr-1">Quick Test:</span>
            <button
              onClick={() => onTriggerTestNotification('hydration')}
              className="px-2.5 py-1 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
            >
              <Droplet className="w-3 h-3" />
              <span>Water</span>
            </button>
            <button
              onClick={() => onTriggerTestNotification('meal')}
              className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
            >
              <Utensils className="w-3 h-3" />
              <span>Meal</span>
            </button>
            <button
              onClick={() => onTriggerTestNotification('workout')}
              className="px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
            >
              <Dumbbell className="w-3 h-3" />
              <span>Workout</span>
            </button>
            <button
              onClick={() => onTriggerTestNotification('streak')}
              className="px-2.5 py-1 bg-[#ff5708]/15 hover:bg-[#ff5708]/25 border border-[#ff5708]/30 text-[#ff8c42] rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
            >
              <Flame className="w-3 h-3" />
              <span>Streak</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-[#ff5708] hover:bg-[#ff7028] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md ml-auto"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
