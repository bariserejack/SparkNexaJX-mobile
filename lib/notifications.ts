import Constants from 'expo-constants';
import { Platform } from 'react-native';

type NotificationsModule = typeof import('expo-notifications');

let cached: NotificationsModule | null = null;

export function notificationsSupportedInRuntime() {
  // Expo Go on Android (SDK 53+) does not support the push registration
  // path used by expo-notifications and can throw at import time.
  const isExpoGo = Constants.executionEnvironment === 'storeClient';
  return !(Platform.OS === 'android' && isExpoGo);
}

export async function getNotifications(): Promise<NotificationsModule | null> {
  if (!notificationsSupportedInRuntime()) {
    return null;
  }
  if (cached) return cached;
  // dynamic import to avoid running module-top code in Expo Go
  // that requires a development build for push notifications
  // (avoids errors when running in Expo Go).
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  cached = (await import('expo-notifications')) as NotificationsModule;
  return cached;
}

export function clearNotificationsCache() {
  cached = null;
}
