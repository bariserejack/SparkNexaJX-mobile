import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { useAppTheme } from '../lib/theme';

const APP_VERSION = '2.6.0';

export default function AboutScreen() {
  const { activeTheme } = useAppTheme();
  const { from } = useLocalSearchParams<{ from?: string }>();

  const handleBack = () => {
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
          <Text style={[styles.headerTitle, { color: activeTheme.text }]}>About SparkNexaJX</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.sectionLabel, { color: activeTheme.textMuted }]}>App details</Text>
          <View style={[styles.card, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
            <AboutRow label="App version" rightText={`v${APP_VERSION}`} theme={activeTheme} />
            <Divider theme={activeTheme} />
            <AboutRow
              label="Contact support"
              onPress={() =>
                router.push({
                  pathname: '/help',
                  params: { from: 'about', returnTo: from || 'settings' },
                })
              }
              theme={activeTheme}
            />
            <Divider theme={activeTheme} />
            <AboutRow label="Rate SparkNexaJX" theme={activeTheme} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function AboutRow({
  label,
  rightText,
  onPress,
  theme,
}: {
  label: string;
  rightText?: string;
  onPress?: () => void;
  theme: any;
}) {
  const RowWrapper = onPress ? TouchableOpacity : View;
  return (
    <RowWrapper onPress={onPress} style={styles.row}>
      <View style={styles.rowTextWrap}>
        <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
      </View>
      {rightText ? (
        <Text style={[styles.rowRight, { color: theme.textMuted }]}>{rightText}</Text>
      ) : onPress ? (
        <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
      ) : null}
    </RowWrapper>
  );
}

function Divider({ theme }: { theme: any }) {
  return <View style={[styles.divider, { backgroundColor: theme.border }]} />;
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
  headerTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -0.3 },
  headerSpacer: { width: 34 },
  scrollContent: { paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 28 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  card: { borderWidth: 1, borderRadius: 18, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  rowTextWrap: { flex: 1 },
  rowLabel: { fontSize: 16, fontWeight: '700', letterSpacing: -0.1 },
  rowRight: { fontSize: 13, fontWeight: '700' },
  divider: { height: 1, marginLeft: 16 },
});
