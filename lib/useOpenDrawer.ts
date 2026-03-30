import { useCallback } from 'react';
import { useNavigation } from 'expo-router';

export function useOpenDrawer() {
  const navigation = useNavigation();

  return useCallback(() => {
    const parent = (navigation as any).getParent?.();
    if (parent?.openDrawer) {
      parent.openDrawer();
      return;
    }
    if ((navigation as any).openDrawer) {
      (navigation as any).openDrawer();
    }
  }, [navigation]);
}
