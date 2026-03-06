import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Theme } from '../constants/Theme';
import { useAppTheme } from '../lib/theme';

type AccountOption = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  destructive?: boolean;
};

const ACCOUNT_OPTIONS: AccountOption[] = [
  { icon: 'shield-checkmark-outline', label: 'Security notifications' },
  { icon: 'key-outline', label: 'Passkeys' },
  { icon: 'mail-outline', label: 'Email address' },
  { icon: 'lock-closed-outline', label: 'Two-step verification' },
  { icon: 'swap-horizontal-outline', label: 'Change phone number' },
  { icon: 'document-text-outline', label: 'Request account info' },
  { icon: 'trash-outline', label: 'Delete account', destructive: true },
];

export default function AccountScreen() {
  const { activeTheme } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: activeTheme.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={26} color={activeTheme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: activeTheme.text }]}>Account</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={[styles.card, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
            {ACCOUNT_OPTIONS.map((item, index) => (
              <View key={item.label}>
                <TouchableOpacity style={styles.optionRow}>
                  <View style={[styles.iconWrap, { backgroundColor: activeTheme.background, borderColor: activeTheme.border }]}>
                    <Ionicons
                      name={item.icon}
                      size={16}
                      color={item.destructive ? '#FF3B30' : activeTheme.text}
                    />
                    <View style={[styles.iconAccent, item.destructive ? { backgroundColor: '#FF3B30' } : null]} />
                  </View>
                  <Text style={[styles.optionLabel, { color: item.destructive ? '#FF3B30' : activeTheme.text }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
                {index !== ACCOUNT_OPTIONS.length - 1 ? (
                  <View style={[styles.divider, { backgroundColor: activeTheme.border }]} />
                ) : null}
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
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  iconAccent: {
    position: 'absolute',
    right: 2,
    top: 2,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Theme.brand.primary,
  },
  optionLabel: { fontSize: 16, fontWeight: '700', letterSpacing: -0.1, flex: 1 },
  divider: { height: 1, marginLeft: 54 },
});
