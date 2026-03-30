import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useDrawerBack } from '../lib/useDrawerBack';

import { Theme } from '../constants/Theme';
import { useAppTheme } from '../lib/theme';

type OnlineNode = {
  id: string;
  name: string;
  role: string;
  status: string;
  subject: string;
  color: string;
  statusColor: string;
};

type PinnedLink = {
  id: string;
  name: string;
  preview: string;
  time: string;
  unread: number;
  color: string;
};

type ConversationItem = {
  id: string;
  name: string;
  preview: string;
  time: string;
  unread: number;
  favorite: boolean;
  group: boolean;
  request?: boolean;
  meta?: string;
  color: string;
  previewIcon?: keyof typeof Ionicons.glyphMap;
};

type ChatCategory = 'all' | 'unread' | 'favorites' | 'groups' | 'requests';

const ONLINE_NODES: OnlineNode[] = [
  {
    id: 'jd',
    name: 'Jade Daniels',
    role: 'Math Tutor',
    status: 'Active now',
    subject: 'Calculus',
    color: '#7c3aed',
    statusColor: '#22c55e',
  },
  {
    id: 'sm',
    name: 'Sarah Chen',
    role: 'Study Buddy',
    status: 'In session',
    subject: 'Physics',
    color: '#6366f1',
    statusColor: '#f59e0b',
  },
  {
    id: 'ak',
    name: 'Andre Keller',
    role: 'Group Admin',
    status: 'Online',
    subject: 'Chemistry',
    color: '#22c55e',
    statusColor: '#22c55e',
  },
  {
    id: 'ep',
    name: 'Elena Park',
    role: 'Language Lab',
    status: 'Focus mode',
    subject: 'Spanish',
    color: '#f97316',
    statusColor: '#ef4444',
  },
  {
    id: 'tc',
    name: 'Tariq Cole',
    role: 'Project Lead',
    status: 'Active now',
    subject: 'AI Lab',
    color: '#0ea5e9',
    statusColor: '#22c55e',
  },
];

const PINNED_LINKS: PinnedLink[] = [
  {
    id: 'alex',
    name: 'Dr. Alex Rivera',
    preview: 'Homework: Quantum Mechanics',
    time: '10m',
    unread: 2,
    color: '#7367f0',
  },
  {
    id: 'maya',
    name: 'Prof. Maya Chen',
    preview: 'Check your inbox for feedback',
    time: '28m',
    unread: 1,
    color: '#34C759',
  },
];

const CONVERSATIONS: ConversationItem[] = [
  {
    id: 'calc',
    name: 'Study Group: Calculus III',
    preview: 'File: "Derivatives Cheat Sheet.pdf"',
    time: '5m',
    unread: 12,
    favorite: false,
    group: true,
    meta: 'Homework due Friday',
    color: '#7c3aed',
    previewIcon: 'document-text-outline',
  },
  {
    id: 'sophia',
    name: 'Sophia Williams',
    preview: 'Voice message: "Want to practice?"',
    time: '2h',
    unread: 1,
    favorite: true,
    group: false,
    meta: 'Next session tomorrow 3 PM',
    color: '#34C759',
    previewIcon: 'mic-outline',
  },
  {
    id: 'marcus',
    name: 'Marcus Taylor',
    preview: 'Do not forget to review chapter 7',
    time: '1h',
    unread: 0,
    favorite: true,
    group: false,
    meta: 'Daily challenge: 5 phrases',
    color: '#f97316',
  },
  {
    id: 'career',
    name: 'Career Mentors Hub',
    preview: 'Announcement: Resume workshop',
    time: 'Yesterday',
    unread: 3,
    favorite: false,
    group: true,
    meta: 'Viewed - Reply suggested',
    color: '#0ea5e9',
  },
  {
    id: 'request',
    name: 'New message request',
    preview: 'Request to join sprint review',
    time: 'Now',
    unread: 1,
    favorite: false,
    group: false,
    request: true,
    color: '#a855f7',
    previewIcon: 'mail-open-outline',
  },
];

const CHAT_CATEGORIES: Array<{ key: ChatCategory; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { key: 'all', label: 'All', icon: 'chatbubbles-outline' },
  { key: 'unread', label: 'Unread', icon: 'mail-unread-outline' },
  { key: 'favorites', label: 'Favorites', icon: 'star-outline' },
  { key: 'groups', label: 'Study Groups', icon: 'people-circle-outline' },
  { key: 'requests', label: 'Requests', icon: 'mail-open-outline' },
];

const SMART_SUGGESTIONS = [
  {
    id: 'nn',
    title: 'Connect with classmates from Neural Networks',
  },
  {
    id: 'physics',
    title: 'Join Physics 101 study group',
  },
  {
    id: 'resume',
    title: 'Resume conversation with Prof. Williams',
  },
];

const CHAT_THEME_OPTIONS = ['System default', 'Light', 'Dark', 'High contrast'] as const;
const CHAT_FONT_SIZE_OPTIONS = ['Small', 'Medium', 'Large', 'Extra large'] as const;
const AUTO_DOWNLOAD_OPTIONS = ['Never', 'Wi-Fi only', 'Wi-Fi & cellular'] as const;
const MEDIA_QUALITY_OPTIONS = ['Standard', 'High'] as const;
const BACKUP_FREQUENCY_OPTIONS = ['Manual', 'Daily', 'Weekly'] as const;
const ARCHIVE_AFTER_OPTIONS = ['30 days', '60 days', '90 days', 'Never'] as const;
const HISTORY_RETENTION_OPTIONS = ['30 days', '60 days', '90 days', 'Never'] as const;
const PINNED_LIMIT_OPTIONS = ['Unlimited'] as const;

