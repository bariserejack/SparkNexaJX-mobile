import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useDrawerBack } from '../lib/useDrawerBack';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

import { Theme } from '../constants/Theme';
import { useAppTheme } from '../lib/theme';

const REQUESTS = [
  {
    id: 'req-1',
    name: 'Gift Patrick',
    handle: '@gift_p',
    focus: 'Computer Engineering',
    location: 'Uyo, Nigeria',
    level: 'Level 3',
    status: 'Active now',
    mutual: '3 mutual tune-ins',
    sent: '22h',
    message: 'Hi! I saw we are both into hardware. Would love to collaborate on projects.',
  },
  {
    id: 'req-2',
    name: 'Esther Nick',
    handle: '@esther.nick',
    focus: 'Graphic Design',
    location: 'Calabar, Nigeria',
    level: 'Level 2',
    status: 'Active now',
    mutual: '1 mutual tune-in',
    sent: '15w',
    message: 'Hey! I am looking for a study buddy for product UI sprints.',
  },
  {
    id: 'req-3',
    name: 'Ade Llah',
    handle: '@ade.llah',
    focus: 'Math Study Group',
    location: 'Lagos, Nigeria',
    level: 'Level 4',
    status: 'Active now',
    mutual: '2 mutual tune-ins',
    sent: '2y',
    message: 'Let us sync on calculus practice and group sessions.',
  },
];

const SUGGESTIONS = [
  {
    id: 'sug-1',
    name: 'Kemi Grace',
    handle: '@kemi.grace',
    focus: 'Embedded Systems',
    location: 'Benin City, Nigeria',
    compatibility: 88,
    mutual: '2 mutual tune-ins',
  },
  {
    id: 'sug-2',
    name: 'Samuel O.',
    handle: '@samuel.o',
    focus: 'AI & Data',
    location: 'Accra, Ghana',
    compatibility: 91,
    mutual: '4 mutual tune-ins',
  },
];

const TUNED = [
  {
    id: 'tuned-1',
    name: 'Sarah K',
    handle: '@sarah.k',
    focus: 'Apple Tech',
    location: 'Abuja, Nigeria',
    level: 'Level 5',
    streak: '12 days',
    lastActive: '5 minutes ago',
  },
  {
    id: 'tuned-2',
    name: 'Dr. Chen',
    handle: '@dr.chen',
    focus: 'Engineering',
    location: 'London, UK',
    level: 'Level 6',
    streak: '19 days',
    lastActive: '2 hours ago',
  },
];

const initials = (name: string) => name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

