import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { Theme } from '../constants/Theme';
import { useAppTheme } from '../lib/theme';

export default function StorageDataScreen() {
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
  const [useLessDataForCalls, setUseLessDataForCalls] = useState(true);

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: activeTheme.border }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={16} color={activeTheme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: activeTheme.text }]}>Storage and data</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={[styles.card, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
            <SettingRow
              icon="folder-open-outline"
              label="Manage storage"
              theme={activeTheme}
            />
            <Divider theme={activeTheme} />
            <SettingRow
              icon="analytics-outline"
              label="Network usage"
              theme={activeTheme}
            />
            <Divider theme={activeTheme} />
            <SettingToggleRow
              label="Use less data for calls"
              value={useLessDataForCalls}
              onChange={setUseLessDataForCalls}
              theme={activeTheme}
            />
            <Divider theme={activeTheme} />
            <SettingRow label="Proxy" theme={activeTheme} />
          </View>

          <View style={[styles.card, { borderColor: activeTheme.border, backgroundColor: activeTheme.card, marginTop: 16 }]}>
            <SettingRow icon="images-outline" label="Media upload quality" theme={activeTheme} />
            <Divider theme={activeTheme} />
            <SettingRow label="Auto-download quality" theme={activeTheme} />
          </View>

          <Text style={[styles.sectionLabel, { color: activeTheme.textMuted }]}>Media auto-download</Text>

          <View style={[styles.card, { borderColor: activeTheme.border, backgroundColor: activeTheme.card, marginTop: 10 }]}>
            <SettingRow label="When using mobile data" theme={activeTheme} />
            <Divider theme={activeTheme} />
            <SettingRow label="When connected on Wi-Fi" theme={activeTheme} />
            <Divider theme={activeTheme} />
            <SettingRow label="When roaming" theme={activeTheme} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  theme,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  theme: any;
}) {
  return (
    <TouchableOpacity style={styles.row}>
      {icon ? (
        <View style={[styles.iconFrame, { borderColor: theme.border, backgroundColor: theme.background }]}>
          <Ionicons name={icon} size={16} color={theme.text} />
          <View style={styles.iconAccent} />
        </View>
      ) : null}
      <View style={styles.rowTextWrap}>
        <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

function SettingToggleRow({
  label,
  value,
  onChange,
  theme,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  theme: any;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowTextWrap}>
        <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: theme.border, true: Theme.brand.primary }}
        thumbColor="#FFFFFF"
      />
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
  headerTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -0.2 },
  headerSpacer: { width: 34 },
  scrollContent: { paddingHorizontal: 16, paddingVertical: 14, paddingBottom: 28 },
  card: { borderWidth: 1, borderRadius: 18, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 13 },
  iconFrame: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  rowTextWrap: { flex: 1 },
  rowLabel: { fontSize: 16, fontWeight: '700', letterSpacing: -0.1 },
  divider: { height: 1, marginLeft: 52 },
  sectionLabel: { marginTop: 16, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },
});