export default function ChatScreen() {
  const { activeTheme, themeMode, setThemeMode } = useAppTheme();
  const handleBack = useDrawerBack();
  const [selectedUser, setSelectedUser] = useState<{ name: string; color: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [showGroupsModal, setShowGroupsModal] = useState(false);
  const [showChatSettingsModal, setShowChatSettingsModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ChatCategory>('all');
  const [defaultChatTheme, setDefaultChatTheme] = useState<(typeof CHAT_THEME_OPTIONS)[number]>('System default');
  const [chatFontSize, setChatFontSize] = useState<(typeof CHAT_FONT_SIZE_OPTIONS)[number]>('Medium');
  const [enterIsSend, setEnterIsSend] = useState(false);
  const [mediaVisibility, setMediaVisibility] = useState(false);
  const [keepChatsArchived, setKeepChatsArchived] = useState(true);
  const [keyboardShortcuts, setKeyboardShortcuts] = useState(true);
  const [autoDownloadMedia, setAutoDownloadMedia] = useState<(typeof AUTO_DOWNLOAD_OPTIONS)[number]>(AUTO_DOWNLOAD_OPTIONS[1]);
  const [mediaQuality, setMediaQuality] = useState<(typeof MEDIA_QUALITY_OPTIONS)[number]>(MEDIA_QUALITY_OPTIONS[0]);
  const [saveToGallery, setSaveToGallery] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [typingIndicator, setTypingIndicator] = useState(true);
  const [screenshotBlocking, setScreenshotBlocking] = useState(false);
  const [restrictForwarding, setRestrictForwarding] = useState(false);
  const [chatNotifications, setChatNotifications] = useState(true);
  const [messagePreview, setMessagePreview] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState<(typeof BACKUP_FREQUENCY_OPTIONS)[number]>(BACKUP_FREQUENCY_OPTIONS[0]);
  const [backupIncludeVideos, setBackupIncludeVideos] = useState(false);
  const [backupWifiOnly, setBackupWifiOnly] = useState(true);
  const [autoArchiveAfter, setAutoArchiveAfter] = useState<(typeof ARCHIVE_AFTER_OPTIONS)[number]>(ARCHIVE_AFTER_OPTIONS[1]);
  const [historyRetention, setHistoryRetention] = useState<(typeof HISTORY_RETENTION_OPTIONS)[number]>(HISTORY_RETENTION_OPTIONS[0]);
  const [focusMode, setFocusMode] = useState(false);
  const [pinnedLimit, setPinnedLimit] = useState<(typeof PINNED_LIMIT_OPTIONS)[number]>(PINNED_LIMIT_OPTIONS[0]);
  const [highContrastText, setHighContrastText] = useState(false);
  const [screenReaderOptim, setScreenReaderOptim] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [languageTranslation, setLanguageTranslation] = useState(false);
  const [filtersHidden, setFiltersHidden] = useState(false);
  const filterAnim = useRef(new Animated.Value(0)).current;
  const lastOffsetY = useRef(0);
  const { modal, dmName, dmColor } = useLocalSearchParams<{ modal?: string; dmName?: string; dmColor?: string }>();

  useEffect(() => {
    if (modal === 'chat-settings') {
      setShowChatSettingsModal(true);
      router.setParams({ modal: '' });
    } else if (modal === 'groups') {
      setShowGroupsModal(true);
      router.setParams({ modal: '' });
    } else if (modal === 'menu') {
      setShowMenuModal(true);
      router.setParams({ modal: '' });
    } else if (modal === 'new-chat') {
      setShowNewChat(true);
      router.setParams({ modal: '' });
    }
  }, [modal]);

  useEffect(() => {
    const name = Array.isArray(dmName) ? dmName[0] : dmName;
    const color = Array.isArray(dmColor) ? dmColor[0] : dmColor;
    if (name) {
      setSelectedUser({ name, color: color || Theme.brand.primary });
      router.setParams({ dmName: '', dmColor: '' });
    }
  }, [dmName, dmColor]);

  const q = searchQuery.trim().toLowerCase();
  const filteredNodes = useMemo(
    () =>
      q
        ? ONLINE_NODES.filter(
            (node) =>
              node.name.toLowerCase().includes(q) ||
              node.role.toLowerCase().includes(q) ||
              node.subject.toLowerCase().includes(q)
          )
        : ONLINE_NODES,
    [q]
  );
  const filteredConversations = useMemo(
    () =>
      CONVERSATIONS.filter((c) => {
        const matchesSearch = q
          ? c.name.toLowerCase().includes(q) ||
            c.preview.toLowerCase().includes(q) ||
            (c.meta ? c.meta.toLowerCase().includes(q) : false)
          : true;
        const matchesCategory =
          activeCategory === 'all' ||
          (activeCategory === 'unread' && c.unread > 0) ||
          (activeCategory === 'favorites' && c.favorite) ||
          (activeCategory === 'groups' && c.group) ||
          (activeCategory === 'requests' && c.request);
        return matchesSearch && matchesCategory;
      }),
    [activeCategory, q]
  );

  const cycleOption = <T extends string>(
    options: readonly T[],
    current: T,
    setter: (value: T) => void
  ) => {
    const currentIndex = options.indexOf(current);
    const nextIndex = (currentIndex + 1) % options.length;
    setter(options[nextIndex]);
  };

  const cycleDefaultChatTheme = () => cycleOption(CHAT_THEME_OPTIONS, defaultChatTheme, setDefaultChatTheme);
  const cycleChatFontSize = () => cycleOption(CHAT_FONT_SIZE_OPTIONS, chatFontSize, setChatFontSize);
  const cycleAutoDownload = () => cycleOption(AUTO_DOWNLOAD_OPTIONS, autoDownloadMedia, setAutoDownloadMedia);
  const cycleMediaQuality = () => cycleOption(MEDIA_QUALITY_OPTIONS, mediaQuality, setMediaQuality);
  const cycleBackupFrequency = () => cycleOption(BACKUP_FREQUENCY_OPTIONS, backupFrequency, setBackupFrequency);
  const cycleArchiveAfter = () => cycleOption(ARCHIVE_AFTER_OPTIONS, autoArchiveAfter, setAutoArchiveAfter);
  const cycleHistoryRetention = () => cycleOption(HISTORY_RETENTION_OPTIONS, historyRetention, setHistoryRetention);
  const cyclePinnedLimit = () => cycleOption(PINNED_LIMIT_OPTIONS, pinnedLimit, setPinnedLimit);

  const showComingSoon = (label: string) => Alert.alert('Coming soon', `${label} is being prepared.`);

  const setFilterVisibility = (hidden: boolean) => {
    if (hidden === filtersHidden) return;
    setFiltersHidden(hidden);
    Animated.timing(filterAnim, {
      toValue: hidden ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  };

  const onChatScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const delta = y - lastOffsetY.current;
    if (y < 0) return;
    if (delta > 7) {
      setFilterVisibility(true);
    } else if (delta < -7) {
      setFilterVisibility(false);
    }
    lastOffsetY.current = y;
  };

  const filterAnimatedStyle = {
    transform: [
      {
        translateY: filterAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -20],
        }),
      },
    ],
    opacity: filterAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    }),
  };

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <View style={[styles.bgOrb, { top: -100, right: -50, backgroundColor: Theme.brand.primary, opacity: 0.15 }]} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
          accessibilityHint="Return to the previous screen"
        >
          <Ionicons name="chevron-back" size={16} color={activeTheme.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: activeTheme.text }]}>Messages</Text>
        </View>
        <View style={styles.headerRight}>  
          <TouchableOpacity
            style={[styles.iconCircle, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}
            onPress={() =>
              router.push({
                pathname: '/settings-detail/[slug]',
                params: { slug: 'linked-devices', from: 'pulse', returnTo: 'menu' },
              })
            }
          >
            <Ionicons name="camera-outline" size={16} color={activeTheme.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconCircle, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}
            onPress={() => setShowMenuModal(true)}
          >
            <Ionicons name="ellipsis-vertical" size={16} color={activeTheme.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <BlurView intensity={25} tint={activeTheme === Theme.dark ? 'dark' : 'light'} style={[styles.searchBar, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
          <Ionicons name="search-outline" size={16} color={activeTheme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: activeTheme.text }]}
            placeholder="Search conversations, study groups, or shared files..."
            placeholderTextColor={activeTheme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </BlurView>
        <Animated.View style={[styles.filterBarWrap, filterAnimatedStyle]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryWrap}>
            {CHAT_CATEGORIES.map((category) => {
              const isActive = activeCategory === category.key;
              return (
                <TouchableOpacity
                  key={category.key}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: isActive ? Theme.brand.primary : activeTheme.card,
                      borderColor: isActive ? Theme.brand.primary : activeTheme.border,
                    },
                  ]}
                  onPress={() => setActiveCategory(category.key)}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={16}
                    color={isActive ? '#FFF' : activeTheme.textMuted}
                  />
                  <Text style={[styles.categoryChipText, { color: isActive ? '#FFF' : activeTheme.textMuted }]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        onScroll={onChatScroll}
        scrollEventThrottle={16}
      >
        <Text style={[styles.sectionTitle, { color: activeTheme.text }]}>Online Nodes</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storiesContainer}>
          {filteredNodes.map((node) => (
            <OnlineNodeCard
              key={node.id}
              node={node}
              theme={activeTheme}
              onPress={() => setSelectedUser({ name: node.name, color: node.color })}
            />
          ))}
        </ScrollView>

        <Text style={[styles.sectionTitle, { color: activeTheme.text }]}>Pinned Neural Links</Text>
        <View style={styles.sectionStack}>
          {PINNED_LINKS.map((link) => (
            <PinnedLinkCard
              key={link.id}
              item={link}
              theme={activeTheme}
              onPress={() => setSelectedUser({ name: link.name, color: link.color })}
            />
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: activeTheme.text }]}>Recent Conversations</Text>
        {filteredConversations.map((chat) => (
          <ConversationCard
            key={chat.id}
            item={chat}
            theme={activeTheme}
            onPress={() => setSelectedUser({ name: chat.name, color: chat.color })}
          />
        ))}

        <Text style={[styles.sectionTitle, { color: activeTheme.text }]}>Smart Suggestions</Text>
        <View style={styles.sectionStack}>
          {SMART_SUGGESTIONS.map((suggestion) => (
            <SuggestionCard key={suggestion.id} item={suggestion} theme={activeTheme} />
          ))}
        </View>
      </ScrollView>
      {/* Floating Action Button - Add Contact */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowNewChat(true)}
      >
        <LinearGradient colors={Theme.brand.primaryGradient} style={styles.fabGradient}>
          <View style={styles.fabIconWrap}>
            <Ionicons name="person" size={18} color="#FFF" />
            <View style={styles.fabIconBadge}>
              <Ionicons name="add" size={10} color="#FFF" />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
      <Modal visible={!!selectedUser} animationType="slide" presentationStyle="fullScreen">
        <DirectMessageView user={selectedUser} theme={activeTheme} onClose={() => setSelectedUser(null)} />
      </Modal>

      {/* Chat Settings & Privacy Modal */}
      <Modal visible={showChatSettingsModal} animationType="slide" transparent presentationStyle="overFullScreen">
        <BlurView intensity={80} tint={activeTheme === Theme.dark ? 'dark' : 'light'} style={[styles.settingsModalContainer, { backgroundColor: activeTheme.background + 'CC' }]}>
          <View style={[styles.settingsModal, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
            <View style={styles.settingsModalHeader}>
              <Text style={[styles.settingsModalTitle, { color: activeTheme.text }]}>Chats</Text>
              <TouchableOpacity onPress={() => setShowChatSettingsModal(false)}>
                <Ionicons name="close-outline" size={16} color={activeTheme.text} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.chatSectionTitle, { color: activeTheme.textMuted }]}>Display</Text>
              <View style={[styles.chatSectionCard, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
                <ChatOptionAction
                  icon="color-palette-outline"
                  label="Theme"
                  value={themeMode === 'dark' ? 'Dark' : 'Light'}
                  onPress={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
                  theme={activeTheme}
                />
                <View style={[styles.chatOptionDivider, { backgroundColor: activeTheme.border }]} />
                <ChatOptionAction
                  icon="brush-outline"
                  label="Default chat theme"
                  value={defaultChatTheme}
                  onPress={cycleDefaultChatTheme}
                  theme={activeTheme}
                />
              </View>

              <Text style={[styles.chatSectionTitle, { color: activeTheme.textMuted }]}>Chat settings</Text>
              <View style={[styles.chatSectionCard, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
                <ChatOptionToggle
                  label="Enter is send"
                  description="Enter key will send your message"
                  value={enterIsSend}
                  onValueChange={setEnterIsSend}
                  theme={activeTheme}
                />
                <View style={[styles.chatOptionDivider, { backgroundColor: activeTheme.border }]} />
                <ChatOptionToggle
                  label="Keyboard shortcuts"
                  description="Enable Ctrl+B, Ctrl+I, and other shortcuts"
                  value={keyboardShortcuts}
                  onValueChange={setKeyboardShortcuts}
                  theme={activeTheme}
                />
                <View style={[styles.chatOptionDivider, { backgroundColor: activeTheme.border }]} />
                <ChatOptionToggle
                  label="Media visibility"
                  description="Show newly downloaded media in your device's gallery"
                  value={mediaVisibility}
                  onValueChange={setMediaVisibility}
                  theme={activeTheme}
                />
                <View style={[styles.chatOptionDivider, { backgroundColor: activeTheme.border }]} />
                <ChatOptionAction icon="text-outline" label="Font size" value={chatFontSize} onPress={cycleChatFontSize} theme={activeTheme} />
              </View>

              <Text style={[styles.chatSectionTitle, { color: activeTheme.textMuted }]}>Media & storage</Text>
              <View style={[styles.chatSectionCard, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
                <ChatOptionAction
                  icon="cloud-download-outline"
                  label="Auto-download media"
                  value={autoDownloadMedia}
                  onPress={cycleAutoDownload}
                  theme={activeTheme}
                />
                <View style={[styles.chatOptionDivider, { backgroundColor: activeTheme.border }]} />
                <ChatOptionAction
                  icon="aperture-outline"
                  label="Image & video quality"
                  value={mediaQuality}
                  onPress={cycleMediaQuality}
                  theme={activeTheme}
                />
                <View style={[styles.chatOptionDivider, { backgroundColor: activeTheme.border }]} />
                <ChatOptionAction
                  icon="folder-open-outline"
                  label="Storage usage"
                  value="View and clear"
                  onPress={() => showComingSoon('Storage usage')}
                  theme={activeTheme}
                />
                <View style={[styles.chatOptionDivider, { backgroundColor: activeTheme.border }]} />
                <ChatOptionToggle
                  label="Save to gallery"
                  description="Automatically save received media"
                  value={saveToGallery}
                  onValueChange={setSaveToGallery}
                  theme={activeTheme}
                />
              </View>

              <Text style={[styles.chatSectionTitle, { color: activeTheme.textMuted }]}>Privacy & security</Text>
              <View style={[styles.chatSectionCard, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
                <ChatOptionToggle
                  label="Read receipts"
                  description="Let others know when you've read messages"
                  value={readReceipts}
                  onValueChange={setReadReceipts}
                  theme={activeTheme}
                />
                <View style={[styles.chatOptionDivider, { backgroundColor: activeTheme.border }]} />
                <ChatOptionToggle
                  label="Typing indicator"
                  description="Show when you're typing"
                  value={typingIndicator}
                  onValueChange={setTypingIndicator}
                  theme={activeTheme}
                />
                <View style={[styles.chatOptionDivider, { backgroundColor: activeTheme.border }]} />
                <ChatOptionToggle
                  label="Screenshot blocking"
                  description="Block screenshots in private chats"
                  value={screenshotBlocking}
                  onValueChange={setScreenshotBlocking}
                  theme={activeTheme}
                />
                <View style={[styles.chatOptionDivider, { backgroundColor: activeTheme.border }]} />
                <ChatOptionToggle
                  label="Restrict forwarding"
                  description="Prevent message forwarding"
                  value={restrictForwarding}
                  onValueChange={setRestrictForwarding}
                  theme={activeTheme}
                />
                <View style={[styles.chatOptionDivider, { backgroundColor: activeTheme.border }]} />
                <ChatOptionAction
                  icon="ban-outline"
                  label="Blocked users"
                  value="Manage list"
                  onPress={() =>
                    router.push({
                      pathname: '/settings-detail/[slug]',
                      params: { slug: 'blocked-users', from: 'pulse', returnTo: 'chat-settings' },
                    })
                  }
                  theme={activeTheme}
                />
              </View>

              <Text style={[styles.chatSectionTitle, { color: activeTheme.textMuted }]}>Notifications</Text>
              <View style={[styles.chatSectionCard, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
                <ChatOptionToggle
                  label="Chat notifications"
                  description="Global on/off for chats"
                  value={chatNotifications}
                  onValueChange={setChatNotifications}
                  theme={activeTheme}
                />
                <View style={[styles.chatOptionDivider, { backgroundColor: activeTheme.border }]} />
                <ChatOptionAction
                  icon="moon-outline"
                  label="Quiet hours"
                  value="Schedule"
                  onPress={() =>
                    router.push({
                      pathname: '/settings-detail/[slug]',
                      params: { slug: 'quiet-hours', from: 'pulse', returnTo: 'chat-settings' },
                    })
                  }
                  theme={activeTheme}
                />
                <View style={[styles.chatOptionDivider, { backgroundColor: activeTheme.border }]} />
                <ChatOptionToggle
                  label="Message preview"
                  description="Show sender and message on lock screen"
                  value={messagePreview}
                  onValueChange={setMessagePreview}
                  theme={activeTheme}
                />
                <View style={[styles.chatOptionDivider, { backgroundColor: activeTheme.border }]} />
                <ChatOptionAction
                  icon="options-outline"
                  label="Per-chat overrides"
                  value="Customize"
                  onPress={() => showComingSoon('Per-chat overrides')}
                  theme={activeTheme}
                />
              </View>

              <Text style={[styles.chatSectionTitle, { color: activeTheme.textMuted }]}>Archived chats</Text>
              <View style={[styles.chatSectionCard, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
                <ChatOptionToggle
                  label="Keep chats archived"
                  description="Archived chats will remain archived when you receive a new message"
                  value={keepChatsArchived}
                  onValueChange={setKeepChatsArchived}
                  theme={activeTheme}
                />
                <View style={[styles.chatOptionDivider, { backgroundColor: activeTheme.border }]} />
                <ChatOptionAction
                  icon="time-outline"
                  label="Auto-archive inactive chats"
                  value={autoArchiveAfter}
                  onPress={cycleArchiveAfter}
                  theme={activeTheme}
                />
              </View>

              <Text style={[styles.chatSectionTitle, { color: activeTheme.textMuted }]}>Backup & history</Text>
              <View style={[styles.chatSectionCard, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
                <ChatOptionAction
                  icon="cloud-upload-outline"
                  label="Chat backup"
                  value="Manage"
                  onPress={() => showComingSoon('Chat backup')}
                  theme={activeTheme}
                />
                <View style={[styles.chatOptionDivider, { backgroundColor: activeTheme.border }]} />
                <ChatOptionAction
                  icon="repeat-outline"
                  label="Backup frequency"
                  value={backupFrequency}
                  onPress={cycleBackupFrequency}
                  theme={activeTheme}
                />
                <View style={[styles.chatOptionDivider, { backgroundColor: activeTheme.border }]} />
                <ChatOptionToggle
                  label="Include videos"
                  description="Back up video files"
                  value={backupIncludeVideos}
                  onValueChange={setBackupIncludeVideos}
                  theme={activeTheme}
                />
                <View style={[styles.chatOptionDivider, { backgroundColor: activeTheme.border }]} />
                <ChatOptionToggle
                  label="Backup over Wi-Fi only"
                  description="Avoid cellular data usage"
                  value={backupWifiOnly}
                  onValueChange={setBackupWifiOnly}
                  theme={activeTheme}
                />
                <View style={[styles.chatOptionDivider, { backgroundColor: activeTheme.border }]} />
                <ChatOptionAction
                  icon="time-outline"
                  label="Chat history"
                  value="Export or clear"
                  onPress={() => showComingSoon('Chat history')}
                  theme={activeTheme}
                />
                <View style={[styles.chatOptionDivider, { backgroundColor: activeTheme.border }]} />
                <ChatOptionAction
                  icon="download-outline"
                  label="Export chat"
                  value="PDF or text"
                  onPress={() => showComingSoon('Export chat')}
                  theme={activeTheme}
                />
                <View style={[styles.chatOptionDivider, { backgroundColor: activeTheme.border }]} />
                <ChatOptionAction
                  icon="trash-outline"
                  label="Auto-delete old chats"
                  value={historyRetention}
                  onPress={cycleHistoryRetention}
                  theme={activeTheme}
                />
              </View>

              <Text style={[styles.chatSectionTitle, { color: activeTheme.textMuted }]}>Educational & collaboration</Text>
              <View style={[styles.chatSectionCard, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
                <ChatOptionToggle
                  label="Focus mode"
                  description="Auto-mute chats during study sessions"
                  value={focusMode}
                  onValueChange={setFocusMode}
                  theme={activeTheme}
                />
                <View style={[styles.chatOptionDivider, { backgroundColor: activeTheme.border }]} />
                <ChatOptionAction
                  icon="pin-outline"
                  label="Pinned messages limit"
                  value={pinnedLimit}
                  onPress={cyclePinnedLimit}
                  theme={activeTheme}
                />
                <View style={[styles.chatOptionDivider, { backgroundColor: activeTheme.border }]} />
                <ChatOptionAction
                  icon="book-outline"
                  label="Study group resources"
                  value="Files, notes, links"
                  onPress={() => showComingSoon('Study group resources')}
                  theme={activeTheme}
                />
                <View style={[styles.chatOptionDivider, { backgroundColor: activeTheme.border }]} />
                <ChatOptionAction
                  icon="chatbubble-ellipses-outline"
                  label="Quick replies"
                  value="Create templates"
                  onPress={() => showComingSoon('Quick replies')}
                  theme={activeTheme}
                />
              </View>

              <Text style={[styles.chatSectionTitle, { color: activeTheme.textMuted }]}>Accessibility</Text>
              <View style={[styles.chatSectionCard, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
                <ChatOptionToggle
                  label="High contrast text"
                  description="Improve readability"
                  value={highContrastText}
                  onValueChange={setHighContrastText}
                  theme={activeTheme}
                />
                <View style={[styles.chatOptionDivider, { backgroundColor: activeTheme.border }]} />
                <ChatOptionToggle
                  label="Screen reader optimization"
                  description="Enable detailed descriptions"
                  value={screenReaderOptim}
                  onValueChange={setScreenReaderOptim}
                  theme={activeTheme}
                />
                <View style={[styles.chatOptionDivider, { backgroundColor: activeTheme.border }]} />
                <ChatOptionToggle
                  label="Reduce motion"
                  description="Disable chat animations"
                  value={reduceMotion}
                  onValueChange={setReduceMotion}
                  theme={activeTheme}
                />
              </View>

              <Text style={[styles.chatSectionTitle, { color: activeTheme.textMuted }]}>Advanced</Text>
              <View style={[styles.chatSectionCard, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
                <ChatOptionToggle
                  label="Language translation"
                  description="Auto-translate messages"
                  value={languageTranslation}
                  onValueChange={setLanguageTranslation}
                  theme={activeTheme}
                />
                <View style={[styles.chatOptionDivider, { backgroundColor: activeTheme.border }]} />
                <ChatOptionAction
                  icon="folder-outline"
                  label="Chat folders"
                  value="Organize chats"
                  onPress={() => showComingSoon('Chat folders')}
                  theme={activeTheme}
                />
                <View style={[styles.chatOptionDivider, { backgroundColor: activeTheme.border }]} />
                <ChatOptionAction
                  icon="search-outline"
                  label="Message search"
                  value="Search by keyword or media"
                  onPress={() => showComingSoon('Message search')}
                  theme={activeTheme}
                />
              </View>
            </ScrollView>
          </View>
        </BlurView>
      </Modal>

      {/* Message Drawer Menu */}
      <Modal visible={showMenuModal} animationType="fade" transparent>
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.menuOverlay, { backgroundColor: 'rgba(0,0,0,0.12)' }]}
          onPress={() => setShowMenuModal(false)}
        >
          <TouchableOpacity activeOpacity={1} style={[styles.menuCard, { backgroundColor: activeTheme.background, borderColor: activeTheme.border }]}>
            <MenuOption
              label="Amplify"
              icon="megaphone-outline"
              theme={activeTheme}
              onPress={() => {
                setShowMenuModal(false);
                router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'advertise', from: 'pulse', returnTo: 'menu' } });
              }}
            />
            <MenuOption
              label="The Hive Mind"
              icon="git-network-outline"
              theme={activeTheme}
              onPress={() => {
                setShowMenuModal(false);
                router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'hive-mind', from: 'pulse', returnTo: 'menu' } });
              }}
            />
            <MenuOption
              label="The Circle"
              icon="people-circle-outline"
              theme={activeTheme}
              onPress={() => {
                setShowMenuModal(false);
                router.push({ pathname: '/groups/new', params: { from: 'pulse', returnTo: 'menu' } });
              }}
            />
            <MenuOption
              label="New Hub"
              icon="planet-outline"
              theme={activeTheme}
              onPress={() => {
                setShowMenuModal(false);
                router.push({ pathname: '/communities/new', params: { from: 'pulse', returnTo: 'menu' } });
              }}
            />
            <MenuOption
              label="The Echo"
              icon="radio-outline"
              theme={activeTheme}
              onPress={() => {
                setShowMenuModal(false);
                router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'new-broadcast', from: 'pulse', returnTo: 'menu' } });
              }}
            />
            <MenuOption
              label="Hubs"
              icon="apps-outline"
              theme={activeTheme}
              onPress={() => {
                setShowMenuModal(false);
                setShowGroupsModal(true);
              }}
            />
            <MenuOption
              label="Coded Tags"
              icon="code-slash-outline"
              theme={activeTheme}
              onPress={() => {
                setShowMenuModal(false);
                router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'chat-labels', from: 'pulse', returnTo: 'menu' } });
              }}
            />
            <MenuOption
              label="Sync Nexus"
              icon="sync-outline"
              theme={activeTheme}
              onPress={() => {
                setShowMenuModal(false);
                router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'linked-devices', from: 'pulse', returnTo: 'menu' } });
              }}
            />
            <MenuOption
              label="Vault"
              icon="lock-closed-outline"
              theme={activeTheme}
              onPress={() => {
                setShowMenuModal(false);
                router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'starred-messages', from: 'pulse', returnTo: 'menu' } });
              }}
            />
            <MenuOption
              label="Control Deck"
              icon="construct-outline"
              theme={activeTheme}
              onPress={() => {
                setShowMenuModal(false);
                setShowChatSettingsModal(true);
              }}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Groups & Communities Modal */}
      <Modal visible={showGroupsModal} animationType="slide" transparent presentationStyle="overFullScreen">
        <BlurView intensity={80} tint={activeTheme === Theme.dark ? 'dark' : 'light'} style={[styles.settingsModalContainer, { backgroundColor: activeTheme.background + 'CC' }]}>
          <View style={[styles.settingsModal, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
            <View style={styles.settingsModalHeader}>
              <Text style={[styles.settingsModalTitle, { color: activeTheme.text }]}>Groups & Communities</Text>
              <TouchableOpacity onPress={() => setShowGroupsModal(false)}>
                <Ionicons name="close-outline" size={16} color={activeTheme.text} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <SettingsOption
                icon="people-outline"
                label="Create Group"
                theme={activeTheme}
                onPress={() => {
                  setShowGroupsModal(false);
                  router.push({ pathname: '/groups/new', params: { from: 'pulse', returnTo: 'groups' } });
                }}
              />
              <SettingsOption
                icon="earth-outline"
                label="Create Community"
                theme={activeTheme}
                onPress={() => {
                  setShowGroupsModal(false);
                  router.push({ pathname: '/communities/new', params: { from: 'pulse', returnTo: 'groups' } });
                }}
              />
              <View style={[styles.dividerSection, { backgroundColor: activeTheme.border }]} />
              <SettingsOption
                icon="list-outline"
                label="Your Groups"
                theme={activeTheme}
                onPress={() => {
                  setShowGroupsModal(false);
                  router.push({ pathname: '/groups', params: { from: 'pulse', returnTo: 'groups' } });
                }}
              />
              <SettingsOption
                icon="globe-outline"
                label="Your Communities"
                theme={activeTheme}
                onPress={() => {
                  setShowGroupsModal(false);
                  router.push({ pathname: '/communities', params: { from: 'pulse', returnTo: 'groups' } });
                }}
              />
              <View style={[styles.dividerSection, { backgroundColor: activeTheme.border }]} />
              <Text style={[styles.groupSectionTitle, { color: activeTheme.textMuted }]}>Discovery & exploration</Text>
              <SettingsOption
                icon="compass-outline"
                label="Discover groups & communities"
                theme={activeTheme}
                onPress={() => {
                  setShowGroupsModal(false);
                  router.push({
                    pathname: '/settings-detail/[slug]',
                    params: { slug: 'discover-groups', from: 'pulse', returnTo: 'groups' },
                  });
                }}
              />
              <SettingsOption
                icon="search-outline"
                label="Search groups"
                theme={activeTheme}
                onPress={() => {
                  setShowGroupsModal(false);
                  router.push({
                    pathname: '/settings-detail/[slug]',
                    params: { slug: 'search-groups', from: 'pulse', returnTo: 'groups' },
                  });
                }}
              />
              <SettingsOption
                icon="grid-outline"
                label="Categories"
                theme={activeTheme}
                onPress={() => {
                  setShowGroupsModal(false);
                  router.push({
                    pathname: '/settings-detail/[slug]',
                    params: { slug: 'group-categories', from: 'pulse', returnTo: 'groups' },
                  });
                }}
              />
              <SettingsOption
                icon="trending-up-outline"
                label="Trending / popular"
                theme={activeTheme}
                onPress={() => {
                  setShowGroupsModal(false);
                  router.push({
                    pathname: '/settings-detail/[slug]',
                    params: { slug: 'trending-groups', from: 'pulse', returnTo: 'groups' },
                  });
                }}
              />
              <SettingsOption
                icon="location-outline"
                label="Nearby groups"
                theme={activeTheme}
                onPress={() => {
                  setShowGroupsModal(false);
                  router.push({
                    pathname: '/settings-detail/[slug]',
                    params: { slug: 'nearby-groups', from: 'pulse', returnTo: 'groups' },
                  });
                }}
              />

              <View style={[styles.dividerSection, { backgroundColor: activeTheme.border }]} />
              <Text style={[styles.groupSectionTitle, { color: activeTheme.textMuted }]}>Invitations & requests</Text>
              <SettingsOption
                icon="mail-open-outline"
                label="Pending invites"
                theme={activeTheme}
                onPress={() => {
                  setShowGroupsModal(false);
                  router.push({
                    pathname: '/settings-detail/[slug]',
                    params: { slug: 'pending-invites', from: 'pulse', returnTo: 'groups' },
                  });
                }}
              />
              <SettingsOption
                icon="paper-plane-outline"
                label="Join requests sent"
                theme={activeTheme}
                onPress={() => {
                  setShowGroupsModal(false);
                  router.push({
                    pathname: '/settings-detail/[slug]',
                    params: { slug: 'join-requests-sent', from: 'pulse', returnTo: 'groups' },
                  });
                }}
              />
              <SettingsOption
                icon="bookmark-outline"
                label="Saved groups"
                theme={activeTheme}
                onPress={() => {
                  setShowGroupsModal(false);
                  router.push({
                    pathname: '/settings-detail/[slug]',
                    params: { slug: 'saved-groups', from: 'pulse', returnTo: 'groups' },
                  });
                }}
              />
              <SettingsOption
                icon="archive-outline"
                label="Archived groups"
                theme={activeTheme}
                onPress={() => {
                  setShowGroupsModal(false);
                  router.push({
                    pathname: '/settings-detail/[slug]',
                    params: { slug: 'archived-groups', from: 'pulse', returnTo: 'groups' },
                  });
                }}
              />

              <View style={[styles.dividerSection, { backgroundColor: activeTheme.border }]} />
              <Text style={[styles.groupSectionTitle, { color: activeTheme.textMuted }]}>Management & settings</Text>
              <SettingsOption
                icon="shield-checkmark-outline"
                label="Groups you admin / moderate"
                theme={activeTheme}
                onPress={() => {
                  setShowGroupsModal(false);
                  router.push({
                    pathname: '/settings-detail/[slug]',
                    params: { slug: 'groups-admin', from: 'pulse', returnTo: 'groups' },
                  });
                }}
              />
              <SettingsOption
                icon="people-circle-outline"
                label="Member management"
                theme={activeTheme}
                onPress={() => {
                  setShowGroupsModal(false);
                  router.push({
                    pathname: '/settings-detail/[slug]',
                    params: { slug: 'member-management', from: 'pulse', returnTo: 'groups' },
                  });
                }}
              />
              <SettingsOption
                icon="person-add-outline"
                label="Pending member requests"
                theme={activeTheme}
                onPress={() => {
                  setShowGroupsModal(false);
                  router.push({
                    pathname: '/settings-detail/[slug]',
                    params: { slug: 'pending-member-requests', from: 'pulse', returnTo: 'groups' },
                  });
                }}
              />
              <SettingsOption
                icon="flag-outline"
                label="Reported content"
                theme={activeTheme}
                onPress={() => {
                  setShowGroupsModal(false);
                  router.push({
                    pathname: '/settings-detail/[slug]',
                    params: { slug: 'reported-content', from: 'pulse', returnTo: 'groups' },
                  });
                }}
              />
              <SettingsOption
                icon="bar-chart-outline"
                label="Group analytics"
                theme={activeTheme}
                onPress={() => {
                  setShowGroupsModal(false);
                  router.push({
                    pathname: '/settings-detail/[slug]',
                    params: { slug: 'group-analytics', from: 'pulse', returnTo: 'groups' },
                  });
                }}
              />

              <View style={[styles.dividerSection, { backgroundColor: activeTheme.border }]} />
              <Text style={[styles.groupSectionTitle, { color: activeTheme.textMuted }]}>Activity & notifications</Text>
              <SettingsOption
                icon="notifications-outline"
                label="Unread activity"
                theme={activeTheme}
                onPress={() => {
                  setShowGroupsModal(false);
                  router.push({
                    pathname: '/settings-detail/[slug]',
                    params: { slug: 'group-unread-activity', from: 'pulse', returnTo: 'groups' },
                  });
                }}
              />
              <SettingsOption
                icon="notifications-off-outline"
                label="Notification preferences"
                theme={activeTheme}
                onPress={() => {
                  setShowGroupsModal(false);
                  router.push({
                    pathname: '/settings-detail/[slug]',
                    params: { slug: 'group-notification-preferences', from: 'pulse', returnTo: 'groups' },
                  });
                }}
              />
              <SettingsOption
                icon="newspaper-outline"
                label="Activity feed"
                theme={activeTheme}
                onPress={() => {
                  setShowGroupsModal(false);
                  router.push({
                    pathname: '/settings-detail/[slug]',
                    params: { slug: 'group-activity-feed', from: 'pulse', returnTo: 'groups' },
                  });
                }}
              />

              <View style={[styles.dividerSection, { backgroundColor: activeTheme.border }]} />
              <Text style={[styles.groupSectionTitle, { color: activeTheme.textMuted }]}>Interaction & engagement</Text>
              <SettingsOption
                icon="sparkles-outline"
                label="Suggested groups"
                theme={activeTheme}
                onPress={() => {
                  setShowGroupsModal(false);
                  router.push({
                    pathname: '/settings-detail/[slug]',
                    params: { slug: 'suggested-groups', from: 'pulse', returnTo: 'groups' },
                  });
                }}
              />
              <SettingsOption
                icon="qr-code-outline"
                label="Invite friends"
                theme={activeTheme}
                onPress={() => {
                  setShowGroupsModal(false);
                  router.push({
                    pathname: '/settings-detail/[slug]',
                    params: { slug: 'invite-friends', from: 'pulse', returnTo: 'groups' },
                  });
                }}
              />
              <SettingsOption
                icon="calendar-outline"
                label="Create event"
                theme={activeTheme}
                onPress={() => {
                  setShowGroupsModal(false);
                  router.push({
                    pathname: '/settings-detail/[slug]',
                    params: { slug: 'create-event', from: 'pulse', returnTo: 'groups' },
                  });
                }}
              />
              <SettingsOption
                icon="help-circle-outline"
                label="Polls & questions"
                theme={activeTheme}
                onPress={() => {
                  setShowGroupsModal(false);
                  router.push({
                    pathname: '/settings-detail/[slug]',
                    params: { slug: 'polls-and-questions', from: 'pulse', returnTo: 'groups' },
                  });
                }}
              />

              <View style={[styles.dividerSection, { backgroundColor: activeTheme.border }]} />
              <Text style={[styles.groupSectionTitle, { color: activeTheme.textMuted }]}>Additional utilities</Text>
              <SettingsOption
                icon="time-outline"
                label="Frequently visited"
                theme={activeTheme}
                onPress={() => {
                  setShowGroupsModal(false);
                  router.push({
                    pathname: '/settings-detail/[slug]',
                    params: { slug: 'frequently-visited', from: 'pulse', returnTo: 'groups' },
                  });
                }}
              />
              <SettingsOption
                icon="git-network-outline"
                label="Groups in common"
                theme={activeTheme}
                onPress={() => {
                  setShowGroupsModal(false);
                  router.push({
                    pathname: '/settings-detail/[slug]',
                    params: { slug: 'groups-in-common', from: 'pulse', returnTo: 'groups' },
                  });
                }}
              />
              <SettingsOption
                icon="download-outline"
                label="Export group data"
                theme={activeTheme}
                onPress={() => {
                  setShowGroupsModal(false);
                  router.push({
                    pathname: '/settings-detail/[slug]',
                    params: { slug: 'export-group-data', from: 'pulse', returnTo: 'groups' },
                  });
                }}
              />
            </ScrollView>
          </View>
        </BlurView>
      </Modal>

      {/* New chat modal */}
      <Modal visible={showNewChat} animationType="slide" presentationStyle="fullScreen">
        <NewChatView
          theme={activeTheme}
          onClose={() => setShowNewChat(false)}
          onStartChat={(contact) => {
            setShowNewChat(false);
            setSelectedUser({ name: contact.name, color: contact.color });
          }}
        />
      </Modal>
    </View>
  );
}

function NewChatView({
  theme,
  onClose,
  onStartChat,
}: {
  theme: any;
  onClose: () => void;
  onStartChat: (contact: { name: string; color: string }) => void;
}) {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const quickActions = [
    { id: 'group', label: 'New group', icon: 'people-outline' as const },
    { id: 'contact', label: 'New contact', icon: 'person-outline' as const, rightIcon: 'qr-code-outline' as const, variant: 'contact' as const },
    { id: 'community', label: 'New community', icon: 'people-circle-outline' as const },
    { id: 'study-room', label: 'Start study room', icon: 'mic-outline' as const },
  ];

  const frequentContacts = [
    { id: 'akpo', name: 'Akpo Son', color: '#16A34A' },
    { id: 'destiny', name: 'Destiny Okrieh', color: '#F59E0B' },
    { id: 'daniel', name: 'Daniel (Comp E)', color: '#A855F7' },
    { id: 'abazi', name: 'Abazi (Uyo)', color: '#6366F1' },
    { id: 'obongo', name: 'Obongono Edet (DLCF)', color: '#0EA5E9' },
  ];

  const allContacts = [
    { id: 'me', name: 'My Number (You)', color: '#0EA5E9' },
    { id: 'zaddy', name: '(Zaddy) bngs', color: '#F97316' },
    { id: 'bigchesa', name: 'BigChesa (Comp. Engr)', color: '#22C55E' },
    { id: 'abasi', name: 'Abasi Ekeme (DLCF)', color: '#EF4444' },
    { id: 'nora', name: 'Nora James', color: '#14B8A6' },
    { id: 'dayo', name: 'Dayo Bridge', color: '#8B5CF6' },
  ];

  const menuOptions = [
    { id: 'contact-settings', label: 'Contact settings', icon: 'settings-outline' as const },
    { id: 'invite', label: 'Invite a contact', icon: 'person-add-outline' as const },
    { id: 'contacts', label: 'Contacts', icon: 'people-outline' as const },
    { id: 'refresh', label: 'Refresh', icon: 'refresh-outline' as const },
    { id: 'help', label: 'Help', icon: 'help-circle-outline' as const },
    { id: 'scan', label: 'Scan QR', icon: 'qr-code-outline' as const },
    { id: 'nearby', label: 'Nearby learners', icon: 'location-outline' as const },
  ];

  const normalizedQuery = query.trim().toLowerCase();
  const filterList = (list: Array<{ name: string }>) =>
    normalizedQuery ? list.filter((item) => item.name.toLowerCase().includes(normalizedQuery)) : list;

  const filteredFrequent = filterList(frequentContacts);
  const filteredContacts = filterList(allContacts);

  const handleAction = (label: string) => {
    Alert.alert('Coming soon', `${label} is being prepared.`);
  };

  const handleMenuOption = (actionId: string, label: string) => {
    if (actionId === 'contact-settings') {
      navigateAfterClose('/contact-settings', { returnTo: 'new-chat' });
      return;
    }
    handleAction(label);
  };

  const navigateAfterClose = (pathname: string, params?: Record<string, string>) => {
    onClose();
    setTimeout(() => {
      router.push(params ? { pathname, params } : pathname);
    }, 0);
  };

  const handleQuickAction = (actionId: string, label: string) => {
    if (actionId === 'contact') {
      navigateAfterClose('/new-contact', { returnTo: 'new-chat' });
      return;
    }
    if (actionId === 'group') {
      navigateAfterClose('/groups/new', { from: 'pulse' });
      return;
    }
    if (actionId === 'community') {
      navigateAfterClose('/communities/new', { from: 'pulse' });
      return;
    }
    if (actionId === 'study-room') {
      navigateAfterClose('/study-room', { returnTo: 'new-chat' });
      return;
    }
    handleAction(label);
  };

  const getInitials = (name: string) =>
    name
      .replace(/\(.*?\)/g, '')
      .trim()
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

  return (
    <View style={[styles.newChatContainer, { backgroundColor: theme.background }]}>
      <SafeAreaView edges={['top']} style={styles.newChatSafe}>
        <View style={[styles.newChatHeader, { borderBottomColor: theme.border, backgroundColor: theme.background }]}>
          <TouchableOpacity onPress={onClose} style={[styles.newChatIconBtn, { borderColor: theme.border, backgroundColor: theme.card }]}>
            <Ionicons name="chevron-back" size={16} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.newChatTitle, { color: theme.text }]}>New chat</Text>
          <TouchableOpacity onPress={() => setMenuOpen(true)} style={[styles.newChatIconBtn, { borderColor: theme.border, backgroundColor: theme.card }]}>
            <View style={styles.newChatDotStack}>
              <View style={[styles.newChatDot, { backgroundColor: theme.text }]} />
              <View style={[styles.newChatDot, { backgroundColor: theme.text }]} />
              <View style={[styles.newChatDot, { backgroundColor: theme.text }]} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.newChatSearchWrap}>
          <View style={[styles.newChatSearchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="search-outline" size={16} color={theme.textMuted} />
            <TextInput
              style={[styles.newChatSearchInput, { color: theme.text }]}
              placeholder="Search name or number"
              placeholderTextColor={theme.textMuted}
              value={query}
              onChangeText={setQuery}
            />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.newChatScroll}>
          <View style={[styles.newChatCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {quickActions.map((action, index) => (
              <View key={action.id}>
                <TouchableOpacity style={styles.newChatRow} onPress={() => handleQuickAction(action.id, action.label)}>
                  {action.variant === 'contact' ? (
                    <View style={styles.newChatContactIconWrap}>
                      <LinearGradient
                        colors={[Theme.brand.primary, '#4facfe']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.newChatContactIcon}
                      >
                        <Ionicons name={action.icon} size={16} color="#FFFFFF" />
                      </LinearGradient>
                      <View style={styles.newChatContactBadge}>
                        <Ionicons name="add" size={10} color="#FFFFFF" />
                      </View>
                    </View>
                  ) : (
                    <View style={[styles.newChatRowIcon, { backgroundColor: theme.background }]}>
                      <Ionicons name={action.icon} size={16} color={theme.text} />
                    </View>
                  )}
                  <Text style={[styles.newChatRowLabel, { color: theme.text }]}>{action.label}</Text>
                  <Ionicons
                    name={action.rightIcon || 'chevron-forward'}
                    size={16}
                    color={theme.textMuted}
                  />
                </TouchableOpacity>
                {index !== quickActions.length - 1 ? (
                  <View style={[styles.newChatDivider, { backgroundColor: theme.border }]} />
                ) : null}
              </View>
            ))}
          </View>

          <Text style={[styles.newChatSectionLabel, { color: theme.textMuted }]}>Frequently contacted</Text>
          <View style={[styles.newChatCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {filteredFrequent.map((contact, index) => (
              <View key={contact.id}>
                <TouchableOpacity
                  style={styles.newChatRow}
                  onPress={() => onStartChat({ name: contact.name, color: contact.color })}
                >
                  <View style={[styles.newChatAvatar, { backgroundColor: contact.color }]}>
                    <Text style={styles.newChatAvatarText}>{getInitials(contact.name)}</Text>
                  </View>
                  <Text style={[styles.newChatRowLabel, { color: theme.text }]}>{contact.name}</Text>
                  <View style={[styles.newChatSelect, { borderColor: theme.textMuted }]} />
                </TouchableOpacity>
                {index !== filteredFrequent.length - 1 ? (
                  <View style={[styles.newChatDivider, { backgroundColor: theme.border }]} />
                ) : null}
              </View>
            ))}
          </View>

          <Text style={[styles.newChatSectionLabel, { color: theme.textMuted }]}>Contacts on SparkNexa</Text>
          <View style={[styles.newChatCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {filteredContacts.map((contact, index) => (
              <View key={contact.id}>
                <TouchableOpacity
                  style={styles.newChatRow}
                  onPress={() => onStartChat({ name: contact.name, color: contact.color })}
                >
                  <View style={[styles.newChatAvatar, { backgroundColor: contact.color }]}>
                    <Text style={styles.newChatAvatarText}>{getInitials(contact.name)}</Text>
                  </View>
                  <Text style={[styles.newChatRowLabel, { color: theme.text }]}>{contact.name}</Text>
                  <View style={[styles.newChatSelect, { borderColor: theme.textMuted }]} />
                </TouchableOpacity>
                {index !== filteredContacts.length - 1 ? (
                  <View style={[styles.newChatDivider, { backgroundColor: theme.border }]} />
                ) : null}
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>

      {menuOpen ? (
        <TouchableOpacity style={styles.newChatMenuOverlay} activeOpacity={1} onPress={() => setMenuOpen(false)}>
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.newChatMenuCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            {menuOptions.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.newChatMenuItem}
                onPress={() => {
                  setMenuOpen(false);
                  handleMenuOption(item.id, item.label);
                }}
              >
                <View style={[styles.newChatMenuIcon, { backgroundColor: theme.background }]}>
                  <Ionicons name={item.icon} size={16} color={theme.text} />
                </View>
                <Text style={[styles.newChatMenuLabel, { color: theme.text }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </TouchableOpacity>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function DirectMessageView({
  user,
  theme,
  onClose,
}: {
  user: { name: string; color: string } | null;
  theme: any;
  onClose: () => void;
}) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState('0:00');
  const [recordingTimer, setRecordingTimer] = useState<ReturnType<typeof setInterval> | null>(null);
  const [showDmMenu, setShowDmMenu] = useState(false);
  const [showDmMoreMenu, setShowDmMoreMenu] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [showMessageMenu, setShowMessageMenu] = useState(false);
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const attachmentsAnim = useRef(new Animated.Value(0)).current;
  const displayName = user?.name || 'Alex Rivera';
  const displaySub = 'Secure chat';

  const messages = [
    { id: 'm1', text: 'Establishing secure connection...', isMe: false, status: 'read' },
    { id: 'm2', text: 'The new UI components are ready for deployment.', isMe: true, status: 'read' },
    { id: 'm3', text: 'Excellent. Synced to the main branch.', isMe: false, status: 'sent' },
  ];

  const selectionMenuOptions = [
    { id: 'thread', label: 'Open thread', icon: 'chatbubble-ellipses-outline' as const },
    { id: 'verify', label: 'Validate key', icon: 'shield-checkmark-outline' as const },
    { id: 'glow', label: 'Glow mark', icon: 'sparkles-outline' as const },
    { id: 'clip', label: 'Clip text', icon: 'copy-outline' as const },
    { id: 'revise', label: 'Revise', icon: 'create-outline' as const },
    { id: 'anchor', label: 'Anchor', icon: 'pin-outline' as const },
    { id: 'capsule', label: 'Save to capsule', icon: 'document-text-outline' as const },
    { id: 'echo', label: 'Quick echo', icon: 'flash-outline' as const },
  ];

  const clearSelection = () => {
    setSelectedMessageId(null);
    setShowMessageMenu(false);
  };

  const startRecording = async () => {
    setIsRecording(true);
    let secs = 0;
    const interval = setInterval(() => {
      secs += 1;
      const mins = Math.floor(secs / 60);
      const s = secs % 60;
      setRecordDuration(`${mins}:${s < 10 ? '0' : ''}${s}`);
    }, 1000);
    setRecordingTimer(interval);
  };

  const stopRecording = async (send = true) => {
    if (!recordingTimer) return;
    clearInterval(recordingTimer);
    setRecordingTimer(null);
    setIsRecording(false);
    setRecordDuration('0:00');
    if (send) Alert.alert('Sent', 'Neural audio encrypted.');
  };

  const toggleAttachments = () => {
    const next = !attachmentsOpen;
    setAttachmentsOpen(next);
    Animated.timing(attachmentsAnim, {
      toValue: next ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.dmContainer, { backgroundColor: theme.background }]}>
      {selectedMessageId ? (
        <View style={[styles.dmSelectHeader, { borderBottomColor: theme.border, backgroundColor: theme.card }]}>
          <TouchableOpacity onPress={clearSelection} style={[styles.backBtn, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <Ionicons name="chevron-back" size={16} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.dmSelectCount, { color: theme.text }]}>1</Text>
          <View style={styles.dmSelectActions}>
            <TouchableOpacity style={[styles.dmActionBtn, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <Ionicons name="return-up-back-outline" size={16} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.dmActionBtn, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <Ionicons name="information-circle-outline" size={16} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.dmActionBtn, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <Ionicons name="trash-outline" size={16} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.dmActionBtn, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <Ionicons name="arrow-redo-outline" size={16} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dmActionBtn, { backgroundColor: theme.background, borderColor: theme.border }]}
              onPress={() => setShowMessageMenu(true)}
            >
              <Ionicons name="ellipsis-vertical" size={16} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={[styles.dmHeader, { borderBottomColor: theme.border, backgroundColor: theme.background }]}>
          <TouchableOpacity onPress={onClose} style={[styles.backBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="chevron-back" size={16} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.dmHeaderUser}>
            <View style={[styles.dmAvatar, { backgroundColor: user?.color || Theme.brand.primary }]}>
              <Text style={styles.dmAvatarText}>{displayName.charAt(0)}</Text>
            </View>
            <View style={styles.dmHeaderText}>
              <Text style={[styles.dmName, { color: theme.text }]}>{displayName}</Text>
              <Text style={[styles.dmSub, { color: theme.textMuted }]}>{displaySub}</Text>
            </View>
          </View>
          <View style={styles.dmHeaderActions}>
            <TouchableOpacity style={[styles.dmActionBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons name="call-outline" size={16} color={Theme.brand.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.dmActionBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons name="videocam-outline" size={16} color={Theme.brand.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dmActionBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => setShowDmMenu(true)}
            >
              <Ionicons name="ellipsis-vertical" size={16} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal visible={showDmMenu} transparent animationType="fade" onRequestClose={() => setShowDmMenu(false)}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.dmMenuOverlay}
          onPress={() => setShowDmMenu(false)}
        >
          <TouchableOpacity activeOpacity={1} style={[styles.dmMenuCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <DmMenuItem label="Mute notifications" icon="notifications-off-outline" theme={theme} onPress={() => setShowDmMenu(false)} />
            <DmMenuItem label="Media, links, and docs" icon="document-text-outline" theme={theme} onPress={() => setShowDmMenu(false)} />
            <DmMenuItem label="Search" icon="search-outline" theme={theme} onPress={() => setShowDmMenu(false)} />
            <DmMenuItem
              label="Disappearing messages"
              icon="time-outline"
              theme={theme}
              onPress={() => {
                const name = displayName;
                const color = user?.color || Theme.brand.primary;
                setShowDmMenu(false);
                router.push({
                  pathname: '/disappearing-messages',
                  params: { returnTo: 'dm', dmName: name, dmColor: color },
                });
              }}
            />
            <DmMenuItem
              label="Chat theme"
              icon="color-palette-outline"
              theme={theme}
              onPress={() => {
                const name = displayName;
                const color = user?.color || Theme.brand.primary;
                setShowDmMenu(false);
                router.push({
                  pathname: '/chat-theme',
                  params: { returnTo: 'dm', dmName: name, dmColor: color },
                });
              }}
            />
            <TouchableOpacity
              style={styles.dmMenuItem}
              onPress={() => {
                setShowDmMenu(false);
                setShowDmMoreMenu(true);
              }}
            >
              <View style={styles.dmMenuLeft}>
                <View style={[styles.dmMenuIconBox, { backgroundColor: theme.background }]}>
                  <Ionicons name="ellipsis-horizontal" size={16} color={theme.text} />
                </View>
                <Text style={[styles.dmMenuLabel, { color: theme.text }]}>More</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showDmMoreMenu} transparent animationType="fade" onRequestClose={() => setShowDmMoreMenu(false)}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.dmMenuOverlay}
          onPress={() => setShowDmMoreMenu(false)}
        >
          <TouchableOpacity activeOpacity={1} style={[styles.dmMenuCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <DmMenuItem label="Clear chat" icon="trash-outline" theme={theme} onPress={() => setShowDmMoreMenu(false)} />
            <DmMenuItem label="Export chat" icon="download-outline" theme={theme} onPress={() => setShowDmMoreMenu(false)} />
            <DmMenuItem label="Add shortcut" icon="add-circle-outline" theme={theme} onPress={() => setShowDmMoreMenu(false)} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showMessageMenu} transparent animationType="fade" onRequestClose={() => setShowMessageMenu(false)}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.messageMenuOverlay}
          onPress={() => setShowMessageMenu(false)}
        >
          <TouchableOpacity activeOpacity={1} style={[styles.messageMenuCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
            {selectionMenuOptions.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.messageMenuItem}
                onPress={() => setShowMessageMenu(false)}
              >
                <View style={[styles.messageMenuIcon, { backgroundColor: theme.card }]}>
                  <Ionicons name={item.icon} size={16} color={theme.text} />
                </View>
                <Text style={[styles.messageMenuLabel, { color: theme.text }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <ScrollView contentContainerStyle={styles.dmScroll}>
        {messages.map((item) => (
          <ChatBubble
            key={item.id}
            message={item.text}
            isMe={item.isMe}
            theme={theme}
            status={item.status}
            selected={selectedMessageId === item.id}
            onLongPress={() => {
              setSelectedMessageId(item.id);
              setShowMessageMenu(true);
            }}
          />
        ))}
      </ScrollView>

      <View style={[styles.dmInputArea, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <Animated.View
          pointerEvents={attachmentsOpen ? 'auto' : 'none'}
          style={[
            styles.attachmentsTray,
            {
              height: attachmentsAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 48] }),
              opacity: attachmentsAnim,
              marginBottom: attachmentsAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 8] }),
            },
          ]}
        >
          <TouchableOpacity style={[styles.attachOption, { backgroundColor: theme.cardElevated, borderColor: theme.border }]}>
            <Ionicons name="camera-outline" size={16} color={Theme.brand.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.attachOption, { backgroundColor: theme.cardElevated, borderColor: theme.border }]}>
            <Ionicons name="document-text-outline" size={16} color={Theme.brand.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.attachOption, { backgroundColor: theme.cardElevated, borderColor: theme.border }]}>
            <Ionicons name="image-outline" size={16} color={Theme.brand.primary} />
          </TouchableOpacity>
        </Animated.View>
        {!isRecording ? (
          <View style={styles.inputInner}>
            <TouchableOpacity style={styles.inputAdd} onPress={toggleAttachments}>
              <LinearGradient
                colors={Theme.brand.primaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.inputAddInner, attachmentsOpen && styles.inputAddInnerActive]}
              >
                <Ionicons name="add" size={16} color="#FFFFFF" style={styles.inputAddIcon} />
              </LinearGradient>
            </TouchableOpacity>
            <TextInput
              style={[styles.dmInput, { color: theme.text }]}
              placeholder="Type a secure message..."
              placeholderTextColor={theme.textMuted}
              value={message}
              onChangeText={setMessage}
            />
            {message.length > 0 ? (
              <TouchableOpacity style={[styles.sendBtn, { backgroundColor: Theme.brand.primary }]}>
                <Ionicons name="arrow-up" size={16} color="#FFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPressIn={startRecording} style={[styles.micBtn, { backgroundColor: theme.border }]}>
                <Ionicons name="mic-outline" size={16} color={theme.text} />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.recordingRow}>
            <View style={styles.recordingIndicator}>
              <View style={styles.redDot} />
              <Text style={[styles.recordTime, { color: theme.text }]}>{recordDuration}</Text>
            </View>
            <Text style={[styles.swipeCancel, { color: theme.textMuted }]}>Release to send</Text>
            <TouchableOpacity onPressOut={() => stopRecording(true)} style={styles.stopBtn}>
              <Ionicons name="stop" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function ChatBubble({ message, isMe, theme, status, onLongPress, selected }: any) {
  return (
    <View style={[styles.bubbleWrapper, isMe ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }]}>
      <TouchableOpacity activeOpacity={0.9} onLongPress={onLongPress}>
        <LinearGradient
          colors={isMe ? Theme.brand.primaryGradient : ([theme.card, theme.cardElevated] as [string, string, ...string[]])}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.bubble,
            isMe ? styles.bubbleMe : styles.bubbleThem,
            { borderColor: theme.border, borderWidth: isMe ? 0 : 1 },
            selected && styles.bubbleSelected,
          ]}
        >
          <Text style={[styles.bubbleText, { color: isMe ? '#FFF' : theme.text }]}>{message}</Text>
          <View style={styles.bubbleFooter}>
            <Text style={[styles.timeText, { color: isMe ? 'rgba(255,255,255,0.7)' : theme.textMuted }]}>12:04</Text>
            {isMe && (
              <Ionicons
                name={status === 'read' ? 'checkmark-done' : 'checkmark'}
                size={16}
                color={status === 'read' ? '#FFF' : 'rgba(255,255,255,0.5)'}
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

function ChatOptionAction({ icon, label, value, onPress, theme }: any) {
  return (
    <TouchableOpacity style={styles.chatOptionRow} onPress={onPress} disabled={!onPress}>
      <View style={styles.chatOptionMain}>
        {icon ? (
          <View style={[styles.chatOptionIcon, { backgroundColor: theme.background }]}>
            <Ionicons name={icon as any} size={16} color={theme.text} />
          </View>
        ) : null}
        <View style={styles.chatOptionTextWrap}>
          <Text style={[styles.chatOptionLabel, { color: theme.text }]}>{label}</Text>
          {value ? <Text style={[styles.chatOptionSub, { color: theme.textMuted }]}>{value}</Text> : null}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
    </TouchableOpacity>
  );
}

function ChatOptionToggle({ label, description, value, onValueChange, theme }: any) {
  return (
    <View style={styles.chatOptionRow}>
      <View style={styles.chatOptionMain}>
        <View style={styles.chatOptionTextWrap}>
          <Text style={[styles.chatOptionLabel, { color: theme.text }]}>{label}</Text>
          <Text style={[styles.chatOptionSub, { color: theme.textMuted }]}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.border, true: Theme.brand.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

function SettingsOption({ icon, label, theme, onPress }: any) {
  return (
    <TouchableOpacity style={styles.settingsOption} onPress={onPress} disabled={!onPress}>
      <View style={[styles.optionIconBox, { backgroundColor: theme.background }]}>
        <Ionicons name={icon as any} size={16} color={theme.text} />
      </View>
      <Text style={[styles.optionLabel, { color: theme.text }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
    </TouchableOpacity>
  );
}

function OnlineNodeCard({
  node,
  theme,
  onPress,
}: {
  node: OnlineNode;
  theme: any;
  onPress: () => void;
}) {
  const initials = node.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <TouchableOpacity style={styles.nodeCard} onPress={onPress}>
      <View style={[styles.nodeAvatarWrap, { borderColor: theme.border }]}>
        <LinearGradient colors={[node.color, Theme.brand.primary]} style={styles.nodeAvatar}>
          <Text style={styles.nodeAvatarText}>{initials}</Text>
        </LinearGradient>
        <View style={[styles.nodeStatusDot, { backgroundColor: node.statusColor, borderColor: theme.background }]} />
      </View>
      <Text style={[styles.nodeName, { color: theme.text }]} numberOfLines={1}>
        {node.name.split(' ')[0]}
      </Text>
    </TouchableOpacity>
  );
}

function PinnedLinkCard({
  item,
  theme,
  onPress,
}: {
  item: PinnedLink;
  theme: any;
  onPress: () => void;
}) {
  const initials = item.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <TouchableOpacity style={[styles.pinnedCard, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={onPress}>
      <View style={[styles.pinnedAvatar, { backgroundColor: item.color }]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.pinnedContent}>
        <View style={styles.pinnedHeader}>
          <View style={styles.pinnedNameRow}>
            <Text style={[styles.pinnedName, { color: theme.text }]}>{item.name}</Text>
          </View>
          <View style={styles.pinnedMeta}>
            <View style={[styles.pinTimePill, { backgroundColor: theme.cardElevated }]}>
              <Ionicons name="pin" size={12} color={theme.text} />
              <Text style={[styles.pinTimeText, { color: theme.text }]}>{item.time}</Text>
            </View>
            {item.unread ? (
              <View style={[styles.unreadBadge, { backgroundColor: Theme.brand.primary }]}>
                <Text style={styles.unreadText}>{item.unread}</Text>
              </View>
            ) : null}
            <View style={styles.pinnedActions}>
              <ActionIcon icon="call-outline" theme={theme} />
              <ActionIcon icon="videocam-outline" theme={theme} />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function ConversationCard({
  item,
  theme,
  onPress,
}: {
  item: ConversationItem;
  theme: any;
  onPress: () => void;
}) {
  const initials = item.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <TouchableOpacity style={[styles.glassCard, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={onPress}>
      <View style={[styles.messageAvatar, { backgroundColor: item.color }]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={[styles.messageName, { color: theme.text }]}>{item.name}</Text>
          <View style={styles.conversationMeta}>
            <Text style={[styles.messageTime, { color: item.unread ? Theme.brand.primary : theme.textMuted }]}>{item.time}</Text>
            {item.unread ? (
              <View style={[styles.unreadBadge, { backgroundColor: Theme.brand.primary }]}>
                <Text style={styles.unreadText}>{item.unread}</Text>
              </View>
            ) : null}
            <View style={styles.pinnedActions}>
              <ActionIcon icon="call-outline" theme={theme} />
              <ActionIcon icon="videocam-outline" theme={theme} />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function SuggestionCard({ item, theme }: { item: { title: string }; theme: any }) {
  return (
    <View style={[styles.suggestionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={[styles.suggestionIcon, { backgroundColor: theme.background }]}>
        <Ionicons name="sparkles-outline" size={16} color={Theme.brand.primary} />
      </View>
      <View style={styles.suggestionText}>
        <Text style={[styles.suggestionTitle, { color: theme.text }]}>{item.title}</Text>
      </View>
    </View>
  );
}

function ActionIcon({ icon, theme }: { icon: keyof typeof Ionicons.glyphMap; theme: any }) {
  return (
    <View style={[styles.actionIcon, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <Ionicons name={icon} size={14} color={theme.textMuted} />
    </View>
  );
}

function DmMenuItem({ icon, label, theme, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; theme: any; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.dmMenuItem} onPress={onPress}>
      <View style={styles.dmMenuLeft}>
        <View style={[styles.dmMenuIconBox, { backgroundColor: theme.background }]}>
          <Ionicons name={icon} size={16} color={theme.text} />
        </View>
        <Text style={[styles.dmMenuLabel, { color: theme.text }]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

function MenuOption({
  label,
  icon,
  theme,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  theme: any;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuOption} onPress={onPress}>
      <View style={[styles.menuIconBox, { backgroundColor: theme.background }]}>
        <Ionicons name={icon} size={16} color={theme.text} />
      </View>
      <Text style={[styles.menuLabel, { color: theme.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRight: { flexDirection: 'row', gap: 10 },
  newChatContainer: { flex: 1 },
  newChatSafe: { flex: 1 },
  newChatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  newChatTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '900', letterSpacing: -0.4 },
  newChatIconBtn: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  newChatDotStack: { width: 16, height: 16, alignItems: 'center', justifyContent: 'center', gap: 3 },
  newChatDot: { width: 4, height: 4, borderRadius: 2 },
  newChatSearchWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 },
  newChatSearchBar: {
    borderWidth: 1,
    borderRadius: 18,
    height: 44,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  newChatSearchInput: { flex: 1, fontSize: 14, fontWeight: '600' },
  newChatScroll: { paddingBottom: 24 },
  newChatSectionLabel: {
    marginTop: 16,
    marginBottom: 8,
    marginHorizontal: 16,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  newChatCard: { marginHorizontal: 16, borderWidth: 1, borderRadius: 18, overflow: 'hidden' },
  newChatRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 12 },
  newChatRowIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  newChatContactIconWrap: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  newChatContactIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  newChatContactBadge: {
    position: 'absolute',
    right: -2,
    top: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Theme.brand.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  newChatRowLabel: { flex: 1, fontSize: 15, fontWeight: '700' },
  newChatDivider: { height: 1, marginLeft: 60 },
  newChatAvatar: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  newChatAvatarText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  newChatSelect: { width: 20, height: 20, borderRadius: 10, borderWidth: 1 },
  newChatMenuOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 60, paddingRight: 16 },
  newChatMenuCard: { width: 230, borderRadius: 16, borderWidth: 1, paddingVertical: 6, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  newChatMenuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 10 },
  newChatMenuIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  newChatMenuLabel: { fontSize: 14, fontWeight: '600' },
  bgOrb: { position: 'absolute', width: 300, height: 300, borderRadius: 150 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 22, paddingTop: 48, paddingBottom: 10 },
  headerCenter: { flex: 1, marginLeft: 12 },
  searchWrap: { paddingHorizontal: 22, paddingBottom: 14 },
  searchBar: {
    borderWidth: 1,
    borderRadius: 16,
    height: 38,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  searchInput: { flex: 1, fontSize: 13, fontWeight: '600' },
  categoryWrap: { paddingTop: 10, paddingBottom: 2, gap: 8 },
  filterBarWrap: { gap: 10 },
  categoryChip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryChipText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase' },
  headerTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -0.6 },
  iconCircle: { width: 38, height: 38, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  sectionTitle: { fontSize: 12, fontWeight: '900', marginHorizontal: 22, marginTop: 18, marginBottom: 10, letterSpacing: 0.9, textTransform: 'uppercase', opacity: 0.5 },
  sectionStack: { marginHorizontal: 22, gap: 12, marginBottom: 10 },
  storiesContainer: { paddingLeft: 22, marginBottom: 20 },
  nodeCard: { width: 90, marginRight: 6 },
  nodeAvatarWrap: { width: 56, height: 56, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  nodeAvatar: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  nodeAvatarText: { color: '#FFF', fontWeight: '900', fontSize: 14 },
  nodeStatusDot: { position: 'absolute', right: -2, bottom: -2, width: 12, height: 12, borderRadius: 6, borderWidth: 2 },
  nodeName: { fontSize: 12, fontWeight: '800' },
  pinnedCard: { flexDirection: 'row', padding: 14, borderRadius: 20, borderWidth: 1, alignItems: 'center' },
  pinnedAvatar: { width: 44, height: 44, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  pinnedContent: { flex: 1 },
  pinnedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pinnedNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  pinnedName: { fontSize: 14, fontWeight: '800', flex: 1, marginRight: 8 },
  pinnedMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pinnedActions: { flexDirection: 'row', gap: 8 },
  pinTimePill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  pinTimeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  actionIcon: { width: 28, height: 28, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  glassCard: { flexDirection: 'row', marginHorizontal: 22, marginBottom: 14, padding: 14, borderRadius: 20, borderWidth: 1, alignItems: 'center' },
  messageAvatar: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#FFF', fontWeight: '900', fontSize: 14 },
  messageContent: { flex: 1 },
  messageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  messageName: { fontSize: 14, fontWeight: '800', letterSpacing: -0.2, flex: 1, marginRight: 8 },
  messageTime: { fontSize: 10, fontWeight: '700' },
  conversationMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  messageText: { fontSize: 12, flex: 1, fontWeight: '500' },
  unreadBadge: { minWidth: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5, marginLeft: 6 },
  unreadText: { color: '#FFF', fontSize: 8, fontWeight: '900' },
  suggestionCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, borderWidth: 1, gap: 10 },
  suggestionIcon: { width: 32, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  suggestionText: { flex: 1 },
  suggestionTitle: { fontSize: 13, fontWeight: '800' },
  dmContainer: { flex: 1 },
  dmHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12, borderBottomWidth: 1 },
  dmSelectHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12, borderBottomWidth: 1 },
  dmSelectCount: { fontSize: 18, fontWeight: '900', marginLeft: 12, flex: 1 },
  dmSelectActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  dmHeaderUser: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 10 },
  dmHeaderText: { flex: 1 },
  dmAvatar: { width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  dmAvatarText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
  dmName: { fontSize: 16, fontWeight: '900' },
  dmSub: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase', marginTop: 2 },
  dmHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dmActionBtn: { width: 34, height: 34, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  dmScroll: { padding: 20 },
  dmInputArea: { paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20, paddingTop: 15, borderTopWidth: 1 },
  attachmentsTray: { flexDirection: 'row', gap: 10, overflow: 'hidden' },
  attachOption: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dmMenuOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 80, paddingRight: 16 },
  dmMenuCard: { width: 250, borderRadius: 16, borderWidth: 1, paddingVertical: 6, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 10 }, elevation: 6 },
  dmMenuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10 },
  dmMenuLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dmMenuIconBox: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  dmMenuLabel: { fontSize: 14, fontWeight: '600' },
  messageMenuOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 110, paddingRight: 16 },
  messageMenuCard: { width: 230, borderRadius: 18, borderWidth: 1, paddingVertical: 6, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 10 }, elevation: 6 },
  messageMenuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 10 },
  messageMenuIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  messageMenuLabel: { fontSize: 14, fontWeight: '600' },
  inputInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  inputAdd: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  dmInput: { flex: 1, fontSize: 16, height: 45, fontWeight: '500' },
  inputAddInner: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '45deg' }],
    shadowColor: Theme.brand.primary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  inputAddInnerActive: { opacity: 0.85 },
  inputAddIcon: { transform: [{ rotate: '-45deg' }] },
  sendBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  micBtn: { width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  recordingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 45 },
  recordingIndicator: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  redDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF3B30' },
  recordTime: { fontWeight: '900', fontSize: 18, letterSpacing: 1 },
  swipeCancel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', opacity: 0.5 },
  stopBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FF3B30', justifyContent: 'center', alignItems: 'center' },
  bubbleWrapper: { width: '100%', marginBottom: 15 },
  bubble: { padding: 15, borderRadius: 24, maxWidth: '85%' },
  bubbleMe: { borderBottomRightRadius: 4 },
  bubbleThem: { borderBottomLeftRadius: 4 },
  bubbleSelected: { borderWidth: 1, borderColor: Theme.brand.accent, shadowColor: Theme.brand.accent, shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
  bubbleText: { fontSize: 15, lineHeight: 22, fontWeight: '500' },
  bubbleFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 6 },
  timeText: { fontSize: 10, fontWeight: '700' },
  settingsModalContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end' },
  settingsModal: { width: '100%', borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, maxHeight: '80%', paddingBottom: 40 },
  settingsModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  settingsModalTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  chatSectionTitle: { fontSize: 13, fontWeight: '800', marginHorizontal: 20, marginTop: 20, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 },
  chatSectionCard: { marginHorizontal: 16, borderWidth: 1, borderRadius: 18, overflow: 'hidden' },
  chatOptionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  chatOptionMain: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 12 },
  chatOptionIcon: { width: 34, height: 34, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  chatOptionTextWrap: { flex: 1 },
  chatOptionLabel: { fontSize: 16, fontWeight: '700' },
  chatOptionSub: { fontSize: 13, fontWeight: '500', marginTop: 3, lineHeight: 18 },
  chatOptionDivider: { height: 1, marginLeft: 16 },
  groupSectionTitle: { fontSize: 11, fontWeight: '800', marginHorizontal: 20, marginTop: 14, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 },
  settingsOption: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(200,200,200,0.1)' },
  optionIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  optionLabel: { flex: 1, fontSize: 16, fontWeight: '600' },
  dividerSection: { height: 1, marginVertical: 8 },
  menuOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 54, paddingRight: 16 },
  menuCard: { width: 240, borderRadius: 16, borderWidth: 1, paddingVertical: 6 },
  menuOption: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 10 },
  menuIconBox: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { fontSize: 14, fontWeight: '600' },
  fab: { position: 'absolute', bottom: 20, right: 20, width: 68, height: 68, borderRadius: 24, elevation: 10, shadowColor: Theme.brand.primary, shadowOpacity: 0.5, shadowRadius: 15 },
  fabGradient: { flex: 1, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  fabIconWrap: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
  fabIconBadge: {
    position: 'absolute',
    right: -6,
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Theme.brand.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});







