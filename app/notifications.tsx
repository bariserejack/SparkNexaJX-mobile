import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../constants/Theme';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '../lib/theme';

const MOCK_NOTIFICATIONS = [
  { id: '1', title: 'File Uploaded', desc: 'Sarah uploaded "Final_Design.fig" to the Vault.', time: '2m ago', icon: 'cloud-upload', color: '#00D2FF', unread: true },
  { id: '2', title: 'New Message', desc: 'Marketing Team: "Have you seen the new stats?"', time: '15m ago', icon: 'chatbubble-ellipses', color: '#A259FF', unread: true },
  { id: '3', title: 'Project Milestone', desc: 'NexaSynthetic is now 80% complete.', time: '1h ago', icon: 'rocket', color: '#FFD700', unread: false },
  { id: '4', title: 'System Alert', desc: 'Your workspace backup was successful.', time: '3h ago', icon: 'shield-checkmark', color: '#4CAF50', unread: false },
];

export default function NotificationsScreen() {
  const { activeTheme, isDark } = useAppTheme();
  
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderItem = ({ item, index }: { item: typeof MOCK_NOTIFICATIONS[0], index: number }) => (
    <Animated.View 
      entering={FadeInUp.delay(index * 100).duration(600)} 
      layout={Layout.springify()}
    >
      <TouchableOpacity 
        style={[
          styles.notificationCard, 
          { backgroundColor: activeTheme.card, borderColor: activeTheme.border },
          item.unread && { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(115, 103, 240, 0.08)' }
        ]}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        {/* Unread Indicator Bar */}
        {item.unread && <View style={[styles.unreadBar, { backgroundColor: item.color }]} />}
        
        <View style={[styles.iconBg, { backgroundColor: item.color + '15' }]}>
          <Ionicons name={item.icon as any} size={16} color={item.color} />
        </View>
        
          <View style={styles.textContainer}>
            <View style={styles.row}>
            <Text style={[styles.notifTitle, { color: activeTheme.text }]}>{item.title}</Text>
            <Text style={[styles.notifTime, { color: activeTheme.textMuted }]}>{item.time}</Text>
          </View>
          <Text style={[styles.notifDesc, { color: activeTheme.textMuted }]} numberOfLines={2}>
            {item.desc}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={isDark ? ['#0F172A', '#020617'] : ['#FFFFFF', '#F1F5F9']}
        style={styles.container}
      >
        
        {/* 1. Header with Glassmorphism */}
        <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={[styles.headerContainer, { borderColor: activeTheme.border }]}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.headerSubtitle}>SYSTEM UPDATES</Text>
                <Text style={[styles.headerTitle, { color: activeTheme.text }]}>Spark Feed</Text>
              </View>
              <TouchableOpacity onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}>
                <Text style={[styles.clearAll, { color: activeTheme.textMuted }]}>Clear All</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </BlurView>

        {/* 2. List Body */}
        <FlatList
          data={MOCK_NOTIFICATIONS}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionLabel, { color: activeTheme.textMuted }]}>Recent Activity</Text>
              <View style={styles.badge}><Text style={[styles.badgeText, { color: '#FFFFFF' }]}>2 NEW</Text></View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="sparkles-outline" size={16} color={activeTheme.textMuted} />
              <Text style={[styles.emptyText, { color: activeTheme.text }]}>You're all caught up</Text>
            </View>
          }
        />

        {/* Floating Back Button (Modern Pattern) */}
        <TouchableOpacity 
          style={styles.floatingBack} 
          onPress={() => router.back()}
        >
          <BlurView intensity={50} tint={isDark ? 'dark' : 'light'} style={[styles.backBlur, { borderColor: activeTheme.border }]}>
            <Ionicons name="chevron-back" size={16} color={activeTheme.text} />
          </BlurView>
        </TouchableOpacity>

      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  // Header
  headerContainer: {
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 25,
    paddingTop: 10,
  },
  headerSubtitle: { color: Theme.brand.primary, fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 4 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#FFF' },
  clearAll: { color: '#64748B', fontSize: 13, fontWeight: '700' },

  // List
  listContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
  sectionLabel: { color: '#64748B', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  badge: { backgroundColor: Theme.brand.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { color: '#000', fontSize: 9, fontWeight: '900' },

  // Cards
  notificationCard: { 
    flexDirection: 'row', 
    padding: 18, 
    borderRadius: 24, 
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    // Depth instead of borders
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  unreadBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  iconBg: { width: 48, height: 48, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  textContainer: { flex: 1, marginLeft: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  notifTitle: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  notifTime: { color: '#475569', fontSize: 11, fontWeight: '600' },
  notifDesc: { color: '#94A3B8', fontSize: 14, lineHeight: 20 },

  // Floating Back
  floatingBack: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    zIndex: 20,
  },
  backBlur: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  emptyState: {
    alignItems: 'center',
    marginTop: 100,
    opacity: 0.5
  },
  emptyText: {
    color: '#FFF',
    marginTop: 15,
    fontSize: 14,
    fontWeight: '600'
  }
});
