import React, { useEffect, useState } from 'react';
import { Alert, BackHandler, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';

import { Theme } from '../constants/Theme';
import { useAppTheme } from '../lib/theme';

type RoomMode = 'focus' | 'collab' | 'lecture';

const ROOM_MODES: Array<{ id: RoomMode; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { id: 'focus', label: 'Focus sprint', icon: 'hourglass-outline' },
  { id: 'collab', label: 'Co-study', icon: 'people-outline' },
  { id: 'lecture', label: 'Mini class', icon: 'school-outline' },
];

export default function StudyRoomScreen() {
  const { activeTheme } = useAppTheme();
  const params = useLocalSearchParams<{ returnTo?: string }>();
  const [roomName, setRoomName] = useState('');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('45');
  const [mode, setMode] = useState<RoomMode>('focus');
  const [muteOnEntry, setMuteOnEntry] = useState(true);
  const [raiseHand, setRaiseHand] = useState(true);
  const [shareNotes, setShareNotes] = useState(true);

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

  const handleStart = () => {
    const name = roomName.trim() || 'Study room';
    Alert.alert('Room ready', `${name} is ready to go live.`);
  };

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <View style={[styles.orb, { backgroundColor: Theme.brand.primary, opacity: 0.12, top: -110, right: -60 }]} />
      <View style={[styles.orb, { backgroundColor: Theme.brand.accent, opacity: 0.14, bottom: -140, left: -80 }]} />

      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: activeTheme.border }]}>
          <TouchableOpacity onPress={goBackToOrigin} style={[styles.headerIcon, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
            <Ionicons name="chevron-back" size={16} color={activeTheme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: activeTheme.text }]}>Start study room</Text>
          <TouchableOpacity style={[styles.headerIcon, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
            <Ionicons name="sparkles-outline" size={16} color={Theme.brand.primary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <LinearGradient colors={[Theme.brand.primary, '#4f46e5']} style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroIcon}>
              <Ionicons name="mic-outline" size={18} color="#FFFFFF" />
            </View>
            <View style={styles.heroBadges}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>Live audio</Text>
              </View>
              <View style={[styles.heroBadge, styles.heroBadgeAlt]}>
                <Text style={styles.heroBadgeText}>Focus ready</Text>
              </View>
            </View>
          </View>
          <Text style={styles.heroTitle}>Host a modern study room</Text>
          <Text style={styles.heroMeta}>Invite classmates, keep it focused, and go live in seconds.</Text>
        </LinearGradient>

        <View style={[styles.card, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
          <Text style={[styles.label, { color: activeTheme.textMuted }]}>Room name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: activeTheme.background, borderColor: activeTheme.border, color: activeTheme.text }]}
            placeholder="Calculus sprint"
            placeholderTextColor={activeTheme.textMuted}
            value={roomName}
            onChangeText={setRoomName}
          />

          <Text style={[styles.label, { color: activeTheme.textMuted }]}>Topic</Text>
          <TextInput
            style={[styles.input, { backgroundColor: activeTheme.background, borderColor: activeTheme.border, color: activeTheme.text }]}
            placeholder="Derivatives & integration"
            placeholderTextColor={activeTheme.textMuted}
            value={topic}
            onChangeText={setTopic}
          />

          <Text style={[styles.label, { color: activeTheme.textMuted }]}>Duration (mins)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: activeTheme.background, borderColor: activeTheme.border, color: activeTheme.text }]}
            placeholder="45"
            placeholderTextColor={activeTheme.textMuted}
            keyboardType="number-pad"
            value={duration}
            onChangeText={setDuration}
          />
        </View>

        <View style={[styles.card, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
          <Text style={[styles.label, { color: activeTheme.textMuted }]}>Room style</Text>
          <View style={styles.modeRow}>
            {ROOM_MODES.map((item) => {
              const active = mode === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setMode(item.id)}
                  style={[
                    styles.modeChip,
                    {
                      backgroundColor: active ? Theme.brand.primary : activeTheme.background,
                      borderColor: active ? Theme.brand.primary : activeTheme.border,
                    },
                  ]}
                >
                  <Ionicons name={item.icon} size={14} color={active ? '#FFFFFF' : activeTheme.textMuted} />
                  <Text style={[styles.modeText, { color: active ? '#FFFFFF' : activeTheme.text }]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
          <Text style={[styles.label, { color: activeTheme.textMuted }]}>Room controls</Text>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <View style={[styles.toggleIcon, { backgroundColor: activeTheme.background, borderColor: activeTheme.border }]}>
                <Ionicons name="mic-off-outline" size={16} color={activeTheme.textMuted} />
              </View>
              <Text style={[styles.toggleText, { color: activeTheme.text }]}>Mute on entry</Text>
            </View>
            <Switch
              value={muteOnEntry}
              onValueChange={setMuteOnEntry}
              trackColor={{ false: activeTheme.border, true: Theme.brand.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <View style={[styles.toggleIcon, { backgroundColor: activeTheme.background, borderColor: activeTheme.border }]}>
                <Ionicons name="hand-left-outline" size={16} color={activeTheme.textMuted} />
              </View>
              <Text style={[styles.toggleText, { color: activeTheme.text }]}>Allow raise hand</Text>
            </View>
            <Switch
              value={raiseHand}
              onValueChange={setRaiseHand}
              trackColor={{ false: activeTheme.border, true: Theme.brand.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <View style={[styles.toggleIcon, { backgroundColor: activeTheme.background, borderColor: activeTheme.border }]}>
                <Ionicons name="document-text-outline" size={16} color={activeTheme.textMuted} />
              </View>
              <Text style={[styles.toggleText, { color: activeTheme.text }]}>Shared notes</Text>
            </View>
            <Switch
              value={shareNotes}
              onValueChange={setShareNotes}
              trackColor={{ false: activeTheme.border, true: Theme.brand.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <TouchableOpacity onPress={handleStart} activeOpacity={0.9}>
          <LinearGradient colors={[Theme.brand.primary, '#4f46e5']} style={styles.primaryButton}>
            <Ionicons name="radio-outline" size={16} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Start room</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.secondaryButton, { borderColor: activeTheme.border }]} activeOpacity={0.9}>
          <Ionicons name="calendar-outline" size={16} color={activeTheme.text} />
          <Text style={[styles.secondaryButtonText, { color: activeTheme.text }]}>Schedule for later</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { backgroundColor: 'transparent' },
  orb: { position: 'absolute', width: 240, height: 240, borderRadius: 120 },
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
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  heroCard: { borderRadius: 24, padding: 18 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroIcon: { width: 38, height: 38, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  heroBadges: { flexDirection: 'row', gap: 8 },
  heroBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.18)' },
  heroBadgeAlt: { backgroundColor: 'rgba(255,255,255,0.28)' },
  heroBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  heroTitle: { marginTop: 12, color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  heroMeta: { marginTop: 6, color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' },
  card: { borderWidth: 1, borderRadius: 20, padding: 14, gap: 12 },
  label: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, height: 46, fontSize: 14, fontWeight: '600' },
  modeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  modeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1 },
  modeText: { fontSize: 13, fontWeight: '700' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  toggleIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  toggleText: { fontSize: 14, fontWeight: '600' },
  primaryButton: { height: 52, borderRadius: 28, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', letterSpacing: 0.4 },
  secondaryButton: { height: 50, borderRadius: 26, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  secondaryButtonText: { fontSize: 14, fontWeight: '700' },
});
