import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export interface NotificationSettings {
  dailyReminderEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  dailyReminderEnabled: false,
  reminderHour: 9,
  reminderMinute: 0,
};

const DAILY_REMINDER_ID = 'daily-habit-reminder';

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    console.log('[notifications] Web platform — skipping permissions');
    return false;
  }

  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync();
    console.log('[notifications] Permission result:', status);
    return status === 'granted';
  } catch (e) {
    console.log('[notifications] Permission error:', e);
    return false;
  }
}

export async function getNotificationPermissionStatus(): Promise<string> {
  if (Platform.OS === 'web') return 'unsupported';
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  } catch {
    return 'unknown';
  }
}

export async function scheduleDailyReminder(hour: number, minute: number): Promise<boolean> {
  if (Platform.OS === 'web') {
    console.log('[notifications] Web platform — skipping schedule');
    return false;
  }

  try {
    await cancelDailyReminder();

    await Notifications.scheduleNotificationAsync({
      identifier: DAILY_REMINDER_ID,
      content: {
        title: 'Tiny win check-in ✨',
        body: 'Pick one small action for your dreams today.',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    console.log('[notifications] Scheduled daily reminder at', hour, ':', minute);
    return true;
  } catch (e) {
    console.log('[notifications] Schedule error:', e);
    return false;
  }
}

export async function cancelDailyReminder(): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID);
    console.log('[notifications] Cancelled daily reminder');
  } catch (e) {
    console.log('[notifications] Cancel error (may not exist):', e);
  }
}

export async function cancelAllNotifications(): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('[notifications] Cancelled all notifications');
  } catch (e) {
    console.log('[notifications] Cancel all error:', e);
  }
}

export function configureNotificationHandler(): void {
  if (Platform.OS === 'web') return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  console.log('[notifications] Handler configured');
}
