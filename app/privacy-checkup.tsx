import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { Theme } from '../constants/Theme';
import { useAppTheme } from '../lib/theme';

const CHECKUP_ITEMS = [
  { icon: 'call-outline', label: 'Choose who can contact you' },
  { icon: 'person-outline', label: 'Control your personal info' },
  { icon: 'chatbubble-ellipses-outline', label: 'Add more privacy to your chats' },
  { icon: 'lock-closed-outline', label: 'Add more protection to your account' },
] as const;

export default function PrivacyCheckupScreen() {
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
          <Text style={[styles.headerTitle, { color: activeTheme.text }]}>Privacy checkup</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.heroWrap}>
            <View style={[styles.heroCard, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
              <View style={styles.heroIcons}>
                <View style={[styles.heroBadge, { backgroundColor: '#E5F9DF' }]}>
                  <Ionicons name="shield-checkmark-outline" size={16} color={Theme.brand.primary} />
                </View>
                <View style={[styles.heroCenter, { backgroundColor: '#C7F3C1', borderColor: Theme.brand.primary }]}>
                  <Ionicons name="lock-closed-outline" size={16} color={Theme.brand.primary} />
                </View>
                <View style={[styles.heroBadge, { backgroundColor: '#DBF7E2' }]}>
                  <Ionicons name="options-outline" size={16} color={Theme.brand.primary} />
                </View>
              </View>
              <Text style={[styles.heroTitle, { color: activeTheme.text }]}>Your privacy matters</Text>
              <Text style={[styles.heroSub, { color: activeTheme.textMuted }]}>
                Control your privacy settings and set up SparkNexa just the way you want it.
              </Text>
            </View>
          </View>

          <View style={[styles.listCard, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
            {CHECKUP_ITEMS.map((item, index) => (
              <View key={item.label}>
                <TouchableOpacity style={styles.itemRow} onPress={() => router.push('/privacy')}>
                  <View style={[styles.itemIcon, { backgroundColor: activeTheme.background, borderColor: activeTheme.border }]}>
                    <Ionicons name={item.icon} size={16} color={activeTheme.text} />
                    <View style={styles.itemAccent} />
                  </View>
                  <Text style={[styles.itemLabel, { color: activeTheme.text }]}>{item.label}</Text>
                  <Ionicons name="arrow-forward" size={16} color={activeTheme.textMuted} />
                </TouchableOpacity>
                {index !== CHECKUP_ITEMS.length - 1 ? <View style={[styles.divider, { backgroundColor: activeTheme.border }]} /> : null}
              </View>
            ))}
          </View>

          <Text style={[styles.footerNote, { color: activeTheme.textMuted }]}>
            Go to Settings &gt; Privacy to view more privacy settings.
          </Text>
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
  headerTitle: { fontSize: 26, fontWeight: '900', letterSpacing: -0.4 },
  headerSpacer: { width: 34 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 28 },
  heroWrap: { paddingTop: 20 },
  heroCard: { borderWidth: 1, borderRadius: 24, padding: 18, alignItems: 'center' },
  heroIcons: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  heroBadge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCenter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginHorizontal: -8,
    zIndex: 2,
  },
  heroTitle: { fontSize: 26, fontWeight: '900', letterSpacing: -0.4, marginBottom: 8 },
  heroSub: { fontSize: 14, lineHeight: 20, fontWeight: '500', textAlign: 'center' },
  listCard: { borderWidth: 1, borderRadius: 20, overflow: 'hidden', marginTop: 18 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13 },
  itemIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  itemAccent: {
    position: 'absolute',
    right: 2,
    top: 2,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Theme.brand.primary,
  },
  itemLabel: { flex: 1, fontSize: 16, fontWeight: '700', letterSpacing: -0.1 },
  divider: { height: 1, marginLeft: 54 },
  footerNote: { marginTop: 18, textAlign: 'center', fontSize: 13, fontWeight: '500', lineHeight: 18 },
});
