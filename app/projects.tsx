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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
import { useDrawerBack } from '../lib/useDrawerBack';

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

type Task = {
  id: string;
  title: string;
  done: boolean;
  due: string;
};

type Collaborator = {
  id: string;
  name: string;
  role: string;
  color: string;
};

type ProjectDetails = {
  tasks: Task[];
  collaborators: Collaborator[];
};

const STATUS_FLOW = ['building', 'active', 'blocked', 'done'];

const STATUS_META: Record<string, { color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  building: { color: '#00AEEF', icon: 'build-outline' },
  active: { color: '#34C759', icon: 'pulse-outline' },
  blocked: { color: '#FF9F0A', icon: 'alert-circle-outline' },
  done: { color: '#8E8E93', icon: 'checkmark-circle-outline' },
};

const TASK_LIBRARY = [
  'Scope requirements',
  'Design wireframes',
  'API endpoints',
  'Integrate auth',
  'QA pass',
  'Deploy build',
  'Feedback review',
  'Docs & onboarding',
];

const DUE_LABELS = ['Today', 'Tomorrow', 'Fri', 'Mon', 'Next wk'];

const COLLAB_LIBRARY: Collaborator[] = [
  { id: 'c1', name: 'Amaka Dan', role: 'Design', color: '#7C3AED' },
  { id: 'c2', name: 'Jonas Lee', role: 'Backend', color: '#2563EB' },
  { id: 'c3', name: 'Ruth K.', role: 'Research', color: '#F97316' },
  { id: 'c4', name: 'Tari M.', role: 'QA', color: '#10B981' },
  { id: 'c5', name: 'Maya C.', role: 'Product', color: '#EC4899' },
  { id: 'c6', name: 'Dara F.', role: 'Mobile', color: '#0EA5E9' },
];

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

function seedFromString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 100000;
  }
  return Math.abs(hash);
}

function buildProjectDetails(project: Project): ProjectDetails {
  const seed = seedFromString(`${project.id}-${project.title}`);
  const taskCount = 3 + (seed % 3);
  const collabCount = 2 + (seed % 3);

  const tasks: Task[] = Array.from({ length: taskCount }).map((_, index) => ({
    id: `${project.id}-task-${index}`,
    title: TASK_LIBRARY[(seed + index) % TASK_LIBRARY.length],
    due: DUE_LABELS[(seed + index) % DUE_LABELS.length],
    done: (seed + index) % 3 === 0,
  }));

  const collaborators: Collaborator[] = Array.from({ length: collabCount }).map((_, index) => {
    const base = COLLAB_LIBRARY[(seed + index) % COLLAB_LIBRARY.length];
    return { ...base, id: `${project.id}-${base.id}` };
  });

  return { tasks, collaborators };
}

