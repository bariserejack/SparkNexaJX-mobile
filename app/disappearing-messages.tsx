import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Theme } from '../constants/Theme';
import { useAppTheme } from '../lib/theme';

type TimerOption = '24 hours' | '7 days' | '90 days' | 'Off';

const TIMER_OPTIONS: TimerOption[] = ['24 hours', '7 days', '90 days', 'Off'];

export default function DisappearingMessagesScreen() {
  const { activeTheme, isDark } = useAppTheme();
  const [selectedTimer, setSelectedTimer] = useState<TimerOption>('Off');
  const { returnTo, dmName, dmColor } = useLocalSearchParams<{ returnTo?: string; dmName?: string; dmColor?: string }>();

  const handleBack = () => {
    const name = Array.isArray(dmName) ? dmName[0] : dmName;
    const color = Array.isArray(dmColor) ? dmColor[0] : dmColor;
    if (returnTo === 'dm' && name) {
      router.replace({ pathname: '/pulse', params: { dmName: name, dmColor: color || Theme.brand.primary } });
      return;
    }
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: activeTheme.border, backgroundColor: activeTheme.background }]}>
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
            <Ionicons name="chevron-back" size={16} color={activeTheme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: activeTheme.text }]}>Disappearing messages</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.illustrationWrap}>
            <View style={[styles.illusBubble, { backgroundColor: '#DFF7E6' }]} />
            <View style={[styles.illusBubbleSmall, { backgroundColor: '#E9FBEF' }]} />
            <View style={[styles.illusTimer, { backgroundColor: '#34C759' }]}>
              <Ionicons name="time-outline" size={26} color="#0B3B1F" />
            </View>
            <View style={[styles.illusAccent, { backgroundColor: '#E9FBEF' }]} />
          </View>

          <Text style={[styles.title, { color: activeTheme.text }]}>
            Make messages in this chat disappear
          </Text>
          <Text style={[styles.desc, { color: activeTheme.textMuted }]}>
            For more privacy and storage, new messages will disappear from this chat for everyone after the selected duration except when kept.
            Anyone in the chat can change this setting.
            <Text style={{ color: Theme.brand.primary }}> Learn more</Text>
          </Text>

          <View style={[styles.section, { borderTopColor: activeTheme.border }]}>
            <Text style={[styles.sectionTitle, { color: activeTheme.text }]}>Message timer</Text>
            {TIMER_OPTIONS.map((option) => {
              const selected = selectedTimer === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={styles.optionRow}
                  onPress={() => setSelectedTimer(option)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.radioOuter, { borderColor: selected ? Theme.brand.primary : activeTheme.border }]}>
                    {selected ? <View style={[styles.radioInner, { backgroundColor: Theme.brand.primary }]} /> : null}
                  </View>
                  <Text style={[styles.optionLabel, { color: activeTheme.text }]}>{option}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.footerHint, { color: activeTheme.textMuted }]}>
            Update your <Text style={{ color: Theme.brand.primary, fontWeight: '700' }}>default message timer</Text> in Settings
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '800', letterSpacing: -0.2 },
  headerSpacer: { width: 36 },
  content: { paddingHorizontal: 22, paddingTop: 24, paddingBottom: 40 },
  illustrationWrap: {
    alignSelf: 'center',
    width: 160,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  illusTimer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#34C759',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  illusBubble: {
    position: 'absolute',
    width: 46,
    height: 30,
    borderRadius: 15,
    right: 10,
    top: 18,
  },
  illusBubbleSmall: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    right: 34,
    top: 50,
  },
  illusAccent: {
    position: 'absolute',
    width: 36,
    height: 18,
    borderRadius: 9,
    left: 12,
    bottom: 18,
  },
  title: { fontSize: 16, fontWeight: '800', marginBottom: 8 },
  desc: { fontSize: 13, lineHeight: 20, fontWeight: '500' },
  section: { marginTop: 24, borderTopWidth: 1, paddingTop: 18 },
  sectionTitle: { fontSize: 14, fontWeight: '800', marginBottom: 12 },
  optionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  optionLabel: { fontSize: 15, fontWeight: '600' },
  footerHint: { marginTop: 16, fontSize: 12, lineHeight: 18, fontWeight: '500' },
});
