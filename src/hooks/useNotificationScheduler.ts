import { useEffect, useRef } from 'react';
import { 
  NotificationSettings, 
  AppNotification, 
  WaterLog, 
  FoodLogEntry, 
  UserProfile, 
  StreakState 
} from '../types';
import { 
  dispatchNotification, 
  getLastAlertTimes, 
  setLastAlertTime 
} from '../utils/notifications';

interface UseNotificationSchedulerProps {
  settings: NotificationSettings;
  waterLog: WaterLog;
  foodLogs: FoodLogEntry[];
  profile: UserProfile;
  streaks: StreakState;
  onNotificationReceived: (notification: AppNotification) => void;
}

export function useNotificationScheduler({
  settings,
  waterLog,
  foodLogs,
  profile,
  streaks,
  onNotificationReceived,
}: UseNotificationSchedulerProps) {
  const settingsRef = useRef(settings);
  const waterLogRef = useRef(waterLog);
  const foodLogsRef = useRef(foodLogs);
  const profileRef = useRef(profile);
  const streaksRef = useRef(streaks);

  useEffect(() => {
    settingsRef.current = settings;
    waterLogRef.current = waterLog;
    foodLogsRef.current = foodLogs;
    profileRef.current = profile;
    streaksRef.current = streaks;
  }, [settings, waterLog, foodLogs, profile, streaks]);

  useEffect(() => {
    const checkSchedule = async () => {
      const currentSettings = settingsRef.current;
      if (!currentSettings.enabled) return;

      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const lastAlerts = getLastAlertTimes();

      // Helper to check if alert was triggered today in this slot
      const hasAlertedToday = (key: string) => {
        const lastTime = lastAlerts[`${key}_${todayStr}`];
        return Boolean(lastTime);
      };

      const markAlertedToday = (key: string) => {
        setLastAlertTime(`${key}_${todayStr}`, Date.now());
      };

      // 1. Breakfast Alert
      if (
        currentSettings.breakfastReminder &&
        currentTimeStr === currentSettings.breakfastTime &&
        !hasAlertedToday('breakfast')
      ) {
        markAlertedToday('breakfast');
        const notif = await dispatchNotification({
          title: '🍳 Breakfast Time - Fuel Up!',
          message: 'Start your metabolism with high-protein fuel. Log your breakfast in NutriPulse.',
          category: 'meal',
          actionTab: 'dashboard',
          actionLabel: 'Log Food',
          settings: currentSettings,
        });
        onNotificationReceived(notif);
      }

      // 2. Lunch Alert
      if (
        currentSettings.lunchReminder &&
        currentTimeStr === currentSettings.lunchTime &&
        !hasAlertedToday('lunch')
      ) {
        markAlertedToday('lunch');
        const notif = await dispatchNotification({
          title: '🥗 Midday Fuel Checkpoint',
          message: 'Time for lunch! Keep your macros balanced with lean protein and clean carbs.',
          category: 'meal',
          actionTab: 'scanner',
          actionLabel: 'Scan Lunch',
          settings: currentSettings,
        });
        onNotificationReceived(notif);
      }

      // 3. Dinner Alert
      if (
        currentSettings.dinnerReminder &&
        currentTimeStr === currentSettings.dinnerTime &&
        !hasAlertedToday('dinner')
      ) {
        markAlertedToday('dinner');
        const notif = await dispatchNotification({
          title: '🍽️ Dinner & Macro Balance',
          message: 'Finish the day strong. Check your remaining calories and log dinner.',
          category: 'meal',
          actionTab: 'scanner',
          actionLabel: 'Log Dinner',
          settings: currentSettings,
        });
        onNotificationReceived(notif);
      }

      // 4. Workout Prompt
      if (
        currentSettings.workoutReminder &&
        currentTimeStr === currentSettings.workoutTime &&
        !hasAlertedToday('workout')
      ) {
        markAlertedToday('workout');
        const notif = await dispatchNotification({
          title: '🏋️ Workout Time - Crush It!',
          message: 'Your training session is scheduled. Hydrate and get ready to push hard.',
          category: 'workout',
          actionTab: 'workout',
          actionLabel: 'Start Workout',
          settings: currentSettings,
        });
        onNotificationReceived(notif);
      }

      // 5. Streak Guardian Alert (at 20:00 / 8:00 PM)
      if (
        currentSettings.streakAlerts &&
        currentTimeStr === '20:00' &&
        !hasAlertedToday('streak_guardian')
      ) {
        const foodCount = foodLogsRef.current.length;
        const currentWater = waterLogRef.current.intakeMl;
        const targetWater = profileRef.current.waterTargetMl || 2500;

        if (foodCount === 0 || currentWater < targetWater * 0.75) {
          markAlertedToday('streak_guardian');
          const notif = await dispatchNotification({
            title: `🔥 Protect Your ${streaksRef.current.foodStreak}-Day Streak!`,
            message: "Don't let your streak break! Complete your daily water and meal logs before midnight.",
            category: 'streak',
            actionTab: 'streaks',
            actionLabel: 'Check Streak',
            settings: currentSettings,
          });
          onNotificationReceived(notif);
        }
      }

      // 6. Hydration Interval Reminder
      if (currentSettings.hydrationReminders) {
        const intervalMs = currentSettings.hydrationIntervalMinutes * 60 * 1000;
        const lastWaterAlert = lastAlerts['hydration_interval'] || 0;
        const hour = now.getHours();

        // Only alert between 8 AM and 10 PM
        if (hour >= 8 && hour < 22 && Date.now() - lastWaterAlert >= intervalMs) {
          const currentWater = waterLogRef.current.intakeMl;
          const targetWater = profileRef.current.waterTargetMl || 2500;

          if (currentWater < targetWater) {
            setLastAlertTime('hydration_interval', Date.now());
            const notif = await dispatchNotification({
              title: '💧 Time for Water!',
              message: `You've logged ${currentWater}ml so far today. Drink 250ml to stay on pace for ${(targetWater / 1000).toFixed(1)}L.`,
              category: 'hydration',
              actionTab: 'water',
              actionLabel: 'Log Water',
              settings: currentSettings,
            });
            onNotificationReceived(notif);
          }
        }
      }
    };

    // Run check once on start, then every 30 seconds
    const interval = setInterval(checkSchedule, 30000);
    return () => clearInterval(interval);
  }, [onNotificationReceived]);
}
