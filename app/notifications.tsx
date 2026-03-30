import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../constants/Theme';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '../lib/theme';
import { useDrawerBack } from '../lib/useDrawerBack';

const MOCK_NOTIFICATIONS = [
  { id: '1', title: 'File Uploaded', desc: 'Sarah uploaded "Final_Design.fig" to the Vault.', time: '2m ago', icon: 'cloud-upload', color: '#00D2FF', unread: true },
  { id: '2', title: 'New Message', desc: 'Marketing Team: "Have you seen the new stats?"', time: '15m ago', icon: 'chatbubble-ellipses', color: '#A259FF', unread: true },
  { id: '3', title: 'Project Milestone', desc: 'NexaSynthetic is now 80% complete.', time: '1h ago', icon: 'rocket', color: '#FFD700', unread: false },
  { id: '4', title: 'System Alert', desc: 'Your workspace backup was successful.', time: '3h ago', icon: 'shield-checkmark', color: '#4CAF50', unread: false },
];

export default function NotificationsScreen() {
  const { activeTheme } = useAppTheme();
  const handleBack = useDrawerBack();
  const unreadCount = MOCK_NOTIFICATIONS.filter((item) => item.unread).length;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderItem = ({ item, index }: { item: typeof MOCK_NOTIFICATIONS[0]; index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 90).duration(450)} layout={Layout.springify()}>
      <TouchableOpacity
        style={[
          styles.notificationCard,
          { backgroundColor: activeTheme.card, borderColor: item.unread ? item.color : activeTheme.border },
        ]}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        <View style={[styles.iconShell, { backgroundColor: `${item.color}1F` }]}>
          <Ionicons name={item.icon as any} size={16} color={item.color} />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.row}>
            <Text
              style={[
                styles.notifTitle,
                { color: activeTheme.text },
                item.unread && styles.notifTitleUnread,
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={[styles.timeText, { color: activeTheme.textMuted }]}>{item.time}</Text>
          </View>
          <Text style={[styles.notifDesc, { color: activeTheme.textMuted }]} numberOfLines={2}>
            {item.desc}
          </Text>
          {item.unread ? (
            <View style={styles.unreadFlag}>
              <View style={[styles.unreadDot, { backgroundColor: item.color }]} />
              <Text style={[styles.unreadText, { color: item.color }]}>New</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}
            onPress={handleBack}
          >
            <Ionicons name="chevron-back" size={16} color={activeTheme.text} />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <Text style={[styles.headerTitle, { color: activeTheme.text }]}>Notifications</Text>
          </View>

          <TouchableOpacity
            onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
            style={[styles.clearButton, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}
          >
            <Ionicons name="trash-outline" size={16} color={activeTheme.text} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <FlatList
        data={MOCK_NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={[styles.summaryCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: activeTheme.textMuted }]}>Unread</Text>
              {unreadCount > 0 ? (
                <LinearGradient colors={Theme.brand.primaryGradient} style={styles.unreadPill}>
                  <Text style={styles.unreadPillText}>{unreadCount}</Text>
                </LinearGradient>
              ) : (
                <View style={[styles.unreadPill, { backgroundColor: activeTheme.background, borderColor: activeTheme.border, borderWidth: 1 }]}>
                  <Text style={[styles.unreadPillText, { color: activeTheme.textMuted }]}>0</Text>
                </View>
              )}
            </View>
            <Text style={[styles.summaryHint, { color: activeTheme.textMuted }]}>Last 24 hours</Text>

            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionLabel, { color: activeTheme.textMuted }]}>Recent Activity</Text>
              <View style={[styles.sectionLine, { backgroundColor: activeTheme.border }]} />
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="sparkles-outline" size={16} color={activeTheme.textMuted} />
            <Text style={[styles.emptyText, { color: activeTheme.text }]}>You're all caught up</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { paddingHorizontal: 20, paddingTop: 6 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.4 },
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  summaryHint: { fontSize: 12, fontWeight: '600', marginTop: 6 },
  unreadPill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  unreadPillText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },

  listContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 100 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 12 },
  sectionLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  sectionLine: { flex: 1, height: 1, opacity: 0.7 },

  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 22,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
  },
  iconShell: { width: 46, height: 46, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  textContainer: { flex: 1, marginLeft: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 8 },
  notifTitle: { fontWeight: '700', fontSize: 15, flexShrink: 1 },
  notifTitleUnread: { fontWeight: '900' },
  timeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  notifDesc: { fontSize: 13, lineHeight: 19, fontWeight: '600' },
  unreadFlag: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  unreadDot: { width: 6, height: 6, borderRadius: 3 },
  unreadText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },

  emptyState: {
    alignItems: 'center',
    marginTop: 100,
    opacity: 0.5,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 14,
    fontWeight: '600',
  },
});
