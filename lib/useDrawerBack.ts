import { useCallback } from 'react';
import { router } from 'expo-router';

export function useDrawerBack() {
  return useCallback(() => {
    router.back();
  }, []);
}
