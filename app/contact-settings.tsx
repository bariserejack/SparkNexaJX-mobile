import React, { useEffect, useState } from 'react';
import { BackHandler, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { Theme } from '../constants/Theme';
import { useAppTheme } from '../lib/theme';

export default function ContactSettingsScreen() {
  const { activeTheme } = useAppTheme();
  const params = useLocalSearchParams<{ returnTo?: string }>();
  const [syncContacts, setSyncContacts] = useState(true);

  const goBackToOrigin = () => {
    const returnTo = typeof params.returnTo === 'string' ? params.returnTo : '';
    if (returnTo === 'new-chat') {
      router.replace({ pathname: '/pulse', params: { modal: 'new-chat' } });
      return;
    }
    if (!returnTo || returnTo === 'pulse') {
      router.replace('/pulse');
      return;
    }
    if (returnTo.startsWith('/')) {
      router.replace(returnTo);
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/pulse');
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      goBackToOrigin();
      return true;
    });
    return () => sub.remove();
  }, [params.returnTo]);

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: activeTheme.border }]}>
          <TouchableOpacity onPress={goBackToOrigin} style={[styles.headerIcon, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
            <Ionicons name="chevron-back" size={16} color={activeTheme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: activeTheme.text }]}>Contacts</Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
          <TouchableOpacity style={styles.row} activeOpacity={0.8}>
            <View style={[styles.rowIcon, { backgroundColor: activeTheme.background, borderColor: activeTheme.border }]}>
              <Ionicons name="ban-outline" size={16} color={activeTheme.text} />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: activeTheme.text }]}>Blocked accounts</Text>
              <Text style={[styles.rowMeta, { color: activeTheme.textMuted }]}>6</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <Text style={[styles.rowTitle, { color: activeTheme.text }]}>SparkNexa contacts</Text>
              <Text style={[styles.toggleDesc, { color: activeTheme.textMuted }]}>
                Contacts are saved to your SparkNexa account to manage them across devices. <Text style={[styles.linkText, { color: Theme.brand.primary }]}>Learn more</Text>
              </Text>
            </View>
            <Switch
              value={syncContacts}
              onValueChange={setSyncContacts}
              trackColor={{ false: activeTheme.border, true: Theme.brand.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
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
  headerTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.3 },
  headerIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  headerSpacer: { width: 36, height: 36 },
  content: { padding: 16, gap: 16 },
  card: { borderWidth: 1, borderRadius: 18, padding: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: '700' },
  rowMeta: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleText: { flex: 1 },
  toggleDesc: { fontSize: 12, fontWeight: '500', marginTop: 6, lineHeight: 18 },
  linkText: { fontWeight: '700' },
});
