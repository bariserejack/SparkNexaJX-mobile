import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { Theme } from '../constants/Theme';
import { useAppTheme } from '../lib/theme';

type CollectiveVariant = 'group' | 'community';

const TYPE_OPTIONS = ['Study Group', 'Class Hub', 'Interest Club', 'Project Team'] as const;
const CATEGORY_OPTIONS = ['Math', 'Science', 'Languages', 'Test Prep', 'Coding', 'Arts', 'Career'] as const;
const LANGUAGE_OPTIONS = ['English', 'Spanish', 'Mandarin', 'French', 'Arabic'] as const;
const ACADEMIC_LEVELS = ['Middle School', 'High School', 'Undergraduate', 'Graduate', 'Professional', 'Lifelong'] as const;
const LEARNING_GOALS = ['Exam prep', 'Skill building', 'Homework help', 'Project work', 'Language practice'] as const;
const MEMBER_LIMITS = ['10', '25', '50', '100', 'Unlimited'] as const;
const MEMBER_ROLES = ['Learner', 'Contributor', 'Observer'] as const;
const LEADERSHIP_OPTIONS = ['Single admin', 'Co-hosts', 'Rotating moderators'] as const;
const JOIN_REQUIREMENTS = ['None', 'Answer a question', 'Quick quiz', 'Verified email'] as const;
const DISCOVERABILITY_OPTIONS = ['Public', 'Unlisted', 'Private'] as const;
const VISIBLE_TO_OPTIONS = ['Everyone', 'Institution only', 'Verified educators'] as const;
const CONTENT_VISIBILITY_OPTIONS = ['All content public', 'Members only', 'Premium only'] as const;
const MONETIZATION_OPTIONS = ['Free', 'Paid membership', 'One-time fee', 'Freemium'] as const;
const TRIAL_OPTIONS = ['No trial', '3 days', '7 days', '30 days'] as const;
const CONTENT_GATING_OPTIONS = ['All content', 'Basic free / Premium paid'] as const;
const THEME_SWATCHES = ['#6d6af3', '#28c76f', '#f59e0b', '#ec4899', '#22d3ee', '#a855f7'] as const;

type ToggleState = Record<string, boolean>;

const FEATURE_ROWS = [
  { key: 'chat', label: 'Chat', icon: 'chatbubble-ellipses-outline' },
  { key: 'voice', label: 'Voice channels', icon: 'mic-outline' },
  { key: 'video', label: 'Video rooms', icon: 'videocam-outline' },
  { key: 'files', label: 'File sharing', icon: 'document-attach-outline' },
  { key: 'whiteboard', label: 'Whiteboard', icon: 'pencil-outline' },
  { key: 'timer', label: 'Study timer', icon: 'timer-outline' },
  { key: 'library', label: 'Resource library', icon: 'folder-open-outline' },
  { key: 'qa', label: 'Q&A forum', icon: 'help-circle-outline' },
  { key: 'peer', label: 'Peer review', icon: 'ribbon-outline' },
  { key: 'events', label: 'Events calendar', icon: 'calendar-outline' },
  { key: 'polls', label: 'Polls & voting', icon: 'stats-chart-outline' },
];

const AI_ROWS = [
  { key: 'aiAssistant', label: 'AI study assistant', icon: 'sparkles-outline' },
  { key: 'summaries', label: 'Smart summaries', icon: 'document-text-outline' },
  { key: 'moderation', label: 'Auto-moderation', icon: 'shield-checkmark-outline' },
  { key: 'translation', label: 'Language translation', icon: 'language-outline' },
  { key: 'matching', label: 'Study buddy matching', icon: 'people-outline' },
  { key: 'tracking', label: 'Progress tracking', icon: 'analytics-outline' },
];

