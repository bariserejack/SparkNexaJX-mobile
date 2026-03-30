import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { useAppTheme } from '../../lib/theme';

type DetailContent = {
  title: string;
  description?: string;
  bullets: string[];
};

type BulletIcon = keyof typeof Ionicons.glyphMap;

const BULLET_ICON_MAP: Record<string, BulletIcon[]> = {
  'learning-mode': ['school-outline', 'ribbon-outline', 'people-outline'],
  'focus-schedule': ['calendar-outline', 'chatbubble-ellipses-outline', 'people-circle-outline'],
  'learning-streak': ['flame-outline', 'notifications-outline', 'share-outline'],
  'reputation-visibility': ['earth-outline', 'people-outline', 'lock-closed-outline'],
  'badges-display': ['ribbon-outline', 'school-outline', 'shield-checkmark-outline'],
  'personal-details': ['person-outline', 'location-outline', 'mail-outline'],
  'password-security': ['key-outline', 'lock-closed-outline', 'alert-circle-outline'],
  'ad-preferences': ['pricetag-outline', 'eye-off-outline', 'refresh-outline'],
  'verification': ['checkmark-circle-outline', 'call-outline', 'shield-checkmark-outline'],
  'archived-chats': ['archive-outline', 'time-outline', 'arrow-undo-outline'],
  'message-requests': ['funnel-outline', 'checkmark-circle-outline', 'ban-outline'],
  'chat-bubbles': ['color-palette-outline', 'grid-outline', 'eye-outline'],
  'storage-usage-breakdown': ['videocam-outline', 'document-text-outline', 'mic-outline', 'cloud-outline'],
  'auto-download-preferences': ['wifi-outline', 'cellular-outline', 'close-circle-outline'],
  'quality-settings': ['play-circle-outline', 'cloud-upload-outline'],
  'free-up-space': ['trash-bin-outline', 'time-outline', 'download-outline'],
  'smart-storage-manager': ['flash-outline', 'documents-outline'],
  'contact-support': ['chatbubble-ellipses-outline', 'mail-outline', 'camera-outline'],
  'report-problem': ['bug-outline', 'alert-circle-outline', 'document-attach-outline'],
  'family-center': ['home-outline', 'time-outline', 'filter-outline'],
  'guardian-connect': ['person-add-outline', 'analytics-outline', 'shield-checkmark-outline'],
  'safety-tools': ['ban-outline', 'volume-mute-outline', 'flag-outline'],
  'learning-resources-hub': ['book-outline', 'school-outline', 'chatbubble-ellipses-outline'],
  'content-preferences': ['grid-outline', 'trending-up-outline', 'eye-off-outline'],
  'reaction-preferences': ['happy-outline', 'heart-outline', 'thumbs-up-outline'],
  'notification-settings': ['notifications-outline', 'alarm-outline', 'people-outline'],
  'quiet-hours': ['moon-outline', 'calendar-outline', 'alert-circle-outline'],
  'accessibility-settings': ['text-outline', 'contrast-outline', 'film-outline'],
  'language-region': ['language-outline', 'calendar-outline', 'map-outline'],
  'time-management': ['timer-outline', 'alarm-outline', 'cafe-outline'],
  'browser-settings': ['globe-outline', 'trash-outline', 'shield-checkmark-outline'],
  'camera-roll-suggestions': ['images-outline', 'eye-outline', 'trash-outline'],
  'end-to-end-encryption': ['finger-print-outline', 'key-outline', 'phone-portrait-outline'],
  'who-can-message-you': ['people-outline', 'person-outline', 'school-outline'],
  'blocked-users': ['ban-outline', 'close-circle-outline', 'person-add-outline'],
  'academic-integrity': ['bookmarks-outline', 'checkmark-circle-outline', 'alert-circle-outline'],
  'copyright-dmca': ['document-attach-outline', 'shield-outline', 'mail-outline'],
  'wallet-balance': ['wallet-outline', 'cash-outline'],
  'payment-methods': ['card-outline', 'logo-paypal', 'logo-bitcoin'],
  'subscription-hub': ['star-outline', 'sparkles-outline', 'heart-outline'],
  'payouts-earnings': ['cash-outline', 'book-outline', 'people-outline'],
  'transaction-history': ['receipt-outline', 'heart-outline', 'refresh-outline'],
  'learning-analytics': ['time-outline', 'bar-chart-outline', 'sparkles-outline'],
  'community-contributions': ['newspaper-outline', 'people-outline', 'documents-outline'],
  'mentions-collaborations': ['at-outline', 'people-circle-outline', 'star-outline'],
  'device-privacy-center': ['camera-outline', 'mic-outline', 'folder-open-outline', 'eye-off-outline'],
  'connected-platforms': ['logo-google', 'logo-microsoft', 'document-text-outline', 'watch-outline'],
  'ai-assistant-memory': ['chatbubbles-outline', 'archive-outline', 'refresh-outline'],
  'linked-devices': ['qr-code-outline', 'camera-outline', 'link-outline'],
  'advertise': ['megaphone-outline', 'trending-up-outline', 'pricetag-outline'],
  'new-broadcast': ['radio-outline', 'people-outline', 'mic-outline'],
  'chat-labels': ['pricetag-outline', 'bookmark-outline', 'list-outline'],
  'starred-messages': ['star-outline', 'pin-outline', 'chatbubble-ellipses-outline'],
  'hive-mind': ['git-network-outline', 'sparkles-outline', 'analytics-outline'],
  'discover-groups': ['compass-outline', 'sparkles-outline', 'funnel-outline'],
  'search-groups': ['search-outline', 'list-outline', 'key-outline'],
  'group-categories': ['grid-outline', 'school-outline', 'options-outline'],
  'trending-groups': ['trending-up-outline', 'flame-outline', 'pulse-outline'],
  'nearby-groups': ['location-outline', 'navigate-outline', 'map-outline'],
  'groups-admin': ['shield-checkmark-outline', 'people-outline', 'settings-outline'],
  'pending-invites': ['mail-open-outline', 'checkmark-circle-outline', 'close-circle-outline'],
  'join-requests-sent': ['paper-plane-outline', 'time-outline', 'refresh-outline'],
  'archived-groups': ['archive-outline', 'arrow-undo-outline', 'close-circle-outline'],
  'saved-groups': ['bookmark-outline', 'star-outline', 'list-outline'],
  'member-management': ['people-outline', 'person-add-outline', 'person-remove-outline'],
  'pending-member-requests': ['person-add-outline', 'checkmark-circle-outline', 'close-circle-outline'],
  'reported-content': ['flag-outline', 'alert-circle-outline', 'shield-checkmark-outline'],
  'group-analytics': ['bar-chart-outline', 'analytics-outline', 'trending-up-outline'],
  'group-unread-activity': ['notifications-outline', 'chatbubble-ellipses-outline', 'time-outline'],
  'group-notification-preferences': ['notifications-outline', 'mail-unread-outline', 'volume-mute-outline'],
  'group-activity-feed': ['newspaper-outline', 'calendar-outline', 'pin-outline'],
  'suggested-groups': ['sparkles-outline', 'people-outline', 'school-outline'],
  'invite-friends': ['qr-code-outline', 'share-social-outline', 'person-add-outline'],
  'create-event': ['calendar-outline', 'alarm-outline', 'people-circle-outline'],
  'polls-and-questions': ['stats-chart-outline', 'help-circle-outline', 'chatbubble-ellipses-outline'],
  'frequently-visited': ['time-outline', 'star-outline', 'arrow-forward-outline'],
  'groups-in-common': ['git-network-outline', 'people-outline', 'chatbubbles-outline'],
  'export-group-data': ['download-outline', 'document-text-outline', 'list-outline'],
};

