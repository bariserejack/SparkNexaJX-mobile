import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { router, useNavigation } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { supabase } from '../../lib/supabase';
import { Theme } from '../../constants/Theme';
import { useAppTheme } from '../../lib/theme';
import { AppLogo } from '../../components/AppLogo';

type SignalStat = {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const SIGNAL_GRID: SignalStat[] = [
  { label: 'AMPs', value: '5.5K', icon: 'radio-outline' },
  { label: 'TUNED', value: '177', icon: 'headset-outline' },
  { label: 'PROJECTS', value: '24', icon: 'briefcase-outline' },
  { label: 'STREAK', value: '31d', icon: 'flame-outline' },
];

const NEURAL_SIGNALS = ['#ReactNative', '#Supabase', '#UIUX', '#NodeJS', '#SparkNexa'];

export default function ProfileScreen() {
  const { activeTheme, isDark } = useAppTheme();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [identityName, setIdentityName] = useState('Neural Builder');
  const [handle, setHandle] = useState('@sparknexa_node');

  useEffect(() => {
    loadIdentity();
  }, []);

  async function loadIdentity() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const fallbackName = user.email?.split('@')[0] || 'Neural Builder';
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      const fullName = profile?.full_name || fallbackName;
      setIdentityName(fullName);
      setHandle(`@${fullName.toLowerCase().replace(/\s+/g, '_')}`);
    } catch (error) {
      console.error('Failed to load identity:', error);
    } finally {
      setLoading(false);
    }
  }

  const openDrawer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const parent = (navigation as any).getParent?.();
    if (parent?.openDrawer) {
      parent.openDrawer();
      return;
    }
    if ((navigation as any).openDrawer) {
      (navigation as any).openDrawer();
    }
  };

  const availability = useMemo(() => 'Available in 02:14:39', []);

  if (loading) {
    return (
      <View style={[styles.loader, { backgroundColor: activeTheme.background }]}>
        <ActivityIndicator size="large" color={Theme.brand.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <View
        style={[
          styles.bgOrb,
          { top: -80, right: -90, backgroundColor: Theme.brand.primary, opacity: isDark ? 0.14 : 0.08 },
        ]}
      />
      <View
        style={[
          styles.bgOrb,
          { bottom: 70, left: -140, backgroundColor: Theme.brand.accent, opacity: isDark ? 0.14 : 0.08 },
        ]}
      />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={openDrawer} style={styles.topAction}>
            <Ionicons name="reorder-three-outline" size={24} color={activeTheme.text} />
          </TouchableOpacity>
          <View style={styles.topCenter}>
            <Text style={styles.topLabel}>IDENTITY NODE</Text>
            <Text style={[styles.topTitle, { color: activeTheme.text }]}>Profile</Text>
          </View>
          <TouchableOpacity style={styles.topAction} onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={21} color={activeTheme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={isDark ? ['#2a1f68', '#0d0f2d'] : ['#8c7dff', '#e5ddff']}
            style={styles.cover}
          >
            <View style={styles.coverOverlay} />
            <View style={styles.coverTopRow}>
              <View style={styles.notePill}>
                <Text style={styles.noteText}>Signal online</Text>
              </View>
              <View style={styles.coverActions}>
                <TouchableOpacity style={styles.coverEdit} onPress={() => router.push('/edit-profile')}>
                  <Ionicons name="create-outline" size={16} color={activeTheme.text} />
                  <View style={styles.coverIconAccent} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.coverMenu} onPress={() => router.push('/profile-settings')}>
                  <Ionicons name="ellipsis-horizontal" size={16} color={activeTheme.text} />
                  <View style={styles.coverIconAccent} />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>

          <BlurView
            intensity={isDark ? 28 : 65}
            tint={isDark ? 'dark' : 'light'}
            style={[styles.identityCard, { backgroundColor: activeTheme.cardElevated, borderColor: activeTheme.border }]}
          >
            <View style={styles.identityHead}>
              <View style={styles.profileAvatarWrap}>
                <AppLogo size={82} bordered />
                <TouchableOpacity style={[styles.profileAvatarEdit, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]} onPress={() => router.push('/edit-profile')}>
                  <Ionicons name="create-outline" size={14} color={activeTheme.text} />
                  <View style={styles.coverIconAccent} />
                </TouchableOpacity>
              </View>
              <View style={styles.identityMeta}>
                <Text style={[styles.identityName, { color: activeTheme.text }]}>{identityName}</Text>
                <Text style={[styles.identityHandle, { color: activeTheme.textMuted }]}>{handle}</Text>
                <Text style={[styles.bioTag, { color: Theme.brand.primary }]}>Neural Architect</Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.primaryAction}>
                <LinearGradient colors={Theme.brand.primaryGradient} style={styles.primaryGradient}>
                  <Ionicons name="radio-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.primaryActionText}>TUNE IN</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.secondaryAction, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
                <Ionicons name="flash-outline" size={18} color={activeTheme.text} />
                <Text style={[styles.secondaryActionText, { color: activeTheme.text }]}>PULSE</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.tertiaryAction, { borderColor: Theme.brand.primary }]}>
                <Ionicons name="briefcase-outline" size={18} color={Theme.brand.primary} />
              </TouchableOpacity>
            </View>
          </BlurView>

          <View style={[styles.presenceCard, { backgroundColor: activeTheme.cardElevated, borderColor: activeTheme.border }]}>
            <Text style={[styles.presenceLabel, { color: activeTheme.textMuted }]}>CURRENT FOCUS</Text>
            <Text style={[styles.presenceText, { color: activeTheme.text }]}>Building SparkNexa Identity Experience</Text>
            <View style={styles.availabilityRow}>
              <Ionicons name="time-outline" size={14} color={Theme.brand.primary} />
              <Text style={styles.availabilityText}>{availability}</Text>
            </View>
          </View>

          <View style={styles.grid}>
            {SIGNAL_GRID.map((item) => (
              <View
                key={item.label}
                style={[styles.gridItem, { backgroundColor: activeTheme.cardElevated, borderColor: activeTheme.border }]}
              >
                <Ionicons name={item.icon} size={16} color={Theme.brand.primary} />
                <Text style={[styles.gridValue, { color: activeTheme.text }]}>{item.value}</Text>
                <Text style={[styles.gridLabel, { color: activeTheme.textMuted }]}>{item.label}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.signalsCard, { backgroundColor: activeTheme.cardElevated, borderColor: activeTheme.border }]}>
            <Text style={[styles.sectionTitle, { color: activeTheme.text }]}>Neural Bio</Text>
            <View style={styles.signalWrap}>
              {NEURAL_SIGNALS.map((signal) => (
                <View key={signal} style={[styles.signalPill, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
                  <Text style={[styles.signalText, { color: activeTheme.text }]}>{signal}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: activeTheme.cardElevated, borderColor: activeTheme.border }]}>
            <Text style={[styles.sectionTitle, { color: activeTheme.text }]}>Identity Details</Text>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={18} color={activeTheme.textMuted} />
              <Text style={[styles.infoText, { color: activeTheme.text }]}>Uyo, Akwa Ibom, Nigeria</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="school-outline" size={18} color={activeTheme.textMuted} />
              <Text style={[styles.infoText, { color: activeTheme.text }]}>Computer Engineering</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="sparkles-outline" size={18} color={activeTheme.textMuted} />
              <Text style={[styles.infoText, { color: activeTheme.text }]}>Open for Collab Sessions</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={() => router.push('/auth/logout')}>
            <Ionicons name="log-out-outline" size={18} color="#FF3B30" />
            <Text style={styles.logoutText}>LOG OUT</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bgOrb: { position: 'absolute', width: 330, height: 330, borderRadius: 180 },
  topBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topAction: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topCenter: { alignItems: 'center' },
  topLabel: {
    color: Theme.brand.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  topTitle: {
    marginTop: 2,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  cover: {
    height: 180,
    borderRadius: 28,
    marginTop: 6,
    overflow: 'hidden',
    padding: 16,
    justifyContent: 'space-between',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  coverTopRow: {
    zIndex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coverActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  noteText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  coverEdit: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderColor: 'rgba(255,255,255,0.6)',
  },
  coverMenu: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderColor: 'rgba(255,255,255,0.6)',
  },
  coverIconAccent: {
    position: 'absolute',
    right: 2,
    top: 2,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Theme.brand.primary,
  },
  identityCard: {
    marginTop: -36,
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
  },
  identityHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  profileAvatarWrap: {
    position: 'relative',
    width: 82,
    height: 82,
  },
  profileAvatarEdit: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityMeta: { flex: 1 },
  identityName: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  identityHandle: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: '600',
  },
  bioTag: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  actionRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  primaryAction: {
    flex: 1.6,
    borderRadius: 16,
    overflow: 'hidden',
    height: 40,
  },
  primaryGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  secondaryAction: {
    flex: 1.3,
    height: 40,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryActionText: { fontWeight: '800', fontSize: 12 },
  tertiaryAction: {
    width: 40,
    height: 40,
    borderRadius: 16,
    borderWidth: 1.4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presenceCard: {
    marginTop: 16,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  presenceLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  presenceText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  availabilityRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  availabilityText: {
    color: Theme.brand.primary,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  grid: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  gridItem: {
    width: '48.5%',
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  gridValue: {
    marginTop: 10,
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  gridLabel: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  signalsCard: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  signalWrap: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  signalPill: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  signalText: {
    fontSize: 12,
    fontWeight: '700',
  },
  infoCard: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 18,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  logoutText: {
    color: '#FF3B30',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
  },
});
