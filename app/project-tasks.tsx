import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Theme } from '../constants/Theme';
import { useAppTheme } from '../lib/theme';

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

function seedFromString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 100000;
  }
  return Math.abs(hash);
}

function buildProjectDetails(project: { id: string; title: string }): ProjectDetails {
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

export default function ProjectTasksScreen() {
  const { activeTheme } = useAppTheme();
  const params = useLocalSearchParams();
  const projectId = typeof params.id === 'string' ? params.id : 'project';
  const projectTitle = typeof params.title === 'string' ? params.title : 'Project';

  const baseDetails = useMemo(
    () => buildProjectDetails({ id: projectId, title: projectTitle }),
    [projectId, projectTitle]
  );

  const [tasks, setTasks] = useState<Task[]>(baseDetails.tasks);
  const progress = useMemo(() => getProgress(tasks), [tasks]);
  const completed = tasks.filter((task) => task.done).length;

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, done: !task.done } : task))
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={16} color={activeTheme.text} />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <Text style={[styles.headerTitle, { color: activeTheme.text }]}>Project Tasks</Text>
          </View>
        </View>
      </SafeAreaView>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={[styles.summaryCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
            <View style={styles.summaryTop}>
              <View>
                <Text style={[styles.summaryLabel, { color: activeTheme.textMuted }]}>Progress</Text>
                <Text style={[styles.summaryValue, { color: activeTheme.text }]}>{progress}%</Text>
              </View>
              <LinearGradient colors={Theme.brand.primaryGradient} style={styles.summaryPill}>
                <Text style={styles.summaryPillText}>
                  {completed}/{tasks.length} done
                </Text>
              </LinearGradient>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: activeTheme.border }]}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={[styles.summaryHint, { color: activeTheme.textMuted }]}>
              Tap a task to mark it complete.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.taskCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}
            onPress={() => toggleTask(item.id)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.taskCheck,
                {
                  borderColor: activeTheme.border,
                  backgroundColor: item.done ? Theme.brand.primary : 'transparent',
                },
              ]}
            >
              {item.done ? <Ionicons name="checkmark" size={12} color="#FFFFFF" /> : null}
            </View>
            <View style={styles.taskTextWrap}>
              <Text style={[styles.taskTitle, { color: activeTheme.text }]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[styles.taskMeta, { color: activeTheme.textMuted }]}>Due {item.due}</Text>
            </View>
            <View
              style={[
                styles.taskStatus,
                {
                  backgroundColor: item.done ? 'rgba(52,199,89,0.12)' : 'rgba(255,159,10,0.12)',
                  borderColor: item.done ? 'rgba(52,199,89,0.4)' : 'rgba(255,159,10,0.4)',
                },
              ]}
            >
              <Text
                style={[
                  styles.taskStatusText,
                  { color: item.done ? '#34C759' : '#FF9F0A' },
                ]}
              >
                {item.done ? 'Done' : 'Pending'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <View style={[styles.collabCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
            <Text style={[styles.collabTitle, { color: activeTheme.text }]}>Collaborators</Text>
            <View style={styles.collabRow}>
              {baseDetails.collaborators.map((collab, index) => (
                <View
                  key={collab.id}
                  style={[
                    styles.avatar,
                    {
                      backgroundColor: collab.color,
                      marginLeft: index === 0 ? 0 : -8,
                      borderColor: activeTheme.card,
                    },
                  ]}
                >
                  <Text style={styles.avatarText}>{getInitials(collab.name)}</Text>
                </View>
              ))}
            </View>
            <Text style={[styles.collabHint, { color: activeTheme.textMuted }]}>
              Keep everyone synced on progress.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { paddingHorizontal: 20, paddingTop: 6 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 10 },
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
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },

  summaryCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  summaryValue: { fontSize: 28, fontWeight: '900' },
  summaryPill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  summaryPillText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  progressTrack: { height: 6, borderRadius: 999, marginTop: 12, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999, backgroundColor: Theme.brand.primary },
  summaryHint: { marginTop: 10, fontSize: 12, fontWeight: '600' },

  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    gap: 10,
  },
  taskCheck: {
    width: 22,
    height: 22,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskTextWrap: { flex: 1 },
  taskTitle: { fontSize: 14, fontWeight: '700' },
  taskMeta: { fontSize: 12, fontWeight: '600', marginTop: 3 },
  taskStatus: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  taskStatusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },

  collabCard: {
    marginTop: 10,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  collabTitle: { fontSize: 14, fontWeight: '800', marginBottom: 10 },
  collabRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  collabHint: { marginTop: 10, fontSize: 12, fontWeight: '600' },
});
