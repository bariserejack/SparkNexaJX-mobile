import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { getNotifications, notificationsSupportedInRuntime } from '../lib/notifications';

import { Theme } from '../constants/Theme';
import { useAppTheme } from '../lib/theme';
import { apiUrl } from '../lib/api';

// Notification handler will be set when `expo-notifications` is loaded lazily.

type RepeatType = 'once' | 'daily';
type ReminderStatus = 'pending' | 'done' | 'missed' | 'cancelled';

type Reminder = {
  id: string;
  title: string;
  notes: string | null;
  scheduled_at: string;
  repeat_type: RepeatType;
  status: ReminderStatus;
  notification_id: string | null;
};

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

function todayString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function timeString() {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 5);
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function parseReminder(input: any): Reminder {
  return {
    id: String(input.id),
    title: String(input.title),
    notes: typeof input.notes === 'string' ? input.notes : null,
    scheduled_at: String(input.scheduled_at),
    repeat_type: (input.repeat_type === 'daily' ? 'daily' : 'once') as RepeatType,
    status: (input.status ?? 'pending') as ReminderStatus,
    notification_id: typeof input.notification_id === 'string' ? input.notification_id : null,
  };
}

function parseTime(timeValue: string): { hour: number; minute: number } | null {
  const match = timeValue.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return null;
  }
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }
  return { hour, minute };
}

function buildScheduleDate(dateValue: string, timeValue: string, repeatType: RepeatType): Date | null {
  const parsed = parseTime(timeValue);
  if (!parsed) {
    return null;
  }

  const now = new Date();

  if (repeatType === 'daily') {
    const next = new Date();
    next.setHours(parsed.hour, parsed.minute, 0, 0);
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
    return next;
  }

  const dateMatch = dateValue.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dateMatch) {
    return null;
  }

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]) - 1;
  const day = Number(dateMatch[3]);
  const schedule = new Date(year, month, day, parsed.hour, parsed.minute, 0, 0);
  if (Number.isNaN(schedule.valueOf())) {
    return null;
  }
  return schedule;
}

