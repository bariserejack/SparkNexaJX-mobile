import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Theme } from '../../constants/Theme';
import { useAppTheme } from '../../lib/theme';
import { AppLogo } from '../../components/AppLogo';

export default function CustomDrawerContent(props: any) {
  const router = useRouter();
  const { activeTheme } = useAppTheme();

  const quickAccessLinks: Array<{ label: string; icon: keyof typeof Ionicons.glyphMap; path: string }> = [
    { label: 'Projects', icon: 'layers-outline', path: '/projects' },
    { label: 'Bolts', icon: 'flash-outline', path: '/(tabs)/explore' },
    { label: 'Daily Reminders', icon: 'alarm-outline', path: '/reminders' },
    { label: 'Neural Pulse', icon: 'pulse-outline', path: '/pulse' },
    { label: 'Secure Vault', icon: 'shield-checkmark-outline', path: '/vault' },
    { label: 'Analytics', icon: 'bar-chart-outline', path: '/analytics' },
    { label: 'Notifications', icon: 'notifications-outline', path: '/notifications' },
    { label: 'Settings', icon: 'settings-outline', path: '/settings' },
  ];

  const goTo = (path: string) => {
    props.navigation?.closeDrawer?.();
    router.replace(path as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.tabBar }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { borderBottomColor: activeTheme.border }]}>
          <AppLogo size={54} />
          <View>
            <Text style={[styles.title, { color: activeTheme.text }]}>SparkNexaJX</Text>
            <Text style={[styles.subtitle, { color: activeTheme.textMuted }]}>Workspace</Text>
          </View>
        </View>

        <View style={styles.menuWrap}>
          <Text style={[styles.quickAccessLabel, { color: activeTheme.textMuted }]}>QUICK ACCESS</Text>
          {quickAccessLinks.map((item) => (
            <TouchableOpacity
              key={item.path}
              style={[styles.menuItem, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}
              onPress={() => goTo(item.path)}
            >
              <Ionicons name={item.icon} size={16} color={activeTheme.textMuted} />
              <Text style={[styles.menuLabel, { color: activeTheme.text }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.logoutBtn,
          {
            borderTopColor: activeTheme.border,
            backgroundColor: activeTheme.card,
          },
        ]}
        onPress={() => goTo('/auth/logout')}
      >
        <Ionicons name="log-out-outline" size={16} color={Theme.brand.primary} />
        <Text style={[styles.logoutText, { color: Theme.brand.primary }]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: 16,
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 56,
    paddingBottom: 18,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
  },
  menuWrap: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingTop: 12,
    gap: 8,
  },
  menuItem: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickAccessLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginLeft: 8,
    marginBottom: 12,
  },
  logoutBtn: {
    height: 58,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 14,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
