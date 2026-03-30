import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { Theme } from '../constants/Theme';
import { useAppTheme } from '../lib/theme';

const MUTUALS = [
  { name: 'Esther Nick', detail: 'Graphic Design' },
  { name: 'Ade Llah', detail: 'Math Study Group' },
  { name: '+1 more', detail: '' },
];

const CONTEXT = [
  'Same course: Computer Engineering',
  'Shared skill: Circuit Design',
  '3 common study groups',
];

export default function TuneRequestDetailScreen() {
  const { activeTheme } = useAppTheme();
  const params = useLocalSearchParams<{
    name?: string;
    handle?: string;
    focus?: string;
    location?: string;
    level?: string;
    status?: string;
    mutual?: string;
    sent?: string;
    message?: string;
    returnTo?: string;
    returnTab?: string;
  }>();

  const name = params.name || 'Gift Patrick';
  const handle = params.handle || '@gift_p';
  const focus = params.focus || 'Computer Engineering';
  const location = params.location || 'Uyo, Nigeria';
  const level = params.level || 'Level 3';
  const status = params.status || 'Active now';
  const sent = params.sent || '22h';
  const message = params.message || 'Hi! I saw we are both into hardware. Would love to collaborate on projects.';
  const returnTo = params.returnTo;
  const returnTab = params.returnTab;

  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleBack = () => {
    if (returnTo === 'tune-requests') {
      router.replace({ pathname: '/tune-requests', params: { tab: returnTab || 'active' } });
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
          <Text style={[styles.headerTitle, { color: activeTheme.text }]}>Tune Request</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={[styles.profileCard, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}> 
            <View style={[styles.avatar, { backgroundColor: Theme.brand.primary + '22' }]}> 
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={[styles.profileName, { color: activeTheme.text }]}>{name}</Text>
            <Text style={[styles.profileHandle, { color: activeTheme.textMuted }]}>{handle} · {focus}</Text>
          </View>

          <View style={styles.pillRow}>
            <View style={[styles.statusPill, { backgroundColor: Theme.brand.success + '20' }]}> 
              <Text style={[styles.statusText, { color: Theme.brand.success }]}>{status}</Text>
            </View>
            <View style={[styles.statusPill, { borderColor: activeTheme.border }]}> 
              <Text style={[styles.statusText, { color: activeTheme.text }]}>{level}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={16} color={activeTheme.textMuted} />
            <Text style={[styles.metaText, { color: activeTheme.textMuted }]}>{location}</Text>
          </View>

          <Text style={[styles.sectionLabel, { color: activeTheme.textMuted }]}>Mutual Tune Ins</Text>
          <View style={[styles.card, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}> 
            {MUTUALS.map((item, index) => (
              <View key={`${item.name}-${index}`} style={styles.listRow}>
                <Ionicons name="person-outline" size={16} color={Theme.brand.primary} />
                <Text style={[styles.listText, { color: activeTheme.text }]}> 
                  {item.name}{item.detail ? ` · ${item.detail}` : ''}
                </Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionLabel, { color: activeTheme.textMuted }]}>Learning Context</Text>
          <View style={[styles.card, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}> 
            {CONTEXT.map((item) => (
              <View key={item} style={styles.listRow}>
                <Ionicons name="sparkles-outline" size={16} color={Theme.brand.primary} />
                <Text style={[styles.listText, { color: activeTheme.text }]}>{item}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionLabel, { color: activeTheme.textMuted }]}>Compatibility Score</Text>
          <View style={[styles.card, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}> 
            <View style={styles.compatRow}>
              <View style={[styles.compatCircle, { borderColor: Theme.brand.primary }]}> 
                <Text style={[styles.compatValue, { color: Theme.brand.primary }]}>92%</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.compatText, { color: activeTheme.text }]}>Learning Style: Hands-on</Text>
                <Text style={[styles.compatText, { color: activeTheme.text }]}>Pace: Moderate</Text>
                <Text style={[styles.compatText, { color: activeTheme.text }]}>Availability: Evenings</Text>
              </View>
            </View>
          </View>

          <Text style={[styles.sectionLabel, { color: activeTheme.textMuted }]}>Request Message</Text>
          <View style={[styles.card, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}> 
            <Text style={[styles.bodyText, { color: activeTheme.text }]}>{message}</Text>
          </View>

          <Text style={[styles.timeText, { color: activeTheme.textMuted }]}>Request sent {sent} ago</Text>

          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: Theme.brand.primary }]}> 
              <Text style={styles.primaryBtnText}>Tune Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.ghostBtn, { borderColor: activeTheme.border }]}> 
              <Text style={[styles.ghostBtnText, { color: activeTheme.text }]}>Decline</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.fullProfileBtn, { borderColor: Theme.brand.primary }]}
            onPress={() =>
              router.push({
                pathname: '/tuned-profile',
                params: { name, handle, focus, location, level, returnTo: 'tune-requests', returnTab: returnTab || 'active' },
              })
            }
          >
            <Text style={[styles.fullProfileText, { color: Theme.brand.primary }]}>View Full Profile</Text>
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
  headerTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -0.3 },
  headerSpacer: { width: 34 },
  scrollContent: { paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 32 },
  profileCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    alignItems: 'center',
    gap: 8,
  },
  avatar: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Theme.brand.primary, fontSize: 24, fontWeight: '800' },
  profileName: { fontSize: 20, fontWeight: '900' },
  profileHandle: { fontSize: 13, fontWeight: '600' },
  pillRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  statusPill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'transparent' },
  statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  metaText: { fontSize: 12, fontWeight: '600' },
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
  compatRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  compatCircle: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  compatValue: { fontSize: 18, fontWeight: '900' },
  compatText: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  bodyText: { fontSize: 13, fontWeight: '500', lineHeight: 20 },
  timeText: { marginTop: 8, fontSize: 12, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  primaryBtn: { flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  primaryBtnText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  ghostBtn: { flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: 'center', borderWidth: 1 },
  ghostBtnText: { fontSize: 12, fontWeight: '700' },
  fullProfileBtn: { marginTop: 14, borderWidth: 1, borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  fullProfileText: { fontSize: 12, fontWeight: '800' },
});
