import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Theme } from '../constants/Theme';
import { useAppTheme } from '../lib/theme';

type ProfileSettingItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route?: string;
};

const PROFILE_SETTINGS: ProfileSettingItem[] = [
  { icon: 'create-outline', label: 'Edit', route: '/edit-profile' },
  { icon: 'sparkles-outline', label: 'Edit highlights' },
  { icon: 'shield-checkmark-outline', label: 'Meta Verified' },
  { icon: 'shield-outline', label: 'Profile status' },
  { icon: 'archive-outline', label: 'Archive' },
  { icon: 'eye-outline', label: 'View as' },
  { icon: 'list-outline', label: 'Activity log' },
  { icon: 'newspaper-outline', label: 'Review posts and tags' },
  { icon: 'lock-closed-outline', label: 'Privacy Center' },
  { icon: 'search-outline', label: 'Search' },
  { icon: 'return-down-back-outline', label: 'Turn off professional mode' },
  { icon: 'share-social-outline', label: 'Share profile' },
  { icon: 'person-add-outline', label: 'Invite people to connect' },
  { icon: 'diamond-outline', label: 'Fan engagement' },
];

const PROFILE_LINK = '';

export default function ProfileSettingsScreen() {
  const { activeTheme } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: activeTheme.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={16} color={activeTheme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: activeTheme.text }]}>Profile Settings</Text>
          <TouchableOpacity style={[styles.avatarDot, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
            <Text style={[styles.avatarDotText, { color: activeTheme.text }]}>AR</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={[styles.settingsCard, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
            {PROFILE_SETTINGS.map((item, index) => (
              <View key={item.label}>
                <TouchableOpacity
                  style={styles.itemRow}
                  disabled={!item.route}
                  onPress={() => item.route && router.push(item.route as any)}
                >
                  <View
                    style={[
                      styles.iconFrame,
                      { borderColor: activeTheme.border, backgroundColor: activeTheme.background },
                    ]}
                  >
                    <Ionicons name={item.icon} size={16} color={activeTheme.text} />
                    <View style={styles.iconAccent} />
                  </View>
                  <Text style={[styles.itemLabel, { color: activeTheme.text }]}>{item.label}</Text>
                  {item.route ? <Ionicons name="chevron-forward" size={16} color={activeTheme.textMuted} /> : null}
                </TouchableOpacity>
                {index !== PROFILE_SETTINGS.length - 1 ? (
                  <View style={[styles.divider, { backgroundColor: activeTheme.border }]} />
                ) : null}
              </View>
            ))}
          </View>

          <View style={[styles.linkCard, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
            <Text style={[styles.linkTitle, { color: activeTheme.text }]}>Your profile link</Text>
            <Text style={[styles.linkSub, { color: activeTheme.textMuted }]}>
              Your personalized link on SparkNexa.
            </Text>
            <View style={[styles.linkBox, { borderColor: activeTheme.border, backgroundColor: activeTheme.background }]}>
              <Text style={[styles.linkText, { color: activeTheme.text }]} numberOfLines={2}>
                {PROFILE_LINK}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.copyBtn, { backgroundColor: PROFILE_LINK ? Theme.brand.primary : activeTheme.border }]}
              onPress={() => Alert.alert(PROFILE_LINK ? 'Copied' : 'No link', PROFILE_LINK ? 'Profile link copied to clipboard.' : 'No profile link has been added yet.')}
            >
              <Text style={styles.copyText}>Copy link</Text>
            </TouchableOpacity>
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
  headerTitle: { fontSize: 26, fontWeight: '900', letterSpacing: -0.4, flex: 1, textAlign: 'center' },
  avatarDot: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarDotText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.6 },
  scrollContent: { paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 34 },
  settingsCard: { borderWidth: 1, borderRadius: 20, overflow: 'hidden' },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13 },
  iconFrame: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
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
  itemLabel: { fontSize: 16, fontWeight: '700', letterSpacing: -0.1, flex: 1 },
  divider: { height: 1, marginLeft: 54 },
  linkCard: { marginTop: 16, borderWidth: 1, borderRadius: 20, padding: 16 },
  linkTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.3 },
  linkSub: { marginTop: 4, fontSize: 14, fontWeight: '500', lineHeight: 20 },
  linkBox: { marginTop: 14, borderWidth: 1, borderRadius: 12, padding: 12 },
  linkText: { fontSize: 14, fontWeight: '600' },
  copyBtn: { marginTop: 14, borderRadius: 12, height: 42, alignItems: 'center', justifyContent: 'center' },
  copyText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});