function formatSchedule(iso: string, repeatType: RepeatType) {
  const date = new Date(iso);
  if (Number.isNaN(date.valueOf())) {
    return '--';
  }
  if (repeatType === 'daily') {
    return `Daily at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusColor(status: ReminderStatus) {
  if (status === 'done') {
    return '#34C759';
  }
  if (status === 'missed') {
    return '#FF9F0A';
  }
  if (status === 'cancelled') {
    return '#8E8E93';
  }
  return Theme.brand.primary;
}

async function ensureNotificationPermission() {
  if (Platform.OS === 'web') {
    return false;
  }
  const Notifications = await getNotifications();
  if (!Notifications) {
    return false;
  }

  // set handler once when notifications is loaded
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch {
    // ignore if handler cannot be set in this environment
  }

  const current = await Notifications.getPermissionsAsync();
  let granted = current.status === 'granted';
  if (!granted) {
    const requested = await Notifications.requestPermissionsAsync();
    granted = requested.status === 'granted';
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily-reminders', {
      name: 'Daily Reminders',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }

  return granted;
}

async function scheduleReminderNotification(
  reminderTitle: string,
  reminderNotes: string | null,
  scheduleDate: Date,
  repeatType: RepeatType
) {
  if (Platform.OS === 'web') {
    return null;
  }
  const Notifications = await getNotifications();
  if (!Notifications) {
    return null;
  }

  const trigger =
    repeatType === 'daily'
      ? ({
          hour: scheduleDate.getHours(),
          minute: scheduleDate.getMinutes(),
          repeats: true,
          channelId: 'daily-reminders',
        } as any)
      : (scheduleDate as any);

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Daily Reminder',
      body: reminderNotes?.trim() ? `${reminderTitle} - ${reminderNotes}` : reminderTitle,
      sound: 'default',
    },
    trigger,
  });
}

export default function RemindersScreen() {
  const { activeTheme } = useAppTheme();
  const navigation = useNavigation();

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dateValue, setDateValue] = useState(todayString());
  const [timeValue, setTimeValue] = useState(timeString());
  const [repeatDaily, setRepeatDaily] = useState(false);

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

  const pendingCount = useMemo(
    () => reminders.filter((item) => item.status === 'pending').length,
    [reminders]
  );

  const fetchReminders = useCallback(async () => {
    try {
      const response = await fetch(apiUrl('/api/reminders'));
      const payload = (await response.json()) as ApiResponse<any[]>;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || 'Failed to fetch reminders');
      }
      setReminders((payload.data ?? []).map(parseReminder));
    } catch (error) {
      Alert.alert('Reminder Error', error instanceof Error ? error.message : 'Failed to load reminders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchReminders();
    void ensureNotificationPermission().then(setPermissionGranted).catch(() => setPermissionGranted(false));
  }, [fetchReminders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReminders();
    setRefreshing(false);
  }, [fetchReminders]);

  const onCreateReminder = useCallback(async () => {
    if (submitting) {
      return;
    }

    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
      Alert.alert('Missing Title', 'Enter what you want to do.');
      return;
    }

    const repeatType: RepeatType = repeatDaily ? 'daily' : 'once';
    const scheduleDate = buildScheduleDate(dateValue, timeValue, repeatType);
    if (!scheduleDate) {
      Alert.alert('Invalid Date/Time', 'Use date as YYYY-MM-DD and time as HH:MM (24h).');
      return;
    }

    if (repeatType === 'once' && scheduleDate <= new Date()) {
      Alert.alert('Invalid Schedule', 'Choose a future date and time.');
      return;
    }

    if (!permissionGranted) {
      const grantedNow = await ensureNotificationPermission();
      setPermissionGranted(grantedNow);
      if (!grantedNow) {
        if (!notificationsSupportedInRuntime()) {
          Alert.alert(
            'Development Build Required',
            'Expo Go on Android does not support this notifications flow. Press "s" in the Expo terminal and use a development build.'
          );
        } else {
          Alert.alert('Permission Needed', 'Notification permission is required to ring reminders.');
        }
        return;
      }
    }

    setSubmitting(true);
    let notificationId: string | null = null;

    try {
      notificationId = await scheduleReminderNotification(
        normalizedTitle,
        notes.trim() || null,
        scheduleDate,
        repeatType
      );

      const response = await fetch(apiUrl('/api/reminders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: normalizedTitle,
          notes: notes.trim() || null,
          scheduledAt: scheduleDate.toISOString(),
          repeatType,
          status: 'pending',
          notificationId,
        }),
      });

      const payload = (await response.json()) as ApiResponse<any>;
      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(payload.error || 'Failed to create reminder');
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTitle('');
      setNotes('');
      setDateValue(todayString());
      setTimeValue(timeString());
      setRepeatDaily(false);
      setReminders((prev) => [parseReminder(payload.data), ...prev]);
    } catch (error) {
      if (notificationId) {
        try {
          const Notifications = await getNotifications();
          await Notifications?.cancelScheduledNotificationAsync(notificationId).catch(() => undefined);
        } catch {
          // ignore
        }
      }
      Alert.alert('Create Failed', error instanceof Error ? error.message : 'Failed to create reminder');
    } finally {
      setSubmitting(false);
    }
  }, [dateValue, notes, permissionGranted, repeatDaily, submitting, timeValue, title]);

  const onToggleDone = useCallback(async (reminder: Reminder) => {
    const targetStatus: ReminderStatus = reminder.status === 'done' ? 'pending' : 'done';
    setProcessingId(reminder.id);

    try {
      const Notifications = await getNotifications();
      let notificationId = reminder.notification_id;

      if (targetStatus === 'done' && notificationId && Notifications) {
        await Notifications.cancelScheduledNotificationAsync(notificationId).catch(() => undefined);
        notificationId = null;
      }

      if (targetStatus === 'pending' && !notificationId) {
        const scheduleDate = new Date(reminder.scheduled_at);
        notificationId = await scheduleReminderNotification(
          reminder.title,
          reminder.notes,
          scheduleDate,
          reminder.repeat_type
        );
      }

      const response = await fetch(apiUrl(`/api/reminders/${reminder.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: targetStatus,
          notificationId,
        }),
      });

      const payload = (await response.json()) as ApiResponse<any>;
      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(payload.error || 'Failed to update reminder');
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const nextReminder = parseReminder(payload.data);
      setReminders((prev) => prev.map((item) => (item.id === nextReminder.id ? nextReminder : item)));
    } catch (error) {
      Alert.alert('Update Failed', error instanceof Error ? error.message : 'Failed to update reminder');
    } finally {
      setProcessingId(null);
    }
  }, []);

  const onDeleteReminder = useCallback((reminder: Reminder) => {
    Alert.alert('Delete Reminder', `Delete "${reminder.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setProcessingId(reminder.id);
          try {
            if (reminder.notification_id) {
              try {
                const Notifications = await getNotifications();
                await Notifications?.cancelScheduledNotificationAsync(reminder.notification_id).catch(() => undefined);
              } catch {
                // ignore
              }
            }

            const response = await fetch(apiUrl(`/api/reminders/${reminder.id}`), {
              method: 'DELETE',
            });

            const payload = (await response.json()) as ApiResponse<null>;
            if (!response.ok || !payload.ok) {
              throw new Error(payload.error || 'Failed to delete reminder');
            }

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            setReminders((prev) => prev.filter((item) => item.id !== reminder.id));
          } catch (error) {
            Alert.alert('Delete Failed', error instanceof Error ? error.message : 'Failed to delete reminder');
          } finally {
            setProcessingId(null);
          }
        },
      },
    ]);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={openDrawer} style={styles.topAction}>
            <Ionicons name="reorder-three-outline" size={16} color={activeTheme.text} />
          </TouchableOpacity>
          <View style={styles.topCenter}>
            <Text style={styles.topLabel}>DAILY PULSE</Text>
            <Text style={[styles.topTitle, { color: activeTheme.text }]}>Reminders</Text>
          </View>
          <View style={styles.topAction}>
            <Text style={[styles.pendingCount, { color: Theme.brand.primary }]}>{pendingCount}</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.brand.primary} />}
        >
          <View style={[styles.card, { backgroundColor: activeTheme.cardElevated, borderColor: activeTheme.border }]}>
            <Text style={[styles.cardTitle, { color: activeTheme.text }]}>Quick Add Reminder</Text>
            <Text style={[styles.cardHint, { color: activeTheme.textMuted }]}>
              Create a task with time. It will ring on this device when due.
            </Text>

            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="What do you want to do?"
              placeholderTextColor={activeTheme.textMuted}
              style={[styles.input, { color: activeTheme.text, borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}
            />

            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Note (optional)"
              placeholderTextColor={activeTheme.textMuted}
              style={[styles.input, { color: activeTheme.text, borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}
            />

            <View style={styles.row}>
              <TextInput
                value={dateValue}
                onChangeText={setDateValue}
                editable={!repeatDaily}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={activeTheme.textMuted}
                style={[
                  styles.input,
                  styles.halfInput,
                  {
                    color: activeTheme.text,
                    borderColor: activeTheme.border,
                    backgroundColor: activeTheme.card,
                    opacity: repeatDaily ? 0.55 : 1,
                  },
                ]}
              />
              <TextInput
                value={timeValue}
                onChangeText={setTimeValue}
                placeholder="HH:MM"
                placeholderTextColor={activeTheme.textMuted}
                style={[
                  styles.input,
                  styles.halfInput,
                  { color: activeTheme.text, borderColor: activeTheme.border, backgroundColor: activeTheme.card },
                ]}
              />
            </View>

            <View style={styles.repeatRow}>
              <Text style={[styles.repeatText, { color: activeTheme.text }]}>Repeat daily</Text>
              <Switch value={repeatDaily} onValueChange={setRepeatDaily} />
            </View>

            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: Theme.brand.primary, opacity: submitting ? 0.6 : 1 }]}
              onPress={onCreateReminder}
              disabled={submitting}
            >
              {submitting ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Ionicons name="alarm-outline" size={16} color="#FFFFFF" />}
              <Text style={styles.createButtonText}>Set Reminder</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.card, { backgroundColor: activeTheme.cardElevated, borderColor: activeTheme.border }]}>
            <Text style={[styles.cardTitle, { color: activeTheme.text }]}>Today & Upcoming</Text>

            {loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="small" color={Theme.brand.primary} />
              </View>
            ) : reminders.length === 0 ? (
              <Text style={[styles.emptyText, { color: activeTheme.textMuted }]}>No reminders yet.</Text>
            ) : (
              reminders.map((reminder) => (
                <View key={reminder.id} style={[styles.itemRow, { borderColor: activeTheme.border }]}>
                  <View style={styles.itemMain}>
                    <Text style={[styles.itemTitle, { color: activeTheme.text }]}>{reminder.title}</Text>
                    <Text style={[styles.itemMeta, { color: activeTheme.textMuted }]}>
                      {formatSchedule(reminder.scheduled_at, reminder.repeat_type)}
                    </Text>
                    <Text style={[styles.itemStatus, { color: statusColor(reminder.status) }]}>
                      {reminder.status.toUpperCase()}
                    </Text>
                  </View>

                  {processingId === reminder.id ? (
                    <ActivityIndicator size="small" color={Theme.brand.primary} />
                  ) : (
                    <View style={styles.itemActions}>
                      <TouchableOpacity
                        style={[
                          styles.smallBtn,
                          {
                            borderColor: activeTheme.border,
                            backgroundColor: activeTheme.card,
                          },
                        ]}
                        onPress={() => onToggleDone(reminder)}
                      >
                        <Ionicons
                          name={reminder.status === 'done' ? 'refresh-outline' : 'checkmark-outline'}
                          size={16}
                          color={Theme.brand.primary}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.smallBtn,
                          {
                            borderColor: activeTheme.border,
                            backgroundColor: activeTheme.card,
                          },
                        ]}
                        onPress={() => onDeleteReminder(reminder)}
                      >
                        <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>

          {!permissionGranted && (
            <View style={[styles.permissionBox, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
              <Ionicons name="notifications-off-outline" size={16} color="#FF9F0A" />
              <Text style={[styles.permissionText, { color: activeTheme.textMuted }]}>
                Notifications are off. Reminders will save but will not ring until permission is allowed.
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  pendingCount: {
    fontSize: 18,
    fontWeight: '900',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
    gap: 14,
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  cardHint: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  input: {
    marginTop: 10,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  repeatRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  repeatText: {
    fontSize: 14,
    fontWeight: '700',
  },
  createButton: {
    marginTop: 14,
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  loadingWrap: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  itemRow: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  itemMain: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  itemMeta: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  itemStatus: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  smallBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  permissionText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
});