function getProgress(tasks: Task[]) {
  if (tasks.length === 0) {
    return 0;
  }
  const completed = tasks.filter((task) => task.done).length;
  return Math.round((completed / tasks.length) * 100);
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function ProjectTaskTile({
  project,
  index,
  theme,
  details,
  updatingId,
  deletingId,
  onCycleStatus,
  onDelete,
  onOpenTasks,
  onToggleTask,
}: {
  project: Project;
  index: number;
  theme: ThemeColors;
  details?: ProjectDetails;
  updatingId: string | null;
  deletingId: string | null;
  onCycleStatus: (project: Project) => void;
  onDelete: (project: Project) => void;
  onOpenTasks: (project: Project) => void;
  onToggleTask: (projectId: string, taskId: string) => void;
}) {
  const meta = getStatusMeta(project.status);
  const isUpdating = updatingId === project.id;
  const isDeleting = deletingId === project.id;
  const tasks = details?.tasks ?? [];
  const collaborators = details?.collaborators ?? [];
  const progress = getProgress(tasks);
  const collabSummary = collaborators
    .slice(0, 3)
    .map((collab) => collab.name.split(' ')[0])
    .join(', ');
  const collabOverflow = collaborators.length > 3 ? ` +${collaborators.length - 3} more` : '';

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
        <View style={styles.tileHeaderRow}>
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
          <View style={[styles.statusChip, { borderColor: meta.color }]}>
            {isUpdating || isDeleting ? (
              <ActivityIndicator size="small" color={meta.color} />
            ) : (
              <Text style={[styles.statusChipText, { color: meta.color }]}>{project.status}</Text>
            )}
          </View>
        </View>

        <View style={styles.progressRow}>
          <Text style={[styles.progressLabel, { color: theme.textMuted }]}>Progress</Text>
          <Text style={[styles.progressValue, { color: meta.color }]}>{progress}%</Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
          <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: meta.color }]} />
        </View>

        <View style={styles.tasksWrap}>
          {tasks.slice(0, 3).map((task) => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskRow}
              onPress={() => onToggleTask(project.id, task.id)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.taskCheck,
                  {
                    borderColor: theme.border,
                    backgroundColor: task.done ? meta.color : 'transparent',
                  },
                ]}
              >
                {task.done ? <Ionicons name="checkmark" size={10} color="#FFFFFF" /> : null}
              </View>
              <Text
                style={[
                  styles.taskText,
                  { color: theme.text },
                  task.done && styles.taskTextDone,
                ]}
                numberOfLines={1}
              >
                {task.title}
              </Text>
              <Text style={[styles.taskDue, { color: theme.textMuted }]}>{task.due}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.collabRow}>
          <Text style={[styles.collabLabel, { color: theme.textMuted }]}>Collaborators</Text>
          <View style={styles.collabStack}>
            {collaborators.slice(0, 3).map((collab, collabIndex) => (
              <View
                key={collab.id}
                style={[
                  styles.avatar,
                  {
                    backgroundColor: collab.color,
                    marginLeft: collabIndex === 0 ? 0 : -8,
                    borderColor: theme.card,
                  },
                ]}
              >
                <Text style={styles.avatarText}>{getInitials(collab.name)}</Text>
              </View>
            ))}
            {collaborators.length > 3 ? (
              <View style={[styles.avatarMore, { backgroundColor: theme.border }]}>
                <Text style={[styles.avatarMoreText, { color: theme.textMuted }]}>
                  +{collaborators.length - 3}
                </Text>
              </View>
            ) : null}
          </View>
          <Text style={[styles.collabText, { color: theme.textMuted }]}>
            {collabSummary}
            {collabOverflow}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.viewTasksBtn, { borderColor: theme.border, backgroundColor: theme.card }]}
          onPress={() => onOpenTasks(project)}
          activeOpacity={0.8}
        >
          <Ionicons name="list-outline" size={16} color={meta.color} />
          <Text style={[styles.viewTasksText, { color: theme.text }]}>
            View all tasks ({tasks.length})
          </Text>
          <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function ProjectScreen() {
  const { activeTheme, isDark } = useAppTheme();
  const primaryColor = Theme.brand.primary;
  const handleBack = useDrawerBack();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [projectDetails, setProjectDetails] = useState<Record<string, ProjectDetails>>({});

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

  useEffect(() => {
    setProjectDetails((prev) => {
      const next = { ...prev };
      const ids = new Set(projects.map((project) => project.id));
      Object.keys(next).forEach((id) => {
        if (!ids.has(id)) {
          delete next[id];
        }
      });
      projects.forEach((project) => {
        if (!next[project.id]) {
          next[project.id] = buildProjectDetails(project);
        }
      });
      return next;
    });
  }, [projects]);

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

  const onToggleTask = useCallback((projectId: string, taskId: string) => {
    setProjectDetails((prev) => {
      const current = prev[projectId];
      if (!current) {
        return prev;
      }
      const tasks = current.tasks.map((task) =>
        task.id === taskId ? { ...task, done: !task.done } : task
      );
      return { ...prev, [projectId]: { ...current, tasks } };
    });
  }, []);

  const onOpenTasks = useCallback((project: Project) => {
    router.push({
      pathname: '/project-tasks',
      params: { id: project.id, title: project.title },
    });
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

      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}
            onPress={handleBack}
          >
            <Ionicons name="chevron-back" size={16} color={activeTheme.text} />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <Text style={[styles.headerTitle, { color: activeTheme.text }]}>Projects</Text>
          </View>

          <TouchableOpacity
            style={[styles.headerAction, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}
            onPress={onCreateProject}
            disabled={creating}
          >
            {creating ? (
              <ActivityIndicator size="small" color={Theme.brand.primary} />
            ) : (
              <Ionicons name="add" size={16} color={Theme.brand.primary} />
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.brand.primary} />
        }
      >
        <Animated.View
          entering={FadeInDown.duration(650)}
          style={[styles.heroCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}
        >
          <View style={styles.heroTop}>
            <View style={[styles.heroIcon, { backgroundColor: `${primaryColor}1A` }]}>
              <Ionicons name="rocket" size={16} color={primaryColor} />
            </View>
            <View style={styles.heroTextWrap}>
              <Text style={[styles.heroTitle, { color: activeTheme.text }]}>Mission Control</Text>
            </View>
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
              <Text style={styles.statusText}>ACTIVE</Text>
            </View>
          </View>

          <View style={[styles.statsRow, { borderTopColor: activeTheme.border }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: activeTheme.text }]}>{stats.active}</Text>
              <Text style={[styles.statLabel, { color: activeTheme.textMuted }]}>Active</Text>
            </View>
            <View style={[styles.statDivider, { borderColor: activeTheme.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: primaryColor }]}>{stats.velocity}%</Text>
              <Text style={[styles.statLabel, { color: activeTheme.textMuted }]}>Velocity</Text>
            </View>
            <View style={[styles.statDivider, { borderColor: activeTheme.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: activeTheme.text }]}>{stats.done}</Text>
              <Text style={[styles.statLabel, { color: activeTheme.textMuted }]}>Done</Text>
            </View>
          </View>

          <Text style={[styles.apiText, { color: activeTheme.textMuted }]}>API: {API_BASE_URL}</Text>
        </Animated.View>

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
                details={projectDetails[project.id]}
                updatingId={updatingId}
                deletingId={deletingId}
                onCycleStatus={onCycleStatus}
                onDelete={onDeleteProject}
                onOpenTasks={onOpenTasks}
                onToggleTask={onToggleTask}
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

        <View style={styles.versionTag}>
          <Text style={[styles.versionText, { color: activeTheme.textMuted }]}>PROTOCOL V.2.7.0</Text>
        </View>
      </ScrollView>
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
  safeArea: {
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  headerBar: {
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
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  heroCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    marginBottom: 26,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextWrap: { flex: 1 },
  heroTitle: { fontSize: 18, fontWeight: '900' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
    marginRight: 6,
  },
  statusText: {
    color: '#34C759',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  statsRow: {
    marginTop: 16,
    borderTopWidth: 1,
    paddingTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 36,
    borderLeftWidth: 1,
    opacity: 0.6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  apiText: {
    marginTop: 12,
    fontSize: 11,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
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
    padding: 16,
    borderRadius: 22,
    marginBottom: 14,
    borderWidth: 1,
  },
  tileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
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
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  tasksWrap: {
    marginTop: 12,
    gap: 8,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskCheck: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  taskTextDone: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  taskDue: {
    fontSize: 11,
    fontWeight: '600',
  },
  collabRow: {
    marginTop: 12,
    gap: 6,
  },
  collabLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  collabStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  avatarMore: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  avatarMoreText: {
    fontSize: 10,
    fontWeight: '800',
  },
  collabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  viewTasksBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewTasksText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
  },
  actionBtn: {
    marginHorizontal: 20,
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
  versionTag: {
    alignItems: 'center',
    marginTop: 18,
  },
  versionText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 3,
    opacity: 0.8,
  },
});