export default function CollectiveBuilder({ variant }: { variant: CollectiveVariant }) {
  const { activeTheme, isDark } = useAppTheme();
  const surface = isDark ? '#0B0B1E' : '#FFFFFF';
  const surfaceAlt = isDark ? '#111329' : '#F8FAFC';
  const { from, returnTo } = useLocalSearchParams<{ from?: string; returnTo?: string }>();
  const [collectiveName, setCollectiveName] = useState('');
  const [collectiveType, setCollectiveType] = useState<(typeof TYPE_OPTIONS)[number]>(TYPE_OPTIONS[0]);
  const [category, setCategory] = useState<(typeof CATEGORY_OPTIONS)[number]>(CATEGORY_OPTIONS[0]);
  const [language, setLanguage] = useState<(typeof LANGUAGE_OPTIONS)[number]>(LANGUAGE_OPTIONS[0]);
  const [academicLevel, setAcademicLevel] = useState<(typeof ACADEMIC_LEVELS)[number]>(ACADEMIC_LEVELS[2]);
  const [learningGoals, setLearningGoals] = useState<string[]>([LEARNING_GOALS[0]]);
  const [memberLimit, setMemberLimit] = useState<(typeof MEMBER_LIMITS)[number]>(MEMBER_LIMITS[2]);
  const [memberRole, setMemberRole] = useState<(typeof MEMBER_ROLES)[number]>(MEMBER_ROLES[0]);
  const [leadership, setLeadership] = useState<(typeof LEADERSHIP_OPTIONS)[number]>(LEADERSHIP_OPTIONS[0]);
  const [joinRequirement, setJoinRequirement] = useState<(typeof JOIN_REQUIREMENTS)[number]>(JOIN_REQUIREMENTS[0]);
  const [approvalRequired, setApprovalRequired] = useState(true);
  const [discoverability, setDiscoverability] = useState<(typeof DISCOVERABILITY_OPTIONS)[number]>(DISCOVERABILITY_OPTIONS[0]);
  const [visibleTo, setVisibleTo] = useState<(typeof VISIBLE_TO_OPTIONS)[number]>(VISIBLE_TO_OPTIONS[0]);
  const [contentVisibility, setContentVisibility] = useState<(typeof CONTENT_VISIBILITY_OPTIONS)[number]>(CONTENT_VISIBILITY_OPTIONS[1]);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [groupRules, setGroupRules] = useState('');
  const [themeColor, setThemeColor] = useState<string>(THEME_SWATCHES[0]);
  const [monetization, setMonetization] = useState<(typeof MONETIZATION_OPTIONS)[number]>(MONETIZATION_OPTIONS[0]);
  const [trialPeriod, setTrialPeriod] = useState<(typeof TRIAL_OPTIONS)[number]>(TRIAL_OPTIONS[0]);
  const [contentGating, setContentGating] = useState<(typeof CONTENT_GATING_OPTIONS)[number]>(CONTENT_GATING_OPTIONS[0]);
  const [paymentRequired, setPaymentRequired] = useState(false);

  const [featureToggles, setFeatureToggles] = useState<ToggleState>({
    chat: true,
    voice: true,
    video: true,
    files: true,
    whiteboard: true,
    timer: true,
    library: true,
    qa: true,
    peer: false,
    events: true,
    polls: true,
  });

  const [aiToggles, setAiToggles] = useState<ToggleState>({
    aiAssistant: true,
    summaries: true,
    moderation: true,
    translation: true,
    matching: false,
    tracking: false,
  });

  const title = variant === 'group' ? 'Create New Group' : 'Create New Community';
  const primaryActionLabel = variant === 'group' ? 'Create Group' : 'Create Community';

  const handleBack = () => {
    if (from === 'settings') {
      router.replace('/settings');
      return;
    }
    if (from === 'pulse') {
      if (returnTo === 'groups') {
        router.replace({ pathname: '/pulse', params: { modal: 'groups' } });
        return;
      }
      if (returnTo === 'chat-settings') {
        router.replace({ pathname: '/pulse', params: { modal: 'chat-settings' } });
        return;
      }
      if (returnTo === 'menu') {
        router.replace({ pathname: '/pulse', params: { modal: 'menu' } });
        return;
      }
      router.replace('/pulse');
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/pulse');
  };

  const toggleFromList = (current: string[], value: string) => {
    setLearningGoals((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  const summary = useMemo(
    () => ({
      name: collectiveName || `${collectiveType} Name`,
      type: collectiveType,
      category,
      visibility: discoverability,
      members: memberLimit,
    }),
    [collectiveName, collectiveType, category, discoverability, memberLimit]
  );

  const handleAction = (label: string) => {
    Alert.alert('Coming soon', `${label} will be available in the next build.`);
  };

  const handleCreate = () => {
    Alert.alert('Created', `${summary.name} is ready for launch.`);
  };

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: activeTheme.border }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={16} color={activeTheme.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={[styles.headerKicker, { color: Theme.brand.primary }]}>SPARKNEXAJX</Text>
            <Text style={[styles.headerTitle, { color: activeTheme.text }]}>{title}</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Section title="Basic Information" theme={activeTheme} surfaceColor={surface}>
          <FieldLabel label="Group name" theme={activeTheme} />
          <TextInput
            style={[styles.input, { color: activeTheme.text, borderColor: activeTheme.border, backgroundColor: surfaceAlt }]}
            placeholder="e.g. Calculus III Study Squad"
            placeholderTextColor={activeTheme.textMuted}
            value={collectiveName}
            onChangeText={setCollectiveName}
          />
          <FieldLabel label="Group avatar" theme={activeTheme} />
          <View style={styles.rowWrap}>
            <ActionPill
              icon="camera-outline"
              label="Upload image"
              theme={activeTheme}
              onPress={() => handleAction('Upload image')}
            />
            <ActionPill
              icon="color-palette-outline"
              label="Choose icon"
              theme={activeTheme}
              onPress={() => handleAction('Choose icon')}
            />
          </View>
          <FieldLabel label="Group type" theme={activeTheme} />
          <ChipRow
            options={TYPE_OPTIONS}
            selected={collectiveType}
            onSelect={(value) => setCollectiveType(value as typeof collectiveType)}
            theme={activeTheme}
          />
          <FieldLabel label="Category" theme={activeTheme} />
          <ChipRow
            options={CATEGORY_OPTIONS}
            selected={category}
            onSelect={(value) => setCategory(value as typeof category)}
            theme={activeTheme}
          />
          <FieldLabel label="Language" theme={activeTheme} />
          <ChipRow
            options={LANGUAGE_OPTIONS}
            selected={language}
            onSelect={(value) => setLanguage(value as typeof language)}
            theme={activeTheme}
          />
        </Section>

        <Section title="Learning Context" theme={activeTheme} surfaceColor={surface}>
          <ActionRow
            icon="link-outline"
            label="Course connection"
            theme={activeTheme}
            onPress={() => handleAction('Course connection')}
          />
          <Divider theme={activeTheme} />
          <FieldLabel label="Academic level" theme={activeTheme} />
          <ChipRow
            options={ACADEMIC_LEVELS}
            selected={academicLevel}
            onSelect={(value) => setAcademicLevel(value as typeof academicLevel)}
            theme={activeTheme}
          />
          <FieldLabel label="Learning goals" theme={activeTheme} />
          <MultiChipRow
            options={LEARNING_GOALS}
            selected={learningGoals}
            onToggle={toggleFromList}
            theme={activeTheme}
          />
          <ActionRow
            icon="calendar-outline"
            label="Schedule"
            theme={activeTheme}
            onPress={() => handleAction('Schedule')}
          />
        </Section>

        <Section title="Group Features & Tools" theme={activeTheme} surfaceColor={surface}>
          {FEATURE_ROWS.map((row, index) => (
            <View key={row.key}>
              <ToggleRow
                icon={row.icon}
                label={row.label}
                value={featureToggles[row.key]}
                onToggle={(value) => setFeatureToggles((prev) => ({ ...prev, [row.key]: value }))}
                theme={activeTheme}
              />
              {index !== FEATURE_ROWS.length - 1 ? <Divider theme={activeTheme} /> : null}
            </View>
          ))}
        </Section>

        <Section title="Membership & Roles" theme={activeTheme} surfaceColor={surface}>
          <FieldLabel label="Member limit" theme={activeTheme} />
          <ChipRow
            options={MEMBER_LIMITS}
            selected={memberLimit}
            onSelect={(value) => setMemberLimit(value as typeof memberLimit)}
            theme={activeTheme}
          />
          <FieldLabel label="Default member role" theme={activeTheme} />
          <ChipRow
            options={MEMBER_ROLES}
            selected={memberRole}
            onSelect={(value) => setMemberRole(value as typeof memberRole)}
            theme={activeTheme}
          />
          <FieldLabel label="Leadership structure" theme={activeTheme} />
          <ChipRow
            options={LEADERSHIP_OPTIONS}
            selected={leadership}
            onSelect={(value) => setLeadership(value as typeof leadership)}
            theme={activeTheme}
          />
          <FieldLabel label="Join requirements" theme={activeTheme} />
          <ChipRow
            options={JOIN_REQUIREMENTS}
            selected={joinRequirement}
            onSelect={(value) => setJoinRequirement(value as typeof joinRequirement)}
            theme={activeTheme}
          />
          <ToggleRow
            icon="shield-outline"
            label="Approval required"
            value={approvalRequired}
            onToggle={setApprovalRequired}
            theme={activeTheme}
          />
        </Section>

        <Section title="Discovery & Privacy" theme={activeTheme} surfaceColor={surface}>
          <FieldLabel label="Discoverability" theme={activeTheme} />
          <ChipRow
            options={DISCOVERABILITY_OPTIONS}
            selected={discoverability}
            onSelect={(value) => setDiscoverability(value as typeof discoverability)}
            theme={activeTheme}
          />
          <ToggleRow
            icon="sparkles-outline"
            label="Show in recommendations"
            value={showRecommendations}
            onToggle={setShowRecommendations}
            theme={activeTheme}
          />
          <FieldLabel label="Visible to" theme={activeTheme} />
          <ChipRow
            options={VISIBLE_TO_OPTIONS}
            selected={visibleTo}
            onSelect={(value) => setVisibleTo(value as typeof visibleTo)}
            theme={activeTheme}
          />
          <FieldLabel label="Content visibility" theme={activeTheme} />
          <ChipRow
            options={CONTENT_VISIBILITY_OPTIONS}
            selected={contentVisibility}
            onSelect={(value) => setContentVisibility(value as typeof contentVisibility)}
            theme={activeTheme}
          />
        </Section>

        <Section title="AI & Smart Features" theme={activeTheme} surfaceColor={surface}>
          {AI_ROWS.map((row, index) => (
            <View key={row.key}>
              <ToggleRow
                icon={row.icon}
                label={row.label}
                value={aiToggles[row.key]}
                onToggle={(value) => setAiToggles((prev) => ({ ...prev, [row.key]: value }))}
                theme={activeTheme}
              />
              {index !== AI_ROWS.length - 1 ? <Divider theme={activeTheme} /> : null}
            </View>
          ))}
        </Section>

        <Section title="Group Identity & Culture" theme={activeTheme} surfaceColor={surface}>
          <FieldLabel label="Welcome message" theme={activeTheme} />
          <TextInput
            style={[styles.textArea, { color: activeTheme.text, borderColor: activeTheme.border, backgroundColor: surfaceAlt }]}
            placeholder="Auto-send a welcome note to new members"
            placeholderTextColor={activeTheme.textMuted}
            value={welcomeMessage}
            onChangeText={setWelcomeMessage}
            multiline
          />
          <FieldLabel label="Group rules" theme={activeTheme} />
          <TextInput
            style={[styles.textArea, { color: activeTheme.text, borderColor: activeTheme.border, backgroundColor: surfaceAlt }]}
            placeholder="Be respectful, no spam, stay on topic"
            placeholderTextColor={activeTheme.textMuted}
            value={groupRules}
            onChangeText={setGroupRules}
            multiline
          />
          <FieldLabel label="Tags" theme={activeTheme} />
          <View style={styles.rowWrap}>
            <TagPill label="#STEM" theme={activeTheme} />
            <TagPill label="#studygroup" theme={activeTheme} />
            <TagPill label="#friendly" theme={activeTheme} />
            <ActionPill
              icon="add-outline"
              label="Add tag"
              theme={activeTheme}
              onPress={() => handleAction('Add tag')}
            />
          </View>
          <ActionRow
            icon="image-outline"
            label="Cover image"
            theme={activeTheme}
            onPress={() => handleAction('Cover image')}
          />
          <FieldLabel label="Color theme" theme={activeTheme} />
          <View style={styles.rowWrap}>
            {THEME_SWATCHES.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorSwatch,
                  {
                    backgroundColor: color,
                    borderColor: themeColor === color ? Theme.brand.primary : 'transparent',
                  },
                ]}
                onPress={() => setThemeColor(color)}
              />
            ))}
          </View>
        </Section>

        <Section title="Monetization (Optional)" theme={activeTheme} surfaceColor={surface}>
          <FieldLabel label="Group type" theme={activeTheme} />
          <ChipRow
            options={MONETIZATION_OPTIONS}
            selected={monetization}
            onSelect={(value) => setMonetization(value as typeof monetization)}
            theme={activeTheme}
          />
          <ToggleRow
            icon="card-outline"
            label="Payment required"
            value={paymentRequired}
            onToggle={setPaymentRequired}
            theme={activeTheme}
          />
          <FieldLabel label="Trial period" theme={activeTheme} />
          <ChipRow
            options={TRIAL_OPTIONS}
            selected={trialPeriod}
            onSelect={(value) => setTrialPeriod(value as typeof trialPeriod)}
            theme={activeTheme}
          />
          <FieldLabel label="Content gating" theme={activeTheme} />
          <ChipRow
            options={CONTENT_GATING_OPTIONS}
            selected={contentGating}
            onSelect={(value) => setContentGating(value as typeof contentGating)}
            theme={activeTheme}
          />
        </Section>

        <Section title="Review & Create" theme={activeTheme} surfaceColor={surface}>
          <View style={[styles.summaryCard, { backgroundColor: surface, borderColor: activeTheme.border }]}>
            <SummaryRow icon="person-circle-outline" label="Name" value={summary.name} theme={activeTheme} />
            <SummaryRow icon="school-outline" label="Type" value={summary.type} theme={activeTheme} />
            <SummaryRow icon="grid-outline" label="Category" value={summary.category} theme={activeTheme} />
            <SummaryRow icon="eye-outline" label="Visibility" value={summary.visibility} theme={activeTheme} />
            <SummaryRow icon="people-outline" label="Members" value={summary.members} theme={activeTheme} />
          </View>
          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: Theme.brand.primary }]} onPress={handleCreate}>
            <Text style={styles.primaryButtonText}>{primaryActionLabel}</Text>
          </TouchableOpacity>
        </Section>

        <Section title="Post-creation options" theme={activeTheme} surfaceColor={surface}>
          <Text style={[styles.helperText, { color: activeTheme.textMuted }]}>
            After creation, invite members and set up your first session.
          </Text>
          <View style={styles.rowWrap}>
            <ActionPill
              icon="person-add-outline"
              label="Invite members"
              theme={activeTheme}
              onPress={() => handleAction('Invite members')}
            />
            <ActionPill
              icon="add-circle-outline"
              label="Add resources"
              theme={activeTheme}
              onPress={() => handleAction('Add resources')}
            />
            <ActionPill
              icon="calendar-outline"
              label="First event"
              theme={activeTheme}
              onPress={() => handleAction('First event')}
            />
            <ActionPill
              icon="arrow-forward-circle-outline"
              label="Go to group"
              theme={activeTheme}
              onPress={() => handleAction('Go to group')}
            />
          </View>
        </Section>
      </ScrollView>
    </View>
  );
}