export default function TuneRequestsScreen() {
  const { activeTheme } = useAppTheme();
  const drawerBack = useDrawerBack();
  const params = useLocalSearchParams<{ tab?: string }>();
  const fromDrawer = Array.isArray((params as any).fromDrawer)
    ? (params as any).fromDrawer[0] === '1' || (params as any).fromDrawer[0] === 'true'
    : (params as any).fromDrawer === '1' || (params as any).fromDrawer === 'true';
  const paramRaw = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const paramTab =
    paramRaw === 'active' || paramRaw === 'suggestions' || paramRaw === 'friends'
      ? paramRaw
      : undefined;
  const [activeTab, setActiveTab] = useState<'active' | 'suggestions' | 'friends'>(
    paramTab ?? 'active'
  );
  const [lastParamTab, setLastParamTab] = useState<string | undefined>(paramTab);

  useEffect(() => {
    if (paramTab && paramTab !== lastParamTab) {
      setActiveTab(paramTab as 'active' | 'suggestions' | 'friends');
      setLastParamTab(paramTab);
    }
  }, [paramTab, lastParamTab]);

  const handleBack = () => {
    if (fromDrawer) {
      drawerBack();
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/index');
  };

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: activeTheme.border }]}> 
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={16} color={activeTheme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: activeTheme.text }]}>Tune Orbit</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={[styles.tabRow, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}> 
            {[
              { id: 'active', label: 'Active', icon: 'pulse-outline' },
              { id: 'suggestions', label: 'Suggestions', icon: 'sparkles-outline' },
              { id: 'friends', label: 'Your Friends', icon: 'people-outline' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tabPill, isActive && styles.tabPillActive]}
                  onPress={() => setActiveTab(tab.id as any)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={tab.icon as any}
                    size={14}
                    color={isActive ? '#FFFFFF' : activeTheme.textMuted}
                  />
                  <Text style={[styles.tabText, { color: isActive ? '#FFFFFF' : activeTheme.textMuted }]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Animated.View key={activeTab} entering={FadeInRight} exiting={FadeInDown} style={{ marginTop: 8 }}>
            {activeTab === 'active' && (
              <>
                <Text style={[styles.sectionLabel, { color: activeTheme.textMuted }]}>Pending Tune Requests</Text>
                {REQUESTS.map((req) => (
                  <TouchableOpacity
                    key={req.id}
                    style={[styles.requestCard, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}
                    activeOpacity={0.9}
                    onPress={() =>
                      router.push({
                        pathname: '/tune-request-detail',
                        params: {
                          name: req.name,
                          handle: req.handle,
                          focus: req.focus,
                          location: req.location,
                          level: req.level,
                          status: req.status,
                          mutual: req.mutual,
                          sent: req.sent,
                          message: req.message,
                          returnTo: 'tune-requests',
                          returnTab: 'active',
                        },
                      })
                    }
                  >
                    <View style={styles.requestHeader}>
                      <View style={[styles.avatar, { backgroundColor: Theme.brand.primary + '22' }]}> 
                        <Text style={styles.avatarText}>{initials(req.name)}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.requestName, { color: activeTheme.text }]}>{req.name}</Text>
                        <Text style={[styles.requestMeta, { color: activeTheme.textMuted }]}> 
                          {req.handle} · {req.focus}
                        </Text>
                        <Text style={[styles.requestMeta, { color: activeTheme.textMuted }]}>
                          {req.mutual} · {req.sent}
                        </Text>
                      </View>
                      <View style={[styles.levelPill, { borderColor: activeTheme.border }]}> 
                        <Text style={[styles.levelText, { color: activeTheme.text }]}>{req.level}</Text>
                      </View>
                    </View>
                    <View style={styles.requestActions}>
                      <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: Theme.brand.primary }]}> 
                        <Text style={styles.primaryBtnText}>Tune Back</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.ghostBtn, { borderColor: activeTheme.border }]}> 
                        <Text style={[styles.ghostBtnText, { color: activeTheme.text }]}>Decline</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {activeTab === 'suggestions' && (
              <>
                <Text style={[styles.sectionLabel, { color: activeTheme.textMuted }]}>Suggested Tune Ins</Text>
                {SUGGESTIONS.map((item) => (
                  <View key={item.id} style={[styles.requestCard, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}> 
                    <View style={styles.requestHeader}>
                      <View style={[styles.avatar, { backgroundColor: Theme.brand.accent + '22' }]}> 
                        <Text style={[styles.avatarText, { color: Theme.brand.accent }]}>{initials(item.name)}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.requestName, { color: activeTheme.text }]}>{item.name}</Text>
                        <Text style={[styles.requestMeta, { color: activeTheme.textMuted }]}> 
                          {item.handle} · {item.focus}
                        </Text>
                        <Text style={[styles.requestMeta, { color: activeTheme.textMuted }]}>
                          {item.location} · {item.mutual}
                        </Text>
                      </View>
                      <View style={[styles.compatPill, { borderColor: Theme.brand.primary }]}> 
                        <Text style={[styles.compatText, { color: Theme.brand.primary }]}>{item.compatibility}%</Text>
                      </View>
                    </View>
                    <View style={styles.requestActions}>
                      <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: Theme.brand.primary }]}> 
                        <Text style={styles.primaryBtnText}>Tune In</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.ghostBtn, { borderColor: activeTheme.border }]}> 
                        <Text style={[styles.ghostBtnText, { color: activeTheme.text }]}>Skip</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </>
            )}

            {activeTab === 'friends' && (
              <>
                <Text style={[styles.sectionLabel, { color: activeTheme.textMuted }]}>Tuned Profiles</Text>
                {TUNED.map((tuned) => (
                  <TouchableOpacity
                    key={tuned.id}
                    style={[styles.tunedCard, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}
                    onPress={() =>
                      router.push({
                        pathname: '/tuned-profile',
                        params: {
                          name: tuned.name,
                          handle: tuned.handle,
                          focus: tuned.focus,
                          location: tuned.location,
                          level: tuned.level,
                          streak: tuned.streak,
                          lastActive: tuned.lastActive,
                          returnTo: 'tune-requests',
                          returnTab: 'friends',
                        },
                      })
                    }
                  >
                    <View style={styles.requestHeader}>
                      <View style={[styles.avatar, { backgroundColor: Theme.brand.accent + '22' }]}> 
                        <Text style={[styles.avatarText, { color: Theme.brand.accent }]}>{initials(tuned.name)}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.requestName, { color: activeTheme.text }]}>{tuned.name}</Text>
                        <Text style={[styles.requestMeta, { color: activeTheme.textMuted }]}>
                          {tuned.handle} · {tuned.focus}
                        </Text>
                        <Text style={[styles.requestMeta, { color: activeTheme.textMuted }]}>
                          {tuned.location} · {tuned.level}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={activeTheme.textMuted} />
                    </View>
                    <View style={styles.tunedMetaRow}>
                      <View style={styles.tunedMetaPill}>
                        <Ionicons name="flame-outline" size={12} color={Theme.brand.primary} />
                        <Text style={[styles.tunedMetaText, { color: activeTheme.textMuted }]}>Streak {tuned.streak}</Text>
                      </View>
                      <View style={styles.tunedMetaPill}>
                        <Ionicons name="time-outline" size={12} color={Theme.brand.primary} />
                        <Text style={[styles.tunedMetaText, { color: activeTheme.textMuted }]}>{tuned.lastActive}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </Animated.View>
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
  scrollContent: { paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 28 },
  tabRow: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 6,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'space-between',
  },
  tabPill: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  tabPillActive: {
    backgroundColor: Theme.brand.primary,
  },
  tabText: { fontSize: 12, fontWeight: '800' },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 10,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  requestCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  requestHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Theme.brand.primary, fontSize: 16, fontWeight: '800' },
  requestName: { fontSize: 16, fontWeight: '800' },
  requestMeta: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  levelPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1 },
  levelText: { fontSize: 11, fontWeight: '800' },
  compatPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1 },
  compatText: { fontSize: 11, fontWeight: '800' },
  requestActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  primaryBtn: { flex: 1, paddingVertical: 10, borderRadius: 14, alignItems: 'center' },
  primaryBtnText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  ghostBtn: { flex: 1, paddingVertical: 10, borderRadius: 14, alignItems: 'center', borderWidth: 1 },
  ghostBtnText: { fontSize: 12, fontWeight: '700' },
  tunedCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  tunedMetaRow: { flexDirection: 'row', gap: 10, marginTop: 12, flexWrap: 'wrap' },
  tunedMetaPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(115,103,240,0.1)' },
  tunedMetaText: { fontSize: 11, fontWeight: '600' },
});
