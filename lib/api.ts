import { Platform } from 'react-native';
import Constants from 'expo-constants';

function trimSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function resolveFromExpoHostUri(): string | null {
  const hostUri = (Constants.expoConfig as any)?.hostUri as string | undefined;
  if (!hostUri) {
    return null;
  }

  const host = hostUri.split(':')[0];
  if (!host) {
    return null;
  }

  return `http://${host}:4000`;
}

function resolveApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) {
    return trimSlash(fromEnv);
  }

  const fromExpoHost = resolveFromExpoHostUri();
  if (fromExpoHost) {
    return trimSlash(fromExpoHost);
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4000';
  }

  return 'http://localhost:4000';
}

export const API_BASE_URL = resolveApiBaseUrl();

export function apiUrl(path: string) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}
