import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Theme } from '../constants/Theme';
import { useAppTheme } from '../lib/theme';
import { API_BASE_URL, apiUrl } from '../lib/api';

const { width } = Dimensions.get('window');

type Project = {
  id: string;
  title: string;
  status: string;
  created_at: string;
};

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

const STATUS_FLOW = ['building', 'active', 'blocked', 'done'];

const STATUS_META: Record<string, { color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  building: { color: '#00AEEF', icon: 'build-outline' },
  active: { color: '#34C759', icon: 'pulse-outline' },
  blocked: { color: '#FF9F0A', icon: 'alert-circle-outline' },
  done: { color: '#8E8E93', icon: 'checkmark-circle-outline' },
};

type ThemeColors = {
  card: string;
  text: string;
  textMuted: string;
  border: string;
};

function getStatusMeta(status: string) {
  return STATUS_META[status] ?? { color: Theme.brand.primary, icon: 'layers-outline' as const };
}

function toProject(input: any): Project {
  return {
    id: String(input.id),
    title: String(input.title),
    status: String(input.status ?? 'active').toLowerCase(),
    created_at: String(input.created_at ?? ''),
  };
}

function nextStatus(current: string) {
  const index = STATUS_FLOW.indexOf(current);
  if (index < 0) {
    return STATUS_FLOW[0];
  }
  return STATUS_FLOW[(index + 1) % STATUS_FLOW.length];
}

function formatPhase(status: string) {
  return `Phase: ${status.charAt(0).toUpperCase()}${status.slice(1)}`;
}

function formatDate(iso: string) {
  if (!iso) {
    return '';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.valueOf())) {
    return '';
  }
  return date.toLocaleDateString();
}

