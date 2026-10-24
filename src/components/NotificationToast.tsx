import React, { useEffect } from 'react';
import { Bell, Droplet, Utensils, Dumbbell, Flame, X, ArrowRight } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationToastProps {
  notification: AppNotification | null;
  onClose: () => void;
  onAction?: (tab: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  onAction,
}) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onClose();
    }, 6000);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  const getIcon = () => {
    switch (notification.category) {
      case 'hydration':
        return <Droplet className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />;
      case 'meal':
        return <Utensils className="w-5 h-5 text-amber-400" />;
      case 'workout':
        return <Dumbbell className="w-5 h-5 text-emerald-400" />;
      case 'streak':
        return <Flame className="w-5 h-5 text-[#ff5708] fill-[#ff5708]/30" />;
      default:
        return <Bell className="w-5 h-5 text-[#ff8c42]" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.category) {
      case 'hydration':
        return 'border-cyan-500/40 shadow-[0_8px_30px_rgba(6,182,212,0.25)]';
      case 'workout':
        return 'border-emerald-500/40 shadow-[0_8px_30px_rgba(16,185,129,0.25)]';
      case 'meal':
        return 'border-amber-500/40 shadow-[0_8px_30px_rgba(245,158,11,0.25)]';
      case 'streak':
        return 'border-[#ff5708]/50 shadow-[0_8px_30px_rgba(255,87,8,0.3)]';
      default:
        return 'border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.5)]';
    }
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
      <div className={`bg-[#131620]/95 backdrop-blur-xl border ${getBorderColor()} rounded-2xl p-4 text-white flex items-start gap-3.5`}>
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-white tracking-tight truncate">
              {notification.title}
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">Just now</span>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed line-clamp-2">
            {notification.message}
          </p>
          {notification.actionTab && (
            <div className="mt-2.5 flex items-center gap-2">
              <button
                onClick={() => {
                  if (onAction && notification.actionTab) {
                    onAction(notification.actionTab);
                  }
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ff5708] hover:bg-[#ff7028] text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-md"
              >
                <span>{notification.actionLabel || 'View Now'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0 cursor-pointer"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