const DETAIL_MAP: Record<string, DetailContent> = {
  'learning-mode': {
    title: 'Current Learning Mode',
    description: 'Choose how SparkNexaJX adapts your experience.',
    bullets: [
      'Student Mode (Default)',
      'Tutor/Creator Mode',
      'Collaborative Study Group',
    ],
  },
  'focus-schedule': {
    title: 'Do Not Disturb Schedule',
    description: 'Protect your study blocks with automatic focus rules.',
    bullets: [
      'Schedule study hours with auto-silence',
      'Customize auto-replies for DMs',
      'Allow priority contacts or channels',
    ],
  },
  'learning-streak': {
    title: 'Learning Streak',
    description: 'Track consistency and celebrate progress.',
    bullets: [
      'Current streak: 🔥 15 Days',
      'Streak reminders and milestones',
      'Share streaks with friends or keep private',
    ],
  },
  'reputation-visibility': {
    title: 'Reputation Visibility',
    description: 'Control who can see your reputation score.',
    bullets: ['Public', 'Friends Only', 'Private'],
  },
  'badges-display': {
    title: 'Badges Display',
    description: 'Showcase achievements and micro-credentials.',
    bullets: [
      'Top Contributor',
      'Course Completed',
      'Verified Tutor',
    ],
  },
  'personal-details': {
    title: 'Personal Details',
    description: 'Update identity information for your account.',
    bullets: ['Name and profile info', 'Location and bio', 'Linked email or phone'],
  },
  'password-security': {
    title: 'Password and Security',
    description: 'Secure your SparkNexaJX account.',
    bullets: ['Update password', 'Two-step verification', 'Security alerts'],
  },
  'ad-preferences': {
    title: 'Ad Preferences',
    description: 'Control promotional and sponsored content.',
    bullets: ['Topics you care about', 'Hide irrelevant ads', 'Reset ad profile'],
  },
  'verification': {
    title: 'Verification',
    description: 'Confirm your identity and credibility.',
    bullets: ['Verify email/phone', 'Creator verification', 'Badge eligibility'],
  },
  'archived-chats': {
    title: 'Archived Chats',
    description: 'Manage conversations you have archived.',
    bullets: ['View archived chats', 'Auto-archive inactive threads', 'Restore anytime'],
  },
  'message-requests': {
    title: 'Message Requests',
    description: 'Control who can message you.',
    bullets: ['Filter unknown senders', 'Approve or decline requests', 'Block unwanted messages'],
  },
  'chat-bubbles': {
    title: 'Chat Bubbles',
    description: 'Customize chat bubble display.',
    bullets: ['Bubble style and color', 'Compact vs. spacious view', 'Preview settings'],
  },
  'storage-usage-breakdown': {
    title: 'Storage Usage Breakdown',
    description: 'See what is taking up space.',
    bullets: ['Downloaded courses and videos', 'Shared study materials', 'Voice messages and cache'],
  },
  'auto-download-preferences': {
    title: 'Auto-Download Preferences',
    description: 'Control automatic downloads.',
    bullets: ['Wi-Fi only', 'Cellular data', 'Never auto-download'],
  },
  'quality-settings': {
    title: 'Quality Settings',
    description: 'Balance quality with storage and data.',
    bullets: ['Video playback: Auto/High/Low', 'Upload quality: Standard/High'],
  },
  'free-up-space': {
    title: 'Free Up Space',
    description: 'Remove unused files quickly.',
    bullets: ['Clear cached study materials', 'Delete old voice messages', 'Remove completed downloads'],
  },
  'smart-storage-manager': {
    title: 'Smart Storage Manager',
    description: 'Automate storage cleanup.',
    bullets: ['Auto-delete watched videos after 7 days', 'Keep only latest notes version'],
  },
  'contact-support': {
    title: 'Contact Support',
    description: 'Get help from the SparkNexaJX team.',
    bullets: ['Chat or email support', 'Response tracking', 'Attach screenshots'],
  },
  'report-problem': {
    title: 'Report a Problem',
    description: 'Tell us what went wrong.',
    bullets: ['Bug reports', 'Abuse or policy reports', 'Include logs for faster fixes'],
  },
  'family-center': {
    title: 'Family Center',
    description: 'Support learners under 18.',
    bullets: ['Parental controls', 'Study time limits', 'Content filters'],
  },
  'guardian-connect': {
    title: 'Guardian Connect',
    description: 'Link a guardian account.',
    bullets: ['Invite a guardian', 'Shared progress summaries', 'Approval rules'],
  },
  'safety-tools': {
    title: 'Safety Tools',
    description: 'Stay safe and in control.',
    bullets: ['Blocked users list', 'Muted keywords', 'Report content or users'],
  },
  'learning-resources-hub': {
    title: 'Learning Resources Hub',
    description: 'Tutorials and best practices.',
    bullets: ['Product walkthroughs', 'Study tips', 'Communication guidelines'],
  },
  'content-preferences': {
    title: 'Content Preferences',
    description: 'Personalize your learning feed.',
    bullets: ['Topics of interest', 'Difficulty level', 'Hide sensitive content'],
  },
  'reaction-preferences': {
    title: 'Reaction Preferences',
    description: 'Tune how reactions work.',
    bullets: ['Default reaction emoji', 'Allow reactions on posts', 'Show upvotes and praise'],
  },
  'notification-settings': {
    title: 'Notifications',
    description: 'Control alerts and reminders.',
    bullets: ['Push notifications', 'Learning reminders', 'Social and course updates'],
  },
  'quiet-hours': {
    title: 'Quiet Hours',
    description: 'Schedule notification-free time.',
    bullets: ['Daily quiet hours', 'Custom schedules', 'Allow priority alerts'],
  },
  'accessibility-settings': {
    title: 'Accessibility',
    description: 'Adjust for comfort and clarity.',
    bullets: ['Font size and style', 'High contrast', 'Captions and reduce motion'],
  },
  'language-region': {
    title: 'Language & Region',
    description: 'Localize your experience.',
    bullets: ['App language', 'Date and time format', 'Content region'],
  },
  'time-management': {
    title: 'Time Management',
    description: 'Balance learning and wellbeing.',
    bullets: ['Daily limits', 'Focus reminders', 'Break nudges'],
  },
  'browser-settings': {
    title: 'Browser',
    description: 'Control in-app browsing preferences.',
    bullets: ['Open links in-app or external', 'Clear browsing data', 'Safe browsing'],
  },
  'camera-roll-suggestions': {
    title: 'Camera Roll Suggestions',
    description: 'Manage suggested uploads.',
    bullets: ['Enable suggestions', 'Review suggested media', 'Clear suggestion history'],
  },
  'end-to-end-encryption': {
    title: 'End-to-End Encryption',
    description: 'Secure your private communications.',
    bullets: ['Status: Active', 'Verify device keys', 'Manage trusted devices'],
  },
  'who-can-message-you': {
    title: 'Who Can Message You',
    description: 'Control who can start conversations.',
    bullets: ['Everyone', 'Friends only', 'Teachers/Admins only'],
  },
  'blocked-users': {
    title: 'Blocked Users',
    description: 'Manage blocked accounts.',
    bullets: ['View blocked list', 'Unblock accounts', 'Block new users'],
  },
  'academic-integrity': {
    title: 'Academic Integrity Standards',
    description: 'Protect fair learning and honest work.',
    bullets: ['No plagiarism or cheating', 'Cite sources properly', 'Report violations'],
  },
  'copyright-dmca': {
    title: 'Copyright & DMCA',
    description: 'Respect content ownership.',
    bullets: ['Report infringing content', 'Understand fair use', 'DMCA takedown requests'],
  },
  'wallet-balance': {
    title: 'Spark Wallet Balance',
    description: 'Manage your learning funds and tips.',
    bullets: ['Top Up (courses & tips)', 'Withdraw (creators/tutors)'],
  },
  'payment-methods': {
    title: 'Payment Methods',
    description: 'Secure payment options for purchases and payouts.',
    bullets: [
      'Add credit/debit card',
      'Link PayPal / Venmo',
      'Crypto wallet (USDC/ETH)',
    ],
  },
  'subscription-hub': {
    title: 'Subscription Hub',
    description: 'Manage premium plans and creator support.',
    bullets: [
      'Active premium plans',
      'SparkNexaJX+ membership',
      'Recurring donations to creators',
    ],
  },
  'payouts-earnings': {
    title: 'Payouts & Earnings',
    description: 'Track creator revenue and affiliate rewards.',
    bullets: [
      'Tutor earnings dashboard',
      'Course sales revenue',
      'Affiliate earnings (refer a friend)',
    ],
  },
  'transaction-history': {
    title: 'Transaction History',
    description: 'Review purchases, tips, and refunds.',
    bullets: ['Course purchases', 'Tip history', 'Refund requests'],
  },
  'learning-analytics': {
    title: 'Learning Analytics',
    description: 'AI-driven insights and progress tracking.',
    bullets: [
      'Time spent learning (daily/weekly/monthly)',
      'Topics mastered vs. in progress',
      'AI-generated study insights',
    ],
  },
  'community-contributions': {
    title: 'Community Contributions',
    description: 'Your activity across the learning community.',
    bullets: [
      'Posts, comments, and Q&A answers',
      'Study groups created or joined',
      'Resources shared (flashcards, notes, playlists)',
    ],
  },
  'mentions-collaborations': {
    title: 'Mentions & Collaborations',
    description: 'Track shared work and peer feedback.',
    bullets: [
      'Content you are tagged in',
      'Collaborative projects',
      'Peer reviews received',
    ],
  },
  'device-privacy-center': {
    title: 'Device & Privacy Center',
    description: 'Control device permissions for learning tools.',
    bullets: [
      'Camera permissions (video tutoring)',
      'Microphone permissions (live sessions)',
      'Storage access (offline courses)',
      'Screen recording detection',
    ],
  },
  'connected-platforms': {
    title: 'Connected Platforms',
    description: 'Link your favorite classroom tools.',
    bullets: [
      'Google Classroom',
      'Microsoft Education',
      'Import from Notion / Quizlet',
      'Connected smartwatch for reminders',
    ],
  },
  'ai-assistant-memory': {
    title: 'AI Assistant Memory',
    description: 'Manage AI personalization and retention.',
    bullets: [
      'Review past conversations with Spark AI Tutor',
      'Manage data retention for personalization',
      'Reset AI learning preferences',
    ],
  },
  'linked-devices': {
    title: 'Sync Nexus',
    description: 'Scan a QR code to link another device.',
    bullets: ['Open camera scanner', 'Confirm trusted device', 'Manage active sessions'],
  },
  'advertise': {
    title: 'Amplify',
    description: 'Promote your courses or learning spaces.',
    bullets: ['Create a sponsored post', 'Target by subject and level', 'Track engagement'],
  },
  'new-broadcast': {
    title: 'The Echo',
    description: 'Send an update to a selected audience.',
    bullets: ['Choose recipients', 'Attach files or links', 'Schedule delivery'],
  },
  'chat-labels': {
    title: 'Coded Tags',
    description: 'Organize chats with labels.',
    bullets: ['Create custom labels', 'Assign labels to chats', 'Filter by label'],
  },
  'starred-messages': {
    title: 'Vault',
    description: 'Find important messages quickly.',
    bullets: ['View starred messages', 'Pin important notes', 'Remove stars'],
  },
  'hive-mind': {
    title: 'The Hive Mind',
    description: 'AI-powered collaboration intelligence.',
    bullets: [
      'Live context across conversations',
      'Smart aggregation of action items',
      'Quick join for active sessions',
    ],
  },
  'discover-groups': {
    title: 'Discover Groups & Communities',
    description: 'Browse trending and recommended learning spaces.',
    bullets: ['Recommended for you', 'New and trending communities', 'Filter by course or interest'],
  },
  'search-groups': {
    title: 'Search Groups',
    description: 'Find groups by name, subject, or keyword.',
    bullets: ['Search by name', 'Search by subject', 'Search by keyword'],
  },
  'group-categories': {
    title: 'Categories',
    description: 'Filter by subject, level, or type.',
    bullets: ['Subject filters', 'Level filters', 'Group type filters'],
  },
  'trending-groups': {
    title: 'Trending / Popular',
    description: 'See what is active right now.',
    bullets: ['Most active today', 'Fast-growing communities', 'Top discussion topics'],
  },
  'nearby-groups': {
    title: 'Nearby Groups',
    description: 'Explore local study circles or campus communities.',
    bullets: ['Campus or city groups', 'Location-based suggestions', 'Distance visibility controls'],
  },
  'groups-admin': {
    title: 'Groups You Admin / Moderate',
    description: 'Quick access to the spaces you manage.',
    bullets: ['Admin dashboard', 'Moderation tools', 'Role assignments'],
  },
  'pending-invites': {
    title: 'Pending Invites',
    description: 'Review invitations to join groups.',
    bullets: ['New invites', 'Accept or decline', 'Invite details'],
  },
  'join-requests-sent': {
    title: 'Join Requests Sent',
    description: 'Track the groups you have requested to join.',
    bullets: ['Pending approvals', 'Withdraw requests', 'Status updates'],
  },
  'archived-groups': {
    title: 'Archived Groups',
    description: 'Hide or restore inactive groups.',
    bullets: ['View archived groups', 'Restore to active list', 'Leave group permanently'],
  },
  'saved-groups': {
    title: 'Saved Groups',
    description: 'Bookmark groups you want to join later.',
    bullets: ['Saved group list', 'Quick join actions', 'Remove from saved'],
  },
  'member-management': {
    title: 'Member Management',
    description: 'View, add, or remove members.',
    bullets: ['View member list', 'Assign roles', 'Remove members'],
  },
  'pending-member-requests': {
    title: 'Pending Member Requests',
    description: 'Approve or decline new members.',
    bullets: ['Pending approvals', 'Bulk actions', 'Auto-approve rules'],
  },
  'reported-content': {
    title: 'Reported Content',
    description: 'Moderate content flagged by members.',
    bullets: ['Review reports', 'Take action', 'Escalate to support'],
  },
  'group-analytics': {
    title: 'Group Analytics',
    description: 'Track activity and growth.',
    bullets: ['Member growth', 'Engagement trends', 'Popular posts'],
  },
  'group-unread-activity': {
    title: 'Unread Activity',
    description: 'See mentions and pending requests.',
    bullets: ['Unread messages', 'Mentions and tags', 'Pending requests'],
  },
  'group-notification-preferences': {
    title: 'Notification Preferences',
    description: 'Control alerts for groups and communities.',
    bullets: ['All activity', 'Mentions only', 'Mute groups'],
  },
  'group-activity-feed': {
    title: 'Activity Feed',
    description: 'Recent posts, events, and updates.',
    bullets: ['Latest posts', 'Upcoming events', 'Pinned updates'],
  },
  'suggested-groups': {
    title: 'Suggested Groups',
    description: 'AI-powered recommendations for you.',
    bullets: ['Suggested for you', 'Based on courses', 'Based on connections'],
  },
  'invite-friends': {
    title: 'Invite Friends',
    description: 'Share group links or QR codes.',
    bullets: ['Invite link', 'QR code', 'Share to contacts'],
  },
  'create-event': {
    title: 'Create Event',
    description: 'Schedule study sessions or webinars.',
    bullets: ['Create study session', 'Set reminders', 'Invite members'],
  },
  'polls-and-questions': {
    title: 'Polls & Questions',
    description: 'Engage members quickly.',
    bullets: ['Create polls', 'Ask questions', 'View results'],
  },
  'frequently-visited': {
    title: 'Frequently Visited',
    description: 'Quick access to your most active groups.',
    bullets: ['Most visited groups', 'Recent activity', 'Pin favorites'],
  },
  'groups-in-common': {
    title: 'Groups in Common',
    description: 'See shared groups with others.',
    bullets: ['Shared groups', 'Mutual members', 'Start a group chat'],
  },
  'export-group-data': {
    title: 'Export Group Data',
    description: 'Download data for educators or admins.',
    bullets: ['Member list export', 'Activity summary', 'Chat history export'],
  },
};