function ProjectTaskTile({
  project,
  index,
  theme,
  isDark,
  updatingId,
  deletingId,
  onCycleStatus,
  onDelete,
}: {
  project: Project;
  index: number;
  theme: ThemeColors;
  isDark: boolean;
  updatingId: string | null;
  deletingId: string | null;
  onCycleStatus: (project: Project) => void;
  onDelete: (project: Project) => void;
}) {
  const meta = getStatusMeta(project.status);
  const isUpdating = updatingId === project.id;
  const isDeleting = deletingId === project.id;

  return (
    <Animated.View entering={FadeInDown.delay(index * 80)}>
      <TouchableOpacity
        style={[
          styles.tile,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
          },
        ]}
        onPress={() => onCycleStatus(project)}
        onLongPress={() => onDelete(project)}
        activeOpacity={0.78}
      >
        <View style={[styles.iconBox, { backgroundColor: `${meta.color}18` }]}>
          <Ionicons name={meta.icon} size={16} color={meta.color} />
        </View>
        <View style={styles.tileContent}>
          <Text style={[styles.tileLabel, { color: theme.text }]}>{project.title}</Text>
          <View style={styles.subRow}>
            <View style={[styles.miniIndicator, { backgroundColor: meta.color }]} />
            <Text style={[styles.tileSub, { color: theme.textMuted }]}>
              {formatPhase(project.status)} {formatDate(project.created_at)}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.chevronBg,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.05)',
            },
          ]}
        >
          {isUpdating || isDeleting ? (
            <ActivityIndicator size="small" color={meta.color} />
          ) : (
            <Ionicons name="chevron-forward" size={16} color={meta.color} />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function ProjectScreen() {
  const { activeTheme, isDark } = useAppTheme();
  const primaryColor = Theme.brand.primary;

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const dotOpacity = useSharedValue(1);

  const stats = useMemo(() => {
    const active = projects.filter((item) => item.status !== 'done').length;
    const done = projects.filter((item) => item.status === 'done').length;
    const velocity = projects.length ? Math.round((done / projects.length) * 100) : 0;
    return { active, done, velocity };
  }, [projects]);

  useEffect(() => {
    dotOpacity.value = withRepeat(
      withSequence(withTiming(0.35, { duration: 800 }), withTiming(1, { duration: 800 })),
      -1,
      true
    );
  }, [dotOpacity]);

  useEffect(() => {
    void fetchProjects();
  }, []);

  const animatedDotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
  }));

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch(apiUrl('/api/projects'));
      const payload = (await response.json()) as ApiResponse<any[]>;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || 'Failed to load projects');
      }
      setProjects((payload.data ?? []).map(toProject));
    } catch (error) {
      Alert.alert('Projects Error', error instanceof Error ? error.message : 'Unknown fetch error');
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProjects();
    setRefreshing(false);
  }, [fetchProjects]);

  const onCreateProject = useCallback(async () => {
    if (creating) {
      return;
    }
    setCreating(true);
    try {
      const title = `Build ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      const response = await fetch(apiUrl('/api/projects'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, status: 'building' }),
      });

      const payload = (await response.json()) as ApiResponse<any>;
      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(payload.error || 'Failed to create project');
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setProjects((prev) => [toProject(payload.data), ...prev]);
    } catch (error) {
      Alert.alert('Create Error', error instanceof Error ? error.message : 'Unknown create error');
    } finally {
      setCreating(false);
    }
  }, [creating]);

  const onCycleStatus = useCallback(async (project: Project) => {
    const newStatus = nextStatus(project.status);
    setUpdatingId(project.id);
    try {
      const response = await fetch(apiUrl(`/api/projects/${project.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const payload = (await response.json()) as ApiResponse<any>;
      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(payload.error || 'Failed to update project');
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const updated = toProject(payload.data);
      setProjects((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (error) {
      Alert.alert('Update Error', error instanceof Error ? error.message : 'Unknown update error');
    } finally {
      setUpdatingId(null);
    }
  }, []);

  const onDeleteProject = useCallback((project: Project) => {
    Alert.alert('Delete Project', `Remove "${project.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeletingId(project.id);
          try {
            const response = await fetch(apiUrl(`/api/projects/${project.id}`), { method: 'DELETE' });
            const payload = (await response.json()) as ApiResponse<null>;
            if (!response.ok || !payload.ok) {
              throw new Error(payload.error || 'Failed to delete project');
            }

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            setProjects((prev) => prev.filter((item) => item.id !== project.id));
          } catch (error) {
            Alert.alert('Delete Error', error instanceof Error ? error.message : 'Unknown delete error');
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View
        style={[
          styles.topGlow,
          {
            backgroundColor: primaryColor,
            opacity: isDark ? 0.16 : 0.1,
          },
        ]}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.brand.primary} />
        }
      >
        <View style={styles.header}>
          <Animated.View entering={FadeInDown.duration(700)}>
            <LinearGradient
              colors={isDark ? [primaryColor, '#5A4CD7'] : [primaryColor, '#A79EFF']}
              style={styles.projectGlow}
            >
              <View style={[styles.headerInner, { backgroundColor: activeTheme.background }]}>
                <Ionicons name="rocket-sharp" size={16} color={activeTheme.text} />
              </View>
            </LinearGradient>
          </Animated.View>

          <Text style={[styles.mainTitle, { color: activeTheme.text }]}>Mission Control</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: isDark ? 'rgba(52,199,89,0.1)' : 'rgba(52,199,89,0.12)',
                borderColor: isDark ? 'rgba(52,199,89,0.24)' : 'rgba(52,199,89,0.35)',
              },
            ]}
          >
            <Animated.View style={[styles.statusDot, animatedDotStyle]} />
            <Text style={styles.statusText}>SYSTEMS: ACTIVE</Text>
          </View>
          <Text style={[styles.apiText, { color: activeTheme.textMuted }]}>API: {API_BASE_URL}</Text>
        </View>

        <BlurView intensity={isDark ? 20 : 60} tint={isDark ? 'dark' : 'light'} style={styles.statsBlur}>
          <View
            style={[
              styles.statsContainer,
              {
                backgroundColor: activeTheme.card,
                borderColor: activeTheme.border,
              },
            ]}
          >
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: activeTheme.text }]}>{stats.active}</Text>
              <Text style={[styles.statLabel, { color: activeTheme.textMuted }]}>Active</Text>
            </View>
            <View style={[styles.statItem, styles.statBorder, { borderColor: activeTheme.border }]}>
              <Text style={[styles.statValue, { color: primaryColor }]}>{stats.velocity}%</Text>
              <Text style={[styles.statLabel, { color: activeTheme.textMuted }]}>Velocity</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: activeTheme.text }]}>{stats.done}</Text>
              <Text style={[styles.statLabel, { color: activeTheme.textMuted }]}>Done</Text>
            </View>
          </View>
        </BlurView>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: activeTheme.textMuted }]}>Current Roadmap</Text>
            <View style={[styles.roadmapLine, { backgroundColor: activeTheme.border }]} />
          </View>

          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" color={Theme.brand.primary} />
            </View>
          ) : projects.length === 0 ? (
            <View style={[styles.emptyState, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
              <Ionicons name="file-tray-outline" size={16} color={activeTheme.textMuted} />
              <Text style={[styles.emptyText, { color: activeTheme.textMuted }]}>
                No projects yet. Tap initialize to create one.
              </Text>
            </View>
          ) : (
            projects.map((project, index) => (
              <ProjectTaskTile
                key={project.id}
                project={project}
                index={index}
                theme={activeTheme}
                isDark={isDark}
                updatingId={updatingId}
                deletingId={deletingId}
                onCycleStatus={onCycleStatus}
                onDelete={onDeleteProject}
              />
            ))
          )}
        </View>

        <TouchableOpacity style={styles.actionBtn} onPress={onCreateProject} disabled={creating}>
          <LinearGradient
            colors={isDark ? [primaryColor, '#5A4CD7'] : [primaryColor, '#9388FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.btnGradient}
          >
            {creating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="add" size={16} color="#FFFFFF" />
            )}
            <Text style={styles.actionBtnText}>INITIALIZE NEW BUILD</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footerBranding}>
        <BlurView intensity={isDark ? 20 : 50} tint={isDark ? 'dark' : 'light'} style={styles.versionBlur}>
          <View
            style={[
              styles.versionBadge,
              {
                backgroundColor: activeTheme.card,
                borderColor: activeTheme.border,
              },
            ]}
          >
            <Text style={[styles.versionText, { color: activeTheme.textMuted }]}>PROTOCOL V.2.7.0</Text>
          </View>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topGlow: {
    position: 'absolute',
    top: -95,
    alignSelf: 'center',
    width,
    height: 240,
    borderRadius: 120,
  },
  scrollContent: {
    paddingBottom: 160,
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    marginBottom: 35,
  },
  projectGlow: {
    width: 92,
    height: 92,
    borderRadius: 30,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '45deg' }],
  },
  headerInner: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-45deg' }],
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '900',
    marginTop: 24,
    letterSpacing: -1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 15,
    borderWidth: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
    marginRight: 10,
  },
  statusText: {
    color: '#34C759',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  apiText: {
    marginTop: 10,
    fontSize: 11,
    fontWeight: '700',
  },
  statsBlur: {
    marginHorizontal: 24,
    borderRadius: 28,
    overflow: 'hidden',
  },
  statsContainer: {
    flexDirection: 'row',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 6,
    textTransform: 'uppercase',
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  roadmapLine: {
    flex: 1,
    height: 1,
  },
  loadingWrap: {
    paddingVertical: 28,
    alignItems: 'center',
  },
  emptyState: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emptyText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 24,
    marginBottom: 14,
    borderWidth: 1,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  tileContent: {
    flex: 1,
  },
  tileLabel: {
    fontSize: 16,
    fontWeight: '800',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  miniIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
    opacity: 0.85,
  },
  tileSub: {
    fontSize: 13,
    fontWeight: '600',
  },
  chevronBg: {
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtn: {
    marginHorizontal: 24,
    marginTop: 14,
  },
  btnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 20,
    gap: 8,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  footerBranding: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 44 : 36,
    width: '100%',
    alignItems: 'center',
  },
  versionBlur: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  versionBadge: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
  },
  versionText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 3,
    opacity: 0.8,
  },
});
