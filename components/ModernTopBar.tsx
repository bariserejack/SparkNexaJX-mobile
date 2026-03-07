import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Theme } from '../constants/Theme';
import { useAppTheme } from '../lib/theme';

type TabRouteName = 'index' | 'learn' | 'explore' | 'profile';

const TITLES: Record<TabRouteName, string> = {
  index: 'Home',
  learn: 'Learn',
  explore: 'Explore',
  profile: 'Profile',
};

const TAB_ROUTES: Array<{ key: TabRouteName; icon: keyof typeof Ionicons.glyphMap; path: string }> = [
  { key: 'index', icon: 'home-outline', path: '/(tabs)' },
  { key: 'learn', icon: 'book-outline', path: '/(tabs)/learn' },
  { key: 'explore', icon: 'flash-outline', path: '/(tabs)/explore' },
  { key: 'profile', icon: 'person-outline', path: '/(tabs)/profile' },
];

export function ModernTopBar({ currentRoute }: { currentRoute: string }) {
  const { activeTheme, isDark } = useAppTheme();
  const route = (currentRoute in TITLES ? currentRoute : 'index') as TabRouteName;

  return (
    <BlurView
      intensity={isDark ? 35 : 70}
      tint={isDark ? 'dark' : 'light'}
      style={[
        styles.wrapper,
        {
          backgroundColor: activeTheme.glass,
          borderBottomColor: activeTheme.border,
        },
      ]}
    >
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: activeTheme.text }]}>{TITLES[route]}</Text>
        <TouchableOpacity
          onPress={() => router.push('/notifications')}
          style={[styles.actionButton, { borderColor: activeTheme.border, backgroundColor: activeTheme.cardElevated }]}
        >
          <Ionicons name="notifications-outline" size={16} color={activeTheme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabShortcutRow}>
        {TAB_ROUTES.map((item) => {
          const active = item.key === route;
          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => router.replace(item.path)}
              style={[
                styles.shortcutButton,
                {
                  backgroundColor: active ? Theme.brand.primary : activeTheme.card,
                  borderColor: active ? Theme.brand.primary : activeTheme.border,
                },
              ]}
            >
              <Ionicons
                name={active ? (item.icon.replace('-outline', '') as keyof typeof Ionicons.glyphMap) : item.icon}
                size={16}
                color={active ? '#FFFFFF' : activeTheme.textMuted}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  tabShortcutRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  shortcutButton: {
    height: 34,
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
