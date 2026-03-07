import { Ionicons } from '@expo/vector-icons';
import { useMemo, useRef, useState } from 'react';
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
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { Theme } from '../constants/Theme';
import { useAppTheme } from '../lib/theme';

type ChatItem = {
  name: string;
  msg: string;
  time: string;
  unread: number;
  color: string;
};

type ChatCategory = 'all' | 'unread' | 'favorites' | 'groups';

const NODE_INITIALS = ['JD', 'SM', 'AK', 'EP', 'LT'];
const CHAT_ITEMS: ChatItem[] = [
  { name: 'Alex Rivera', msg: 'System protocols updated. 🚀', time: 'Now', unread: 1, color: Theme.brand.primary },
  { name: 'Sarah Chen', msg: 'Encrypted voice note', time: '14m', unread: 0, color: '#34C759' },
  { name: 'Dev Ops', msg: 'Server link established.', time: '2h', unread: 0, color: '#7367f0' },
];

const EXTRA_CHAT_ITEMS: ChatItem[] = [
  { name: 'Project Atlas', msg: 'Sprint review starts in 10 minutes.', time: '28m', unread: 3, color: '#FF9500' },
];

const CHAT_METADATA: Record<string, { favorite: boolean; group: boolean }> = {
  'Alex Rivera': { favorite: true, group: false },
  'Sarah Chen': { favorite: false, group: false },
  'Dev Ops': { favorite: true, group: true },
  'Project Atlas': { favorite: false, group: true },
};

const CHAT_CATEGORIES: Array<{ key: ChatCategory; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { key: 'all', label: 'All', icon: 'chatbubbles-outline' },
  { key: 'unread', label: 'Unread', icon: 'mail-unread-outline' },
  { key: 'favorites', label: 'Favorites', icon: 'star-outline' },
  { key: 'groups', label: 'Groups', icon: 'people-circle-outline' },
];

const CHAT_THEME_OPTIONS = ['Default', 'Ocean', 'Sunset', 'Mono'] as const;
const CHAT_FONT_SIZE_OPTIONS = ['Small', 'Medium', 'Large'] as const;

