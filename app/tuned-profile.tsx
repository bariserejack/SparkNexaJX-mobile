import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { Theme } from '../constants/Theme';
import { useAppTheme } from '../lib/theme';

const SKILLS = [
  { label: 'Circuit Design', value: 85 },
  { label: 'Python', value: 60 },
  { label: 'Embedded Systems', value: 40 },
];

const ACTIVITY = [
  '2h ago · Commented on "Logic Gates"',
  'Yesterday · Shared notes: Micro-controllers',
  '3d ago · Joined "Hardware Hackers"',
];

const MUTUALS = ['Esther Nick', 'Ade Llah', '+4 more'];

export default function TunedProfileScreen() {
  const { activeTheme } = useAppTheme();
  const params = useLocalSearchParams<{
    name?: string;
    handle?: string;
    focus?: string;
    location?: string;
    level?: string;
    streak?: string;
    lastActive?: string;
    returnTo?: string;
    returnTab?: string;
  }>();

  const name = params.name || 'Gift Patrick';
  const handle = params.handle || '@gift_p';
  const focus = params.focus || 'Computer Engineering';
  const location = params.location || 'Uyo, Nigeria';
  const level = params.level || 'Level 3';
  const streak = params.streak || '12 days';
  const lastActive = params.lastActive || '5 minutes ago';
  const returnTo = params.returnTo;
  const returnTab = params.returnTab;

  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const [notify, setNotify] = useState<'all' | 'mentions' | 'mute'>('mentions');

  const handleBack = () => {
    if (returnTo === 'tune-requests') {
      router.replace({ pathname: '/tune-requests', params: { tab: returnTab || 'friends' } });
      return;
    }
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: activeTheme.border }]}> 
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={16} color={activeTheme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: activeTheme.text }]}>Tuned · {name}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={[styles.profileCard, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}> 
            <View style={[styles.avatar, { backgroundColor: Theme.brand.primary + '22' }]}> 
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={[styles.profileName, { color: activeTheme.text }]}>{name}</Text>
            <Text style={[styles.profileHandle, { color: activeTheme.textMuted }]}>{handle} · {focus}</Text>
            <View style={styles.statusRow}>
              <Text style={[styles.statusText, { color: activeTheme.textMuted }]}>{location} · {level}</Text>
              <Text style={[styles.statusText, { color: Theme.brand.success }]}>Active now</Text>
            </View>
          </View>

          <View style={styles.pillRow}>
            <View style={[styles.statusPill, { backgroundColor: Theme.brand.primary + '18' }]}> 
              <Ionicons name="flame-outline" size={14} color={Theme.brand.primary} />
              <Text style={[styles.pillText, { color: activeTheme.textMuted }]}>Learning streak: {streak}</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: Theme.brand.primary + '18' }]}> 
              <Ionicons name="time-outline" size={14} color={Theme.brand.primary} />
              <Text style={[styles.pillText, { color: activeTheme.textMuted }]}>Last active: {lastActive}</Text>
            </View>
          </View>

          <Text style={[styles.sectionLabel, { color: activeTheme.textMuted }]}>Skill Mastery</Text>
          <View style={[styles.card, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}> 
            {SKILLS.map((skill) => (
              <View key={skill.label} style={styles.skillRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.skillLabel, { color: activeTheme.text }]}>{skill.label}</Text>
                  <View style={[styles.skillTrack, { backgroundColor: activeTheme.border }]}> 
                    <View style={[styles.skillFill, { width: `${skill.value}%`, backgroundColor: Theme.brand.primary }]} />
                  </View>
                </View>
                <Text style={[styles.skillValue, { color: activeTheme.textMuted }]}>{skill.value}%</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionLabel, { color: activeTheme.textMuted }]}>Mutual Connections</Text>
          <View style={[styles.card, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}> 
            {MUTUALS.map((item) => (
              <View key={item} style={styles.listRow}>
                <Ionicons name="person-outline" size={16} color={Theme.brand.primary} />
                <Text style={[styles.listText, { color: activeTheme.text }]}>{item}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionLabel, { color: activeTheme.textMuted }]}>Recent Activity</Text>
          <View style={[styles.card, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}> 
            {ACTIVITY.map((item) => (
              <View key={item} style={styles.listRow}>
                <Ionicons name="time-outline" size={16} color={Theme.brand.primary} />
                <Text style={[styles.listText, { color: activeTheme.text }]}>{item}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionLabel, { color: activeTheme.textMuted }]}>Collaboration Options</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: Theme.brand.primary }]}
              onPress={() =>
                router.push({
                  pathname: '/pulse',
                  params: { dmName: name, dmColor: Theme.brand.primary },
                })
              }
            >
              <Text style={styles.primaryBtnText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: Theme.brand.accent }]}> 
              <Text style={styles.primaryBtnText}>Start Study Session</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.ghostBtn, { borderColor: activeTheme.border }]}> 
              <Text style={[styles.ghostBtnText, { color: activeTheme.text }]}>Share Resources</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.ghostBtn, { borderColor: activeTheme.border }]}> 
              <Text style={[styles.ghostBtnText, { color: activeTheme.text }]}>Untune</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionLabel, { color: activeTheme.textMuted }]}>Notification Preferences</Text>
          <View style={[styles.card, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}> 
            {['all', 'mentions', 'mute'].map((option) => (
              <TouchableOpacity key={option} style={styles.radioRow} onPress={() => setNotify(option as any)}>
                <Text style={[styles.radioText, { color: activeTheme.text }]}>
                  {option === 'all' ? 'All updates' : option === 'mentions' ? 'Mentions only' : 'Mute'}
                </Text>
                <Ionicons
                  name={notify === option ? 'radio-button-on' : 'radio-button-off'}
                  size={16}
                  color={notify === option ? Theme.brand.primary : activeTheme.textMuted}
                />
              </TouchableOpacity>
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
  headerTitle: { fontSize: 18, fontWeight: '900', letterSpacing: -0.2 },
  headerSpacer: { width: 34 },
  scrollContent: { paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 32 },
  profileCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    alignItems: 'center',
    gap: 6,
  },
  avatar: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Theme.brand.primary, fontSize: 24, fontWeight: '800' },
  profileName: { fontSize: 20, fontWeight: '900' },
  profileHandle: { fontSize: 13, fontWeight: '600' },
  statusRow: { marginTop: 6, alignItems: 'center', gap: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  pillRow: { marginTop: 12, gap: 8 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  pillText: { fontSize: 12, fontWeight: '600' },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 10,
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  card: { borderWidth: 1, borderRadius: 18, padding: 14, gap: 10 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  listText: { fontSize: 13, fontWeight: '600' },
  skillRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  skillLabel: { fontSize: 13, fontWeight: '700', marginBottom: 6 },
  skillTrack: { height: 6, borderRadius: 999, overflow: 'hidden' },
  skillFill: { height: '100%', borderRadius: 999 },
  skillValue: { fontSize: 12, fontWeight: '700' },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  primaryBtn: { flexBasis: '48%', paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  primaryBtnText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  ghostBtn: { flexBasis: '48%', paddingVertical: 12, borderRadius: 14, alignItems: 'center', borderWidth: 1 },
  ghostBtnText: { fontSize: 12, fontWeight: '700' },
  radioRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  radioText: { fontSize: 13, fontWeight: '600' },
});