export default function SettingsDetailScreen() {
  const { activeTheme } = useAppTheme();
  const { slug, from, returnTo } = useLocalSearchParams<{ slug?: string; from?: string; returnTo?: string }>();
  const slugKey = useMemo(() => (Array.isArray(slug) ? slug[0] : slug) || '', [slug]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const content = useMemo(() => {
    if (!slugKey || !DETAIL_MAP[slugKey]) {
      return {
        title: 'Details',
        description: 'This section is still being set up.',
        bullets: ['Check back soon for more information.'],
      };
    }
    return DETAIL_MAP[slugKey];
  }, [slugKey]);

  const bulletIcons = useMemo(() => {
    if (!slugKey || !BULLET_ICON_MAP[slugKey]) {
      return [];
    }
    return BULLET_ICON_MAP[slugKey];
  }, [slugKey]);

  useEffect(() => {
    if (slugKey === 'who-can-message-you') {
      setSelectedOption((prev) => (prev && content.bullets.includes(prev) ? prev : content.bullets[0] || null));
    } else {
      setSelectedOption(null);
    }
  }, [slugKey, content.bullets]);

  const handleBack = () => {
    if (from === 'settings') {
      router.replace('/settings');
      return;
    }
    if (from === 'pulse') {
      if (returnTo === 'chat-settings') {
        router.replace({ pathname: '/pulse', params: { modal: 'chat-settings' } });
        return;
      }
      if (returnTo === 'groups') {
        router.replace({ pathname: '/pulse', params: { modal: 'groups' } });
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
    router.replace('/settings');
  };

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: activeTheme.border }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={16} color={activeTheme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: activeTheme.text }]} numberOfLines={1}>
            {content.title}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {content.description ? (
            <Text style={[styles.sectionLabel, { color: activeTheme.textMuted }]}>{content.description}</Text>
          ) : null}
          <View style={[styles.card, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
            {content.bullets.map((item, index) => {
              const isSelectable = slugKey === 'who-can-message-you';
              const isSelected = isSelectable && selectedOption === item;
              const RowWrapper: any = isSelectable ? TouchableOpacity : View;
              return (
              <View key={item}>
                <RowWrapper
                  style={styles.row}
                  onPress={isSelectable ? () => setSelectedOption(item) : undefined}
                  accessibilityRole={isSelectable ? 'button' : undefined}
                  accessibilityState={isSelectable ? { selected: isSelected } : undefined}
                >
                  {bulletIcons[index] ? (
                    <View style={styles.bulletIconWrap}>
                      <Ionicons name={bulletIcons[index]} size={16} color={activeTheme.textMuted} />
                    </View>
                  ) : (
                    <View style={[styles.dot, { backgroundColor: activeTheme.textMuted }]} />
                  )}
                  <Text style={[styles.rowText, { color: activeTheme.text }]}>{item}</Text>
                  {isSelectable ? (
                    <View style={styles.optionIndicator}>
                      <Ionicons
                        name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                        size={16}
                        color={isSelected ? '#7367f0' : activeTheme.textMuted}
                      />
                    </View>
                  ) : null}
                </RowWrapper>
                {index < content.bullets.length - 1 ? (
                  <View style={[styles.divider, { backgroundColor: activeTheme.border }]} />
                ) : null}
              </View>
            );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { width: 34, alignItems: 'flex-start' },
  headerTitle: { flex: 1, fontSize: 22, fontWeight: '900', letterSpacing: -0.3, textAlign: 'center' },
  headerSpacer: { width: 34 },
  scrollContent: { paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 28 },
  sectionLabel: { fontSize: 13, fontWeight: '600', marginBottom: 10, lineHeight: 18 },
  card: { borderWidth: 1, borderRadius: 18, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingHorizontal: 16, paddingVertical: 13 },
  rowText: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  bulletIconWrap: { width: 20, alignItems: 'center', marginTop: 2 },
  optionIndicator: { alignSelf: 'center', marginLeft: 8 },
  divider: { height: 1, marginLeft: 16 },
});