export default function ChatScreen() {
  const { activeTheme, themeMode, setThemeMode } = useAppTheme();
  const [selectedUser, setSelectedUser] = useState<{ name: string; color: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGroupsModal, setShowGroupsModal] = useState(false);
  const [showChatSettingsModal, setShowChatSettingsModal] = useState(false);
  const [newFriend, setNewFriend] = useState('');
  const [activeCategory, setActiveCategory] = useState<ChatCategory>('all');
  const [defaultChatTheme, setDefaultChatTheme] = useState<(typeof CHAT_THEME_OPTIONS)[number]>('Default');
  const [chatFontSize, setChatFontSize] = useState<(typeof CHAT_FONT_SIZE_OPTIONS)[number]>('Small');
  const [enterIsSend, setEnterIsSend] = useState(false);
  const [mediaVisibility, setMediaVisibility] = useState(false);
  const [keepChatsArchived, setKeepChatsArchived] = useState(true);
  const [filtersHidden, setFiltersHidden] = useState(false);
  const filterAnim = useRef(new Animated.Value(0)).current;
  const lastOffsetY = useRef(0);

  const q = searchQuery.trim().toLowerCase();
  const filteredNodes = useMemo(
    () => (q ? NODE_INITIALS.filter((_, i) => `node ${i + 1}`.includes(q)) : NODE_INITIALS),
    [q]
  );
  const filteredChats = useMemo(
    () =>
      [...CHAT_ITEMS, ...EXTRA_CHAT_ITEMS].filter((c) => {
        const matchesSearch = q ? c.name.toLowerCase().includes(q) || c.msg.toLowerCase().includes(q) : true;
        const metadata = CHAT_METADATA[c.name] ?? { favorite: false, group: false };
        const matchesCategory =
          activeCategory === 'all' ||
          (activeCategory === 'unread' && c.unread > 0) ||
          (activeCategory === 'favorites' && metadata.favorite) ||
          (activeCategory === 'groups' && metadata.group);
        return matchesSearch && matchesCategory;
      }),
    [activeCategory, q]
  );

  const cycleDefaultChatTheme = () => {
    const currentIndex = CHAT_THEME_OPTIONS.indexOf(defaultChatTheme);
    const nextIndex = (currentIndex + 1) % CHAT_THEME_OPTIONS.length;
    setDefaultChatTheme(CHAT_THEME_OPTIONS[nextIndex]);
  };

  const cycleChatFontSize = () => {
    const currentIndex = CHAT_FONT_SIZE_OPTIONS.indexOf(chatFontSize);
    const nextIndex = (currentIndex + 1) % CHAT_FONT_SIZE_OPTIONS.length;
    setChatFontSize(CHAT_FONT_SIZE_OPTIONS[nextIndex]);
  };

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
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          accessibilityHint="Return to the previous screen"
        >
          <Ionicons name="chevron-back" size={16} color={activeTheme.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerSubtitle, { color: Theme.brand.primary }]}>NEURAL NETWORK</Text>
          <Text style={[styles.headerTitle, { color: activeTheme.text }]}>Messages</Text>
        </View>
        <View style={styles.headerRight}>  
          <TouchableOpacity
            style={[styles.iconCircle, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}
            onPress={() => setShowChatSettingsModal(true)}
          >
            <Ionicons name="settings-outline" size={16} color={activeTheme.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconCircle, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}
            onPress={() => setShowGroupsModal(true)}
          >
            <Ionicons name="people-outline" size={16} color={activeTheme.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <BlurView intensity={25} tint={activeTheme === Theme.dark ? 'dark' : 'light'} style={[styles.searchBar, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
          <Ionicons name="search-outline" size={16} color={activeTheme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: activeTheme.text }]}
            placeholder="Search conversations..."
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
        contentContainerStyle={{ paddingBottom: 100 }}
        onScroll={onChatScroll}
        scrollEventThrottle={16}
      >
        <Text style={[styles.sectionTitle, { color: activeTheme.text }]}>Online Nodes</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storiesContainer}>
          {filteredNodes.map((initials, i) => (
            <TouchableOpacity
              key={`${initials}-${i}`}
              style={styles.storyItem}
              onPress={() => setSelectedUser({ name: `Node ${i + 1}`, color: Theme.brand.primary })}
            >
              <LinearGradient colors={Theme.brand.primaryGradient} style={styles.storyCircle}>
                <Text style={styles.storyAvatar}>{initials}</Text>
              </LinearGradient>
              <Text style={styles.storyName}>Node {i + 1}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.sectionTitle, { color: activeTheme.text }]}>Neural Links</Text>
        {filteredChats.map((chat) => (
          <ChatCard
            key={chat.name}
            name={chat.name}
            msg={chat.msg}
            time={chat.time}
            unread={chat.unread}
            color={chat.color}
            theme={activeTheme}
            onPress={() => setSelectedUser({ name: chat.name, color: chat.color })}
          />
        ))}
      </ScrollView>
      {/* Floating Action Button - Add Contact */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: Theme.brand.primary }]}
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="person-add" size={16} color="#FFF" />
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
                  label="Media visibility"
                  description="Show newly downloaded media in your device's gallery"
                  value={mediaVisibility}
                  onValueChange={setMediaVisibility}
                  theme={activeTheme}
                />
                <View style={[styles.chatOptionDivider, { backgroundColor: activeTheme.border }]} />
                <ChatOptionAction label="Font size" value={chatFontSize} onPress={cycleChatFontSize} theme={activeTheme} />
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
              </View>

              <View style={[styles.chatSectionCard, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
                <ChatOptionAction icon="cloud-upload-outline" label="Chat backup" theme={activeTheme} />
                <View style={[styles.chatOptionDivider, { backgroundColor: activeTheme.border }]} />
                <ChatOptionAction icon="time-outline" label="Chat history" theme={activeTheme} />
              </View>
            </ScrollView>
          </View>
        </BlurView>
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
              <SettingsOption icon="people-outline" label="Create Group" theme={activeTheme} />
              <SettingsOption icon="earth-outline" label="Create Community" theme={activeTheme} />
              <View style={[styles.dividerSection, { backgroundColor: activeTheme.border }]} />
              <SettingsOption icon="list-outline" label="Your Groups" theme={activeTheme} />
              <SettingsOption icon="globe-outline" label="Your Communities" theme={activeTheme} />
            </ScrollView>
          </View>
        </BlurView>
      </Modal>

      {/* add friend modal */}
      <Modal visible={showAddModal} animationType="fade" transparent>
        <View style={[styles.addModalContainer, { backgroundColor: activeTheme.background + 'DD' }]}> 
          <View style={[styles.addModal, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}> 
            <Text style={[styles.addTitle, { color: activeTheme.text }]}>Add a Contact</Text>
            <TextInput
              style={[styles.addInput, { color: activeTheme.text, borderColor: activeTheme.border }]}
              placeholder="contact number or name"
              placeholderTextColor={activeTheme.textMuted}
              value={newFriend}
              onChangeText={setNewFriend}
            />
            <View style={styles.addActions}>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={[styles.addActionText, { color: activeTheme.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { Alert.alert('Added', `Added ${newFriend}`); setShowAddModal(false); setNewFriend(''); }}>
                <Text style={[styles.addActionText, { color: Theme.brand.primary }]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.dmContainer, { backgroundColor: theme.background }]}>
      <BlurView intensity={40} tint={theme === Theme.dark ? 'dark' : 'light'} style={[styles.dmHeader, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={16} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.dmHeaderUser}>
          <View style={[styles.dmAvatar, { backgroundColor: user?.color || Theme.brand.primary }]}>
            <Text style={styles.dmAvatarText}>{user?.name?.charAt(0)}</Text>
          </View>
          <Text style={[styles.dmName, { color: theme.text }]}>{user?.name}</Text>
        </View>
        <TouchableOpacity style={styles.dmActionBtn}>
          <Ionicons name="videocam-outline" size={16} color={Theme.brand.primary} />
        </TouchableOpacity>
      </BlurView>

      <ScrollView contentContainerStyle={styles.dmScroll}>
        <ChatBubble message="Establishing secure connection..." isMe={false} theme={theme} status="read" />
        <ChatBubble message="The new UI components are ready for deployment." isMe={true} theme={theme} status="read" />
        <ChatBubble message="Excellent. Synced to the main branch." isMe={false} theme={theme} status="sent" />
      </ScrollView>

      <View style={[styles.dmInputArea, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        {!isRecording ? (
          <View style={styles.inputInner}>
            <TouchableOpacity style={styles.inputAdd}>
              <Ionicons name="add" size={16} color={Theme.brand.primary} />
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

function ChatBubble({ message, isMe, theme, status }: any) {
  return (
    <View style={[styles.bubbleWrapper, isMe ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }]}>
      <LinearGradient
        colors={isMe ? Theme.brand.primaryGradient : ([theme.card, theme.cardElevated] as [string, string, ...string[]])}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem, { borderColor: theme.border, borderWidth: isMe ? 0 : 1 }]}
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

function SettingsOption({ icon, label, theme }: any) {
  return (
    <TouchableOpacity style={styles.settingsOption}>
      <View style={[styles.optionIconBox, { backgroundColor: theme.background }]}>
        <Ionicons name={icon as any} size={16} color={theme.text} />
      </View>
      <Text style={[styles.optionLabel, { color: theme.text }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
    </TouchableOpacity>
  );
}

function ChatCard({ name, msg, time, unread, color, theme, onPress }: any) {
  return (
    <TouchableOpacity style={[styles.glassCard, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={onPress}>
      <View style={[styles.messageAvatar, { backgroundColor: color }]}>
        <Text style={styles.avatarText}>{name.split(' ').map((n: any) => n[0]).join('')}</Text>
      </View>
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={[styles.messageName, { color: theme.text }]}>{name}</Text>
          <Text style={[styles.messageTime, { color: unread ? Theme.brand.primary : theme.textMuted }]}>{time}</Text>
        </View>
        <View style={styles.messagePreview}>
          <Text style={[styles.messageText, { color: unread ? theme.text : theme.textMuted }]} numberOfLines={1}>
            {msg}
          </Text>
          {unread ? (
            <View style={[styles.unreadBadge, { backgroundColor: Theme.brand.primary }]}>
              <Text style={styles.unreadText}>{unread}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRight: { flexDirection: 'row', gap: 10 },
  addModalContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  addModal: { width: '80%', padding: 20, borderRadius: 20, borderWidth: 1 },
  addTitle: { fontSize: 18, fontWeight: '900', marginBottom: 12 },
  addInput: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 16 },
  addActions: { flexDirection: 'row', justifyContent: 'space-between' },
  addActionText: { fontSize: 16, fontWeight: '700' },
  bgOrb: { position: 'absolute', width: 300, height: 300, borderRadius: 150 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 25, paddingTop: 60, paddingBottom: 12 },
  headerCenter: { flex: 1, marginLeft: 12 },
  searchWrap: { paddingHorizontal: 25, paddingBottom: 10 },
  searchBar: {
    borderWidth: 1,
    borderRadius: 16,
    height: 46,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  categoryWrap: { paddingTop: 12, paddingBottom: 4, gap: 10 },
  filterBarWrap: { gap: 10 },
  categoryChip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryChipText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase' },
  headerSubtitle: { fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 4 },
  headerTitle: { fontSize: 34, fontWeight: '900', letterSpacing: -1 },
  iconCircle: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  sectionTitle: { fontSize: 14, fontWeight: '900', marginHorizontal: 25, marginTop: 15, marginBottom: 15, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.5 },
  storiesContainer: { paddingLeft: 25, marginBottom: 25 },
  storyItem: { alignItems: 'center', marginRight: 20 },
  storyCircle: { width: 68, height: 68, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  storyAvatar: { color: '#FFF', fontWeight: '900', fontSize: 20 },
  storyName: { color: '#8E8E93', fontSize: 11, marginTop: 10, fontWeight: '700' },
  glassCard: { flexDirection: 'row', marginHorizontal: 25, marginBottom: 12, padding: 16, borderRadius: 24, borderWidth: 1, alignItems: 'center' },
  messageAvatar: { width: 58, height: 58, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { color: '#FFF', fontWeight: '900', fontSize: 18 },
  messageContent: { flex: 1 },
  messageHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  messageName: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  messageTime: { fontSize: 12, fontWeight: '700' },
  messagePreview: { flexDirection: 'row', alignItems: 'center' },
  messageText: { fontSize: 14, flex: 1, fontWeight: '500' },
  unreadBadge: { minWidth: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6, marginLeft: 10 },
  unreadText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
  dmContainer: { flex: 1 },
  dmHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  dmHeaderUser: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 10 },
  dmAvatar: { width: 44, height: 44, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  dmAvatarText: { color: '#FFF', fontWeight: '900', fontSize: 18 },
  dmName: { fontSize: 17, fontWeight: '900' },
  dmActionBtn: { padding: 8 },
  dmScroll: { padding: 20 },
  dmInputArea: { paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20, paddingTop: 15, borderTopWidth: 1 },
  inputInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  inputAdd: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(115, 103, 240, 0.1)', justifyContent: 'center', alignItems: 'center' },
  dmInput: { flex: 1, fontSize: 16, height: 45, fontWeight: '500' },
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
  settingsOption: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(200,200,200,0.1)' },
  optionIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  optionLabel: { flex: 1, fontSize: 16, fontWeight: '600' },
  dividerSection: { height: 1, marginVertical: 8 },
  fab: { position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 8 },
});

