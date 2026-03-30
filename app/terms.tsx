import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { useAppTheme } from '../lib/theme';

export default function TermsScreen() {
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
          <Text style={[styles.headerTitle, { color: activeTheme.text }]}>Terms of Service</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.sectionLabel, { color: activeTheme.textMuted }]}>Overview</Text>
          <View style={[styles.card, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
            <Text style={[styles.bodyText, { color: activeTheme.textMuted }]}>
              By using SparkNexaJX you agree to follow these terms. This is a concise summary for the app UI.
            </Text>
          </View>

          <Text style={[styles.sectionLabel, { color: activeTheme.textMuted }]}>Key points</Text>
          <View style={[styles.card, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
            <Bullet text="Use the app responsibly and respect other learners." theme={activeTheme} />
            <Divider theme={activeTheme} />
            <Bullet text="Do not post harmful, illegal, or infringing content." theme={activeTheme} />
            <Divider theme={activeTheme} />
            <Bullet text="You are responsible for your account activity." theme={activeTheme} />
            <Divider theme={activeTheme} />
            <Bullet text="We may suspend accounts that violate standards." theme={activeTheme} />
            <Divider theme={activeTheme} />
            <Bullet text="Contact support for questions about these terms." theme={activeTheme} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Bullet({ text, theme }: { text: string; theme: any }) {
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: theme.textMuted }]} />
      <Text style={[styles.rowText, { color: theme.text }]}>{text}</Text>
    </View>
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
  card: { borderWidth: 1, borderRadius: 18, overflow: 'hidden', padding: 14, gap: 10 },
  bodyText: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  rowText: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  divider: { height: 1, opacity: 0.5 },
});