function Section({
  title,
  theme,
  surfaceColor,
  children,
}: {
  title: string;
  theme: any;
  surfaceColor: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>{title}</Text>
      <View style={[styles.card, { backgroundColor: surfaceColor, borderColor: theme.border }]}>{children}</View>
    </View>
  );
}

function Divider({ theme }: { theme: any }) {
  return <View style={[styles.divider, { backgroundColor: theme.border }]} />;
}

function FieldLabel({ label, theme }: { label: string; theme: any }) {
  return <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>{label}</Text>;
}

function ActionRow({
  icon,
  label,
  theme,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  theme: any;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.actionRow} onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: theme.background }]}>
        <Ionicons name={icon} size={16} color={theme.text} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
    </TouchableOpacity>
  );
}

function ToggleRow({
  icon,
  label,
  value,
  onToggle,
  theme,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  theme: any;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={[styles.iconBox, { backgroundColor: theme.background }]}>
        <Ionicons name={icon} size={16} color={theme.text} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
      </View>
      <Switch value={value} onValueChange={onToggle} trackColor={{ false: theme.border, true: Theme.brand.primary }} thumbColor="#FFFFFF" />
    </View>
  );
}

function ChipRow({
  options,
  selected,
  onSelect,
  theme,
}: {
  options: readonly string[];
  selected: string;
  onSelect: (value: string) => void;
  theme: any;
}) {
  return (
    <View style={styles.chipRow}>
      {options.map((option) => {
        const isActive = option === selected;
        return (
          <TouchableOpacity
            key={option}
            style={[
              styles.chip,
              { borderColor: isActive ? Theme.brand.primary : theme.border, backgroundColor: isActive ? Theme.brand.primary : theme.background },
            ]}
            onPress={() => onSelect(option)}
          >
            <Text style={[styles.chipText, { color: isActive ? '#FFFFFF' : theme.text }]}>{option}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function MultiChipRow({
  options,
  selected,
  onToggle,
  theme,
}: {
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
  theme: any;
}) {
  return (
    <View style={styles.chipRow}>
      {options.map((option) => {
        const isActive = selected.includes(option);
        return (
          <TouchableOpacity
            key={option}
            style={[
              styles.chip,
              { borderColor: isActive ? Theme.brand.primary : theme.border, backgroundColor: isActive ? Theme.brand.primary : theme.background },
            ]}
            onPress={() => onToggle(option)}
          >
            <Text style={[styles.chipText, { color: isActive ? '#FFFFFF' : theme.text }]}>{option}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function ActionPill({
  icon,
  label,
  theme,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  theme: any;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.actionPill, { borderColor: theme.border, backgroundColor: theme.background }]} onPress={onPress}>
      <Ionicons name={icon} size={16} color={theme.text} />
      <Text style={[styles.pillLabel, { color: theme.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function TagPill({ label, theme }: { label: string; theme: any }) {
  return (
    <View style={[styles.tagPill, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <Text style={[styles.pillLabel, { color: theme.text }]}>{label}</Text>
    </View>
  );
}

function SummaryRow({
  icon,
  label,
  value,
  theme,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  theme: any;
}) {
  return (
    <View style={styles.summaryRow}>
      <View style={[styles.summaryIcon, { backgroundColor: theme.background }]}>
        <Ionicons name={icon} size={16} color={theme.text} />
      </View>
      <View style={styles.summaryText}>
        <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>{label}</Text>
        <Text style={[styles.summaryValue, { color: theme.text }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { backgroundColor: 'transparent' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { width: 32, alignItems: 'flex-start' },
  headerTitleWrap: { alignItems: 'center', flex: 1 },
  headerKicker: { fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  headerTitle: { marginTop: 2, fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  headerSpacer: { width: 32 },
  scrollContent: { paddingHorizontal: 18, paddingBottom: 120 },
  section: { marginTop: 18 },
  sectionTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 },
  card: { borderWidth: 1, borderRadius: 18, padding: 14, gap: 10 },
  fieldLabel: { fontSize: 12, fontWeight: '700', marginTop: 8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontWeight: '600' },
  textArea: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontWeight: '600', minHeight: 80 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 },
  chipText: { fontSize: 12, fontWeight: '700' },
  actionPill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 8 },
  tagPill: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 8 },
  pillLabel: { fontSize: 12, fontWeight: '700' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  iconBox: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: '700' },
  divider: { height: 1, marginVertical: 6 },
  colorSwatch: { width: 30, height: 30, borderRadius: 10, borderWidth: 2 },
  summaryCard: { borderWidth: 1, borderRadius: 14, padding: 12, gap: 10 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  summaryText: { flex: 1 },
  summaryLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  summaryValue: { fontSize: 14, fontWeight: '800' },
  primaryButton: { marginTop: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', letterSpacing: 0.4 },
  helperText: { fontSize: 12, fontWeight: '500', marginBottom: 10 },
});
