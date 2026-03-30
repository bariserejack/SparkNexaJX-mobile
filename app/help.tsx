import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { Theme } from '../constants/Theme';
import { useAppTheme } from '../lib/theme';

type HelpItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

const HELP_ITEMS: HelpItem[] = [
  { icon: 'help-circle-outline', label: 'Help center' },
  { icon: 'bug-outline', label: 'Send feedback' },
  { icon: 'document-text-outline', label: 'Terms' },
  { icon: 'alert-circle-outline', label: 'Channel reports' },
  { icon: 'information-circle-outline', label: 'App info' },
];

export default function HelpScreen() {
  const { activeTheme } = useAppTheme();
  const { from, returnTo } = useLocalSearchParams<{ from?: string; returnTo?: string }>();

  const handleBack = () => {
    if (from === 'about') {
      router.replace({ pathname: '/about', params: { from: returnTo || 'settings' } });
      return;
    }
    if (from === 'settings') {
      router.replace('/settings');
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/settings');
  };

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: activeTheme.border }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={16} color={activeTheme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: activeTheme.text }]}>Help</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={[styles.card, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
            {HELP_ITEMS.map((item, index) => (
              <View key={item.label}>
                <TouchableOpacity style={styles.itemRow}>
                  <View style={[styles.itemIcon, { backgroundColor: activeTheme.background, borderColor: activeTheme.border }]}>
                    <Ionicons name={item.icon} size={16} color={activeTheme.text} />
                    <View style={styles.itemAccent} />
                  </View>
                  <View style={styles.itemTextWrap}>
                    <Text style={[styles.itemLabel, { color: activeTheme.text }]}>{item.label}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={activeTheme.textMuted} />
                </TouchableOpacity>
                {index !== HELP_ITEMS.length - 1 ? <View style={[styles.divider, { backgroundColor: activeTheme.border }]} /> : null}
              </View>
            ))}
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
  headerTitle: { fontSize: 26, fontWeight: '900', letterSpacing: -0.4 },
  headerSpacer: { width: 34 },
  scrollContent: { paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 30 },
  card: { borderWidth: 1, borderRadius: 18, overflow: 'hidden' },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13 },
  itemIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  itemAccent: {
    position: 'absolute',
    right: 2,
    top: 2,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Theme.brand.primary,
  },
  itemTextWrap: { flex: 1 },
  itemLabel: { fontSize: 16, fontWeight: '700', letterSpacing: -0.1 },
  divider: { height: 1, marginLeft: 54 },
});
