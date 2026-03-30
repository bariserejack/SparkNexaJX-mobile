import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { Theme } from '../../constants/Theme';
import { useAppTheme } from '../../lib/theme';

const COMMUNITIES = [
  { name: 'Career Mentors Hub', members: '128 members', icon: 'briefcase-outline' },
  { name: 'Neural Networks Lab', members: '64 members', icon: 'analytics-outline' },
  { name: 'Spark Educators Circle', members: '96 members', icon: 'school-outline' },
];

export default function CommunitiesScreen() {
  const { activeTheme } = useAppTheme();
  const { from, returnTo } = useLocalSearchParams<{ from?: string; returnTo?: string }>();

  const handleBack = () => {
    if (from === 'settings') {
      router.replace('/settings');
      return;
    }
    if (from === 'pulse') {
      if (returnTo === 'groups') {
        router.replace({ pathname: '/pulse', params: { modal: 'groups' } });
        return;
      }
      if (returnTo === 'menu') {
        router.replace({ pathname: '/pulse', params: { modal: 'menu' } });
        return;
      }
      router.replace('/pulse');
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/pulse');
  };

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: activeTheme.border }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={16} color={activeTheme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: activeTheme.text }]}>Your Communities</Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
          {COMMUNITIES.map((community, index) => (
            <View key={community.name}>
              <TouchableOpacity style={styles.row}>
                <View style={[styles.iconBox, { backgroundColor: activeTheme.background }]}>
                  <Ionicons name={community.icon as any} size={16} color={activeTheme.text} />
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, { color: activeTheme.text }]}>{community.name}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={activeTheme.textMuted} />
              </TouchableOpacity>
              {index !== COMMUNITIES.length - 1 ? <View style={[styles.divider, { backgroundColor: activeTheme.border }]} /> : null}
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: Theme.brand.primary }]}
          onPress={() =>
            router.push({
              pathname: '/communities/new',
              params: returnTo ? { from: 'communities', returnTo } : { from: 'communities' },
            })
          }
        >
          <Ionicons name="add-circle-outline" size={16} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Create new community</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { width: 32, alignItems: 'flex-start' },
  headerTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -0.4 },
  headerSpacer: { width: 32 },
  scrollContent: { paddingHorizontal: 16, paddingVertical: 18, paddingBottom: 40, gap: 18 },
  card: { borderWidth: 1, borderRadius: 18, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  iconBox: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '700' },
  divider: { height: 1, marginLeft: 58 },
  primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 12 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
