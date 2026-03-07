import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Theme } from '../constants/Theme';
import { useAppTheme } from '../lib/theme';

export default function PrivacyScreen() {
  const { activeTheme } = useAppTheme();
  const [readReceipts, setReadReceipts] = useState(false);
  const [allowCameraEffects, setAllowCameraEffects] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: activeTheme.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={16} color={activeTheme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: activeTheme.text }]}>Privacy</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.sectionLabel, { color: activeTheme.textMuted }]}>Who can see my personal info</Text>
          <View style={[styles.card, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
            <PrivacyRow label="Who can see your post?" sub="Default audience settings" onPress={() => router.push('/post-audience')} theme={activeTheme} />
            <Divider theme={activeTheme} />
            <PrivacyRow label="Last seen and online" sub="Nobody" theme={activeTheme} />
            <Divider theme={activeTheme} />
            <PrivacyRow label="Profile picture" sub="Everyone" theme={activeTheme} />
            <Divider theme={activeTheme} />
            <PrivacyRow label="About" sub="Nobody" theme={activeTheme} />
            <Divider theme={activeTheme} />
            <PrivacyRow label="Status" sub="My contacts" theme={activeTheme} />
            <Divider theme={activeTheme} />
            <PrivacyToggleRow
              label="Read receipts"
              sub="If turned off, you won't send or receive Read receipts. Read receipts are always sent for group chats."
              value={readReceipts}
              onValueChange={setReadReceipts}
              theme={activeTheme}
            />
          </View>

          <Text style={[styles.sectionLabel, { color: activeTheme.textMuted }]}>Disappearing messages</Text>
          <View style={[styles.card, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
            <PrivacyRow
              label="Default message timer"
              sub="Start new chats with disappearing messages set to your timer"
              rightText="24 hours"
              theme={activeTheme}
            />
          </View>

          <View style={[styles.card, { backgroundColor: activeTheme.card, borderColor: activeTheme.border, marginTop: 18 }]}>
            <PrivacyRow label="Groups" sub="1 contact excluded" theme={activeTheme} />
            <Divider theme={activeTheme} />
            <PrivacyRow label="Avatar stickers" sub="My contacts" theme={activeTheme} />
            <Divider theme={activeTheme} />
            <PrivacyRow label="Live location" theme={activeTheme} />
            <Divider theme={activeTheme} />
            <PrivacyRow label="Calls" sub="Silence unknown callers" theme={activeTheme} />
            <Divider theme={activeTheme} />
            <PrivacyRow label="Contacts" sub="Block contacts, SparkNexa contacts" theme={activeTheme} />
            <Divider theme={activeTheme} />
            <PrivacyRow label="App lock" sub="Enabled immediately" onPress={() => router.push('/app-lock')} theme={activeTheme} />
            <Divider theme={activeTheme} />
            <PrivacyRow label="Chat lock" theme={activeTheme} />
            <Divider theme={activeTheme} />
            <PrivacyToggleRow
              label="Allow camera effects"
              sub="Use effects in the camera and video calls. Learn more"
              value={allowCameraEffects}
              onValueChange={setAllowCameraEffects}
              theme={activeTheme}
            />
            <Divider theme={activeTheme} />
            <PrivacyRow label="Advanced" sub="Protect IP address in calls, Disable link previews" theme={activeTheme} />
          </View>

          <View style={[styles.card, { backgroundColor: activeTheme.card, borderColor: activeTheme.border, marginTop: 18 }]}>
            <PrivacyRow
              label="Privacy checkup"
              sub="Control your privacy and choose the right settings for you."
              onPress={() => router.push('/privacy-checkup')}
              theme={activeTheme}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function PrivacyRow({
  label,
  sub,
  rightText,
  onPress,
  theme,
}: {
  label: string;
  sub?: string;
  rightText?: string;
  onPress?: () => void;
  theme: any;
}) {
  return (
    <TouchableOpacity disabled={!onPress} onPress={onPress} style={styles.row}>
      <View style={styles.rowTextWrap}>
        <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
        {sub ? <Text style={[styles.rowSub, { color: theme.textMuted }]}>{sub}</Text> : null}
      </View>
      {rightText ? <Text style={[styles.rowRight, { color: theme.textMuted }]}>{rightText}</Text> : null}
    </TouchableOpacity>
  );
}

function PrivacyToggleRow({
  label,
  sub,
  value,
  onValueChange,
  theme,
}: {
  label: string;
  sub: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  theme: any;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowTextWrap}>
        <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
        <Text style={[styles.rowSub, { color: theme.textMuted }]}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
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
  headerTitle: { fontSize: 26, fontWeight: '900', letterSpacing: -0.4 },
  headerSpacer: { width: 34 },
  scrollContent: { paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 28 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 10,
    marginTop: 14,
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
  rowSub: { fontSize: 13, fontWeight: '500', marginTop: 3, lineHeight: 18 },
  rowRight: { fontSize: 13, fontWeight: '700' },
  divider: { height: 1, marginLeft: 16 },
});
