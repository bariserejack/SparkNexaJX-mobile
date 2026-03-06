import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Theme } from '../constants/Theme';
import { useAppTheme } from '../lib/theme';

type AudienceOption = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sub: string;
};

const AUDIENCE_OPTIONS: AudienceOption[] = [
  { key: 'public', icon: 'earth-outline', label: 'Public', sub: 'Anyone on or off SparkNexa' },
  { key: 'friends', icon: 'people-outline', label: 'Friends', sub: 'Your friends on SparkNexa' },
  { key: 'friends_except', icon: 'people-circle-outline', label: 'Friends except...', sub: "Don't show to some friends" },
  { key: 'specific_friends', icon: 'person-outline', label: 'Specific friends', sub: 'Only show to some friends' },
  { key: 'only_me', icon: 'lock-closed-outline', label: 'Only me', sub: 'Only me' },
];

export default function PostAudienceScreen() {
  const { activeTheme } = useAppTheme();
  const [selectedAudience, setSelectedAudience] = useState('public');
  const [setDefault, setSetDefault] = useState(true);

  const selectedLabel = useMemo(
    () => AUDIENCE_OPTIONS.find((item) => item.key === selectedAudience)?.label ?? 'Public',
    [selectedAudience]
  );

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: activeTheme.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={activeTheme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: activeTheme.text }]}>Who can see your post?</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.description, { color: activeTheme.textMuted }]}>
            Your post will show up in Feed, on your profile and in search results.
          </Text>
          <Text style={[styles.description, { color: activeTheme.textMuted }]}>
            Your default audience is set to {selectedLabel}, but you can change the audience of this specific post.
          </Text>

          <View style={[styles.optionsCard, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
            {AUDIENCE_OPTIONS.map((item, index) => {
              const active = item.key === selectedAudience;
              return (
                <View key={item.key}>
                  <TouchableOpacity style={styles.optionRow} onPress={() => setSelectedAudience(item.key)}>
                    <View style={[styles.iconFrame, { borderColor: activeTheme.border, backgroundColor: activeTheme.background }]}>
                      <Ionicons name={item.icon} size={16} color={activeTheme.text} />
                      <View style={styles.iconAccent} />
                    </View>
                    <View style={styles.optionTextWrap}>
                      <Text style={[styles.optionLabel, { color: activeTheme.text }]}>{item.label}</Text>
                      <Text style={[styles.optionSub, { color: activeTheme.textMuted }]}>{item.sub}</Text>
                    </View>
                    <View
                      style={[
                        styles.radioOuter,
                        { borderColor: active ? Theme.brand.primary : activeTheme.textMuted },
                      ]}
                    >
                      {active ? <View style={styles.radioInner} /> : null}
                    </View>
                  </TouchableOpacity>
                  {index !== AUDIENCE_OPTIONS.length - 1 ? (
                    <View style={[styles.divider, { backgroundColor: activeTheme.border }]} />
                  ) : null}
                </View>
              );
            })}
          </View>

          <View style={[styles.noticeCard, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
            <Text style={[styles.noticeTitle, { color: activeTheme.text }]}>Control your public post commenting</Text>
            <Text style={[styles.noticeText, { color: activeTheme.textMuted }]}>
              You can change who can comment on your public posts anytime. Go to settings.
            </Text>
          </View>

          <TouchableOpacity style={styles.defaultRow} onPress={() => setSetDefault((prev) => !prev)}>
            <Text style={[styles.defaultText, { color: activeTheme.textMuted }]}>Set as default audience.</Text>
            <View style={[styles.checkbox, { backgroundColor: setDefault ? Theme.brand.primary : activeTheme.border }]}>
              {setDefault ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : null}
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.doneButton, { backgroundColor: Theme.brand.primary }]} onPress={() => router.back()}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
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
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '900', letterSpacing: -0.2 },
  headerSpacer: { width: 34 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 26 },
  description: { fontSize: 13, fontWeight: '500', lineHeight: 18, marginBottom: 8 },
  optionsCard: { marginTop: 6, borderWidth: 1, borderRadius: 18, overflow: 'hidden' },
  optionRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12 },
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
  optionTextWrap: { flex: 1, paddingRight: 10 },
  optionLabel: { fontSize: 16, fontWeight: '700', letterSpacing: -0.1 },
  optionSub: { marginTop: 1, fontSize: 13, fontWeight: '500', lineHeight: 18 },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: Theme.brand.primary },
  divider: { height: 1, marginLeft: 52 },
  noticeCard: { marginTop: 16, borderWidth: 1, borderRadius: 14, padding: 12 },
  noticeTitle: { fontSize: 15, fontWeight: '700' },
  noticeText: { marginTop: 4, fontSize: 13, fontWeight: '500', lineHeight: 18 },
  defaultRow: { marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  defaultText: { fontSize: 15, fontWeight: '600' },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButton: { marginTop: 16, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  doneText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
