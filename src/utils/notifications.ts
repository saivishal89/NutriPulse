import { AppNotification, NotificationSettings, NotificationCategory } from '../types';
import { sounds } from './sound';

const SETTINGS_KEY = 'nutripulse_notification_settings';
const HISTORY_KEY = 'nutripulse_notification_history';
const LAST_ALERT_KEY = 'nutripulse_last_alerts';

export const defaultNotificationSettings: NotificationSettings = {
  enabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  hydrationReminders: true,
  hydrationIntervalMinutes: 60,
  breakfastReminder: true,
  breakfastTime: '08:30',
  lunchReminder: true,
  lunchTime: '13:00',
  dinnerReminder: true,
  dinnerTime: '19:30',
  workoutReminder: true,
  workoutTime: '17:30',
  streakAlerts: true,
};

export const initialNotificationHistory: AppNotification[] = [
  {
    id: 'notif-welcome',
    title: '🎉 Welcome to NutriPulse Pro',
    message: 'Notifications are initialized! We will help you stay hydrated, hit macros, and maintain your workout streak.',
    category: 'system',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    read: true,
    actionTab: 'dashboard',
    actionLabel: 'View Dashboard',
  },
  {
    id: 'notif-hydration-demo',
    title: '💧 Hydration Checkpoint',
    message: 'Drink 250ml of fresh water now to accelerate protein synthesis and fat loss.',
    category: 'hydration',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    actionTab: 'water',
    actionLabel: 'Log Water',
  },
  {
    id: 'notif-streak-demo',
    title: '🔥 4-Day Active Streak',
    message: 'You are on fire! Log your meals and finish daily hydration to lock in Day 5.',
    category: 'streak',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    read: false,
    actionTab: 'streaks',
    actionLabel: 'View Badges',
  },
];

export function getStoredNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...defaultNotificationSettings, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load notification settings:', e);
  }
  return defaultNotificationSettings;
}

export function saveStoredNotificationSettings(settings: NotificationSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save notification settings:', e);
  }
}

export function getStoredNotificationHistory(): AppNotification[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load notification history:', e);
  }
  return initialNotificationHistory;
}

export function saveStoredNotificationHistory(history: AppNotification[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50))); // Keep last 50
  } catch (e) {
    console.error('Failed to save notification history:', e);
  }
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    console.error('Error requesting notification permission:', e);
    return 'denied';
  }
}

interface SendNotificationOptions {
  title: string;
  message: string;
  category: NotificationCategory;
  actionTab?: string;
  actionLabel?: string;
  settings?: NotificationSettings;
}

export async function dispatchNotification({
  title,
  message,
  category,
  actionTab,
  actionLabel,
  settings,
}: SendNotificationOptions): Promise<AppNotification> {
  const currentSettings = settings || getStoredNotificationSettings();

  // Create record
  const notificationRecord: AppNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    title,
    message,
    category,
    timestamp: new Date().toISOString(),
    read: false,
    actionTab,
    actionLabel,
  };

  // 1. Play sound if enabled
  if (currentSettings.soundEnabled) {
    sounds.playNotificationChime();
  }

  // 2. Trigger vibration if enabled and available
  if (currentSettings.vibrationEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([150, 75, 150]);
    } catch (e) {}
  }

  // 3. System / PWA Native notification if permission granted
  if (isNotificationSupported() && Notification.permission === 'granted') {
    try {
      // If service worker is registered, show via registration (works best on Android PWA)
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && registration.showNotification) {
          await registration.showNotification(title, {
            body: message,
            icon: '/pwa-192x192.png',
            badge: '/favicon.png',
            tag: `nutripulse-${category}`,
            data: { actionTab, timestamp: Date.now() },
          });
          return notificationRecord;
        }
      }

      // Fallback to standard window Notification
      new Notification(title, {
        body: message,
        icon: '/pwa-192x192.png',
        tag: `nutripulse-${category}`,
      });
    } catch (err) {
      console.warn('System notification display error:', err);
    }
  }

  return notificationRecord;
}

// Get map of last alerted timestamps to throttle repetitive alerts
export function getLastAlertTimes(): Record<string, number> {
  try {
    const raw = localStorage.getItem(LAST_ALERT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function setLastAlertTime(key: string, timestamp: number): void {
  try {
    const prev = getLastAlertTimes();
    prev[key] = timestamp;
    localStorage.setItem(LAST_ALERT_KEY, JSON.stringify(prev));
  } catch (e) {}
}
