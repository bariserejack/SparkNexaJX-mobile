import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

import { Theme } from '../constants/Theme';
import { useAppTheme } from '../lib/theme';

type AutoLockOption = 'immediately' | '1_minute' | '30_minutes';

type AppLockSettings = {
  biometricEnabled: boolean;
  autoLock: AutoLockOption;
  showNotificationContent: boolean;
};

const STORAGE_KEY = '@sparknexa/app-lock-settings';

const DEFAULT_SETTINGS: AppLockSettings = {
  biometricEnabled: true,
  autoLock: 'immediately',
  showNotificationContent: true,
};

const AUTO_LOCK_OPTIONS: Array<{ key: AutoLockOption; label: string }> = [
  { key: 'immediately', label: 'Immediately' },
  { key: '1_minute', label: 'After 1 minute' },
  { key: '30_minutes', label: 'After 30 minutes' },
];

export default function AppLockScreen() {
  const { activeTheme } = useAppTheme();
  const [settings, setSettings] = useState<AppLockSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as Partial<AppLockSettings>;
        setSettings({
          biometricEnabled: parsed.biometricEnabled ?? DEFAULT_SETTINGS.biometricEnabled,
          autoLock: parsed.autoLock ?? DEFAULT_SETTINGS.autoLock,
          showNotificationContent: parsed.showNotificationContent ?? DEFAULT_SETTINGS.showNotificationContent,
        });
      } catch (error) {
        console.warn('Failed to load app lock settings', error);
      }
    };

    loadSettings();
  }, []);

  const updateSettings = (patch: Partial<AppLockSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch((error) => {
        console.warn('Failed to save app lock settings', error);
      });
      return next;
    });
    Haptics.selectionAsync();
  };

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: activeTheme.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={16} color={activeTheme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: activeTheme.text }]}>App lock</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={[styles.card, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
            <View style={styles.row}>
              <View style={styles.rowTextWrap}>
                <Text style={[styles.rowLabel, { color: activeTheme.text }]}>Unlock with biometric</Text>
                <Text style={[styles.rowSub, { color: activeTheme.textMuted }]}>
                  Use fingerprint, face, or other unique identifiers to open SparkNexa.
                </Text>
              </View>
              <Switch
                value={settings.biometricEnabled}
                onValueChange={(value) => updateSettings({ biometricEnabled: value })}
                trackColor={{ false: activeTheme.border, true: Theme.brand.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={[styles.divider, { backgroundColor: activeTheme.border }]} />

            <View style={styles.autoLockBlock}>
              <Text style={[styles.rowLabel, { color: activeTheme.text }]}>Automatically lock</Text>
              {AUTO_LOCK_OPTIONS.map((option) => {
                const selected = settings.autoLock === option.key;
                return (
                  <TouchableOpacity
                    key={option.key}
                    style={styles.radioRow}
                    onPress={() => updateSettings({ autoLock: option.key })}
                  >
                    <Ionicons
                      name={selected ? 'radio-button-on' : 'radio-button-off'}
                      size={16}
                      color={selected ? Theme.brand.primary : activeTheme.textMuted}
                    />
                    <Text style={[styles.radioLabel, { color: activeTheme.text }]}>{option.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={[styles.divider, { backgroundColor: activeTheme.border }]} />

            <View style={styles.row}>
              <View style={styles.rowTextWrap}>
                <Text style={[styles.rowLabel, { color: activeTheme.text }]}>Show content in notifications</Text>
                <Text style={[styles.rowSub, { color: activeTheme.textMuted }]}>
                  Preview sender and message text inside new notifications.
                </Text>
              </View>
              <Switch
                value={settings.showNotificationContent}
                onValueChange={(value) => updateSettings({ showNotificationContent: value })}
                trackColor={{ false: activeTheme.border, true: Theme.brand.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { width: 34, alignItems: 'flex-start' },
  headerTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -0.4 },
  headerSpacer: { width: 34 },
  scrollContent: { paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 26 },
  card: { borderWidth: 1, borderRadius: 18, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowTextWrap: { flex: 1 },
  rowLabel: { fontSize: 16, fontWeight: '700', letterSpacing: -0.1 },
  rowSub: { fontSize: 13, fontWeight: '500', marginTop: 4, lineHeight: 19 },
  autoLockBlock: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  radioLabel: { fontSize: 18, fontWeight: '500' },
  divider: { height: 1, marginLeft: 16 },
});
