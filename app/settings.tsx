import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, 
  Platform, TextInput, Image,
  Modal, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Theme } from '../constants/Theme';
import { useAppTheme } from '../lib/theme';
import { useDrawerBack } from '../lib/useDrawerBack';

const { width } = Dimensions.get('window');

type AppLanguage = {
  code: string;
  label: string;
};

const APP_LANGUAGES: AppLanguage[] = [
  { code: 'en-US', label: 'English (United States)' },
  { code: 'en-GB', label: 'English (United Kingdom)' },
  { code: 'es-ES', label: 'Spanish (Spain)' },
  { code: 'es-MX', label: 'Spanish (Mexico)' },
  { code: 'fr-FR', label: 'French (France)' },
  { code: 'de-DE', label: 'German (Germany)' },
  { code: 'pt-BR', label: 'Portuguese (Brazil)' },
  { code: 'pt-PT', label: 'Portuguese (Portugal)' },
  { code: 'ar-SA', label: 'Arabic (Saudi Arabia)' },
  { code: 'sw-KE', label: 'Swahili (Kenya)' },
  { code: 'yo-NG', label: 'Yoruba (Nigeria)' },
  { code: 'ha-NG', label: 'Hausa (Nigeria)' },
  { code: 'ig-NG', label: 'Igbo (Nigeria)' },
  { code: 'hi-IN', label: 'Hindi (India)' },
  { code: 'bn-BD', label: 'Bengali (Bangladesh)' },
  { code: 'ur-PK', label: 'Urdu (Pakistan)' },
  { code: 'zh-CN', label: 'Chinese (China)' },
  { code: 'zh-TW', label: 'Chinese (Taiwan)' },
  { code: 'ja-JP', label: 'Japanese (Japan)' },
  { code: 'ko-KR', label: 'Korean (South Korea)' },
  { code: 'id-ID', label: 'Indonesian (Indonesia)' },
  { code: 'vi-VN', label: 'Vietnamese (Vietnam)' },
  { code: 'ru-RU', label: 'Russian (Russia)' },
  { code: 'tr-TR', label: 'Turkish (Turkey)' },
];

export default function SettingsScreen() {
  const { themeMode, setThemeMode, activeTheme, isDark } = useAppTheme();
  const handleBack = useDrawerBack();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);
  const [fullName, setFullName] = useState("Alex Rivera");
  const [email, setEmail] = useState("alex.spark@nexa.io");
  const [accentColor, setAccentColor] = useState(Theme.brand?.primary || '#7367f0');
  const [selectedLanguage, setSelectedLanguage] = useState<AppLanguage>(APP_LANGUAGES[0]);
  const profilePhoto = require('../assets/images/brand.logo.png');

  const [toggles, setToggles] = useState({
    earlyAccess: true,
    activeStatus: true,
    showCurrentActivity: true,
    zenStudy: false,
    studyDataPrivacy: true,
    hideOnlineWhileStudying: false,
  });

  const updateToggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      {/* Dynamic Background Glow */}
      <View style={[styles.bgOrb, { top: -50, right: -50, backgroundColor: accentColor }]} />
      
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="chevron-back" size={16} color={activeTheme.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerLabel}>SPARKNEXAJX</Text>
            <Text style={[styles.headerTitle, { color: activeTheme.text }]}>Settings & privacy</Text>
          </View>
          {/* right side icons: contacts and add (group/community) */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              style={{ marginRight: 20 }}
              onPress={() => {
                router.push({ pathname: '/new-contact', params: { returnTo: '/settings' } });
              }}
            >
              <Ionicons name="person-add-outline" size={16} color={activeTheme.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsAddModalVisible(true)}>
              <Ionicons name="add-circle-outline" size={16} color={activeTheme.text} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* --- IDENTITY NODE PROFILE --- */}
          <Animated.View entering={FadeInDown.duration(400)}>
            <LinearGradient 
              colors={[accentColor, '#6a11cb']} 
              start={{x: 0, y: 0}} end={{x: 1, y: 1}}
              style={styles.profileCard}
            >
              <View style={styles.profileRow}>
                <View style={styles.avatarContainer}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.6)', 'rgba(255,255,255,0.15)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.avatarRing}
                  >
                    {profilePhoto ? (
                      <Image source={profilePhoto} style={styles.avatarImage} />
                    ) : (
                      <View style={styles.avatarFallback}>
                        <Text style={styles.avatarText}>{fullName.charAt(0)}</Text>
                      </View>
                    )}
                  </LinearGradient>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{fullName}</Text>
                  <Text style={styles.profileEmail}>{email}</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* --- ACCOUNT CENTER --- */}
          <SettingsSection label="Identity Node" theme={activeTheme}>
            <MenuRow icon="person-circle-outline" label="Account" onPress={() => router.push({ pathname: '/account', params: { from: 'settings' } })} theme={activeTheme} />
            <MenuRow icon="create-outline" label="Profile settings" onPress={() => router.push({ pathname: '/profile-settings', params: { from: 'settings' } })} theme={activeTheme} />
            <MenuRow icon="person-outline" label="Personal details" onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'personal-details', from: 'settings' } })} theme={activeTheme} />
            <MenuRow icon="key-outline" label="Password and security" onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'password-security', from: 'settings' } })} theme={activeTheme} />
            <MenuRow icon="pricetag-outline" label="Ad preferences" onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'ad-preferences', from: 'settings' } })} theme={activeTheme} />
            <MenuRow icon="star-outline" label="Verification" onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'verification', from: 'settings' } })} theme={activeTheme} />
            <View style={[styles.moreLink]}>
              <Text style={[styles.moreLinkText, { color: Theme.brand.primary }]}>See more in Identity Center</Text>
            </View>
          </SettingsSection>

          {/* --- CHATS SETTINGS --- */}
          <SettingsSection label="Chats & Privacy" theme={activeTheme}>
            <MenuRow icon="archive-outline" label="Archived chats" onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'archived-chats', from: 'settings' } })} theme={activeTheme} />
            <MenuRow icon="chatbubble-ellipses-outline" label="Message requests" onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'message-requests', from: 'settings' } })} theme={activeTheme} />
            <MenuRow icon="shield-checkmark-outline" label="Privacy" onPress={() => router.push({ pathname: '/privacy', params: { from: 'settings' } })} theme={activeTheme} />
            <MenuRow icon="chatbubbles-outline" label="Bubbles" onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'chat-bubbles', from: 'settings' } })} theme={activeTheme} />
          </SettingsSection>

          {/* --- MANAGE MEDIA STORAGE --- */}
          <SettingsSection label="Manage media storage" theme={activeTheme}>
            <MenuRow
              icon="images-outline"
              label="Manage Media Storage"
              onPress={() => router.push({ pathname: '/storage-data', params: { from: 'settings' } })}
              theme={activeTheme}
            />
            <MenuRow
              icon="pie-chart-outline"
              label="Storage usage breakdown"
              onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'storage-usage-breakdown', from: 'settings' } })}
              theme={activeTheme}
            />
            <MenuRow
              icon="cloud-download-outline"
              label="Auto-download preferences"
              onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'auto-download-preferences', from: 'settings' } })}
              theme={activeTheme}
            />
            <MenuRow
              icon="aperture-outline"
              label="Quality settings"
              onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'quality-settings', from: 'settings' } })}
              theme={activeTheme}
            />
            <MenuRow
              icon="trash-bin-outline"
              label="Free up space"
              onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'free-up-space', from: 'settings' } })}
              theme={activeTheme}
            />
            <MenuRow
              icon="hardware-chip-outline"
              label="Smart storage manager"
              onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'smart-storage-manager', from: 'settings' } })}
              theme={activeTheme}
            />
          </SettingsSection>

          {/* --- TOOLS AND RESOURCES --- */}
          <SettingsSection label="Tools and resources" theme={activeTheme}>
            <MenuRow icon="options-outline" label="Privacy Checkup" onPress={() => router.push({ pathname: '/privacy-checkup', params: { from: 'settings' } })} theme={activeTheme} />
            <MenuRow icon="help-circle-outline" label="Help" onPress={() => router.push({ pathname: '/help', params: { from: 'settings' } })} theme={activeTheme} />
            <MenuRow icon="chatbox-ellipses-outline" label="Contact support" onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'contact-support', from: 'settings' } })} theme={activeTheme} />
            <MenuRow icon="bug-outline" label="Report a problem" onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'report-problem', from: 'settings' } })} theme={activeTheme} />
            <MenuRow icon="home-outline" label="Family Center" onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'family-center', from: 'settings' } })} theme={activeTheme} />
            <MenuRow icon="heart-circle-outline" label="Guardian Connect" onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'guardian-connect', from: 'settings' } })} theme={activeTheme} />
            <MenuRow icon="eye-outline" label="Default audience settings" onPress={() => router.push({ pathname: '/post-audience', params: { from: 'settings' } })} theme={activeTheme} />
            <MenuRow icon="alert-circle-outline" label="Safety tools" onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'safety-tools', from: 'settings' } })} theme={activeTheme} />
            <MenuRow icon="book-outline" label="Learning resources hub" onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'learning-resources-hub', from: 'settings' } })} theme={activeTheme} />
          </SettingsSection>

          {/* --- PREFERENCES --- */}
          <SettingsSection label="Preferences" theme={activeTheme}>
            <MenuRow icon="grid-outline" label="Content preferences" onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'content-preferences', from: 'settings' } })} theme={activeTheme} />
            <MenuRow icon="happy-outline" label="Reaction preferences" onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'reaction-preferences', from: 'settings' } })} theme={activeTheme} />
            <MenuRow icon="notifications-outline" label="Notifications" onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'notification-settings', from: 'settings' } })} theme={activeTheme} />
            <MenuRow icon="alarm-outline" label="Quiet hours" onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'quiet-hours', from: 'settings' } })} theme={activeTheme} />
            <MenuRow icon="accessibility-outline" label="Accessibility" onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'accessibility-settings', from: 'settings' } })} theme={activeTheme} />
            <MenuRow icon="flag-outline" label="Language & region" onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'language-region', from: 'settings' } })} theme={activeTheme} />
          </SettingsSection>

          {/* --- DISPLAY & BEHAVIOR --- */}
          <SettingsSection label="Display & behavior" theme={activeTheme}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Ionicons name="color-palette-outline" size={16} color={activeTheme.textMuted} style={{marginRight: 12}} />
                <Text style={[styles.rowLabel, { color: activeTheme.text }]}>Theme</Text>
              </View>
              <View style={[styles.segmentedControl, { backgroundColor: activeTheme.background }]}>
                {['light', 'dark'].map((m) => (
                  <TouchableOpacity 
                    key={m} 
                    onPress={() => {
                      setThemeMode(m as 'light' | 'dark');
                      Haptics.selectionAsync();
                    }}
                    style={[styles.segmentBtn, themeMode === m && { backgroundColor: activeTheme.card }]}
                  >
                    <Text style={[styles.segmentText, themeMode === m ? {color: activeTheme.text} : {color: activeTheme.textMuted}]}>
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: activeTheme.border }]} />
            <TouchableOpacity onPress={() => setIsLanguageModalVisible(true)}>
              <View style={styles.row}>
                <View style={[styles.iconBox, { backgroundColor: activeTheme.background }]}>
                  <Ionicons name="language-outline" size={16} color={activeTheme.text} />
                </View>
                <View style={styles.rowContent}>
                  <Text style={[styles.rowLabel, { color: activeTheme.text }]}>App language</Text>
                </View>
                <View style={styles.rowRight}>
                  <Text style={[styles.rowValue, { color: activeTheme.textMuted }]}>{selectedLanguage.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color={activeTheme.textMuted} />
                </View>
              </View>
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: activeTheme.border, marginLeft: 50 }]} />
            <MenuRow icon="folder-open-outline" label="Storage and data" onPress={() => router.push({ pathname: '/storage-data', params: { from: 'settings' } })} theme={activeTheme} />
            <MenuRow icon="timer-outline" label="Time management" onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'time-management', from: 'settings' } })} theme={activeTheme} />
            <MenuRow icon="globe-outline" label="Browser" onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'browser-settings', from: 'settings' } })} theme={activeTheme} />
            <MenuRow icon="camera-outline" label="Camera roll suggestions" onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'camera-roll-suggestions', from: 'settings' } })} theme={activeTheme} />
            <MenuRow icon="rocket-outline" label="Early access to features" 
              right={<Switch value={toggles.earlyAccess} onValueChange={() => updateToggle('earlyAccess')} trackColor={{true: accentColor}} />}
              theme={activeTheme} />
          </SettingsSection>

          {/* --- ACCOUNT STATUS & PRESENCE --- */}
          <SettingsSection label="Account Status & Presence" theme={activeTheme}>
            <MenuRow
              icon="school-outline"
              label="Current Learning Mode"
              onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'learning-mode', from: 'settings' } })}
              theme={activeTheme}
            />
            <MenuRow
              icon="radio-button-on-outline"
              label="Show when you're online"
              right={<Switch value={toggles.activeStatus} onValueChange={() => updateToggle('activeStatus')} trackColor={{true: accentColor}} />}
              theme={activeTheme}
            />
            <MenuRow
              icon="pulse-outline"
              label="Show current activity"
              right={<Switch value={toggles.showCurrentActivity} onValueChange={() => updateToggle('showCurrentActivity')} trackColor={{true: accentColor}} />}
              theme={activeTheme}
            />
            <MenuRow
              icon="moon-outline"
              label="Zen Study"
              right={<Switch value={toggles.zenStudy} onValueChange={() => updateToggle('zenStudy')} trackColor={{true: accentColor}} />}
              theme={activeTheme}
            />
            <MenuRow
              icon="calendar-outline"
              label="Schedule Do Not Disturb"
              onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'focus-schedule', from: 'settings' } })}
              theme={activeTheme}
            />
            <MenuRow
              icon="flame-outline"
              label="Current learning streak"
              onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'learning-streak', from: 'settings' } })}
              theme={activeTheme}
            />
            <MenuRow
              icon="eye-off-outline"
              label="Reputation visibility"
              onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'reputation-visibility', from: 'settings' } })}
              theme={activeTheme}
            />
            <MenuRow
              icon="ribbon-outline"
              label="Badges display"
              onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'badges-display', from: 'settings' } })}
              theme={activeTheme}
            />
          </SettingsSection>

          {/* --- WALLET & SPARK FUNDS --- */}
          <SettingsSection label="Wallet & Spark Funds" theme={activeTheme}>
            <MenuRow
              icon="wallet-outline"
              label="Spark Wallet balance"
              onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'wallet-balance', from: 'settings' } })}
              theme={activeTheme}
            />
            <MenuRow
              icon="card-outline"
              label="Payment methods"
              onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'payment-methods', from: 'settings' } })}
              theme={activeTheme}
            />
            <MenuRow
              icon="layers-outline"
              label="Subscription hub"
              onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'subscription-hub', from: 'settings' } })}
              theme={activeTheme}
            />
            <MenuRow
              icon="cash-outline"
              label="Payouts & earnings"
              onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'payouts-earnings', from: 'settings' } })}
              theme={activeTheme}
            />
            <MenuRow
              icon="receipt-outline"
              label="Transaction history"
              onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'transaction-history', from: 'settings' } })}
              theme={activeTheme}
            />
          </SettingsSection>

          {/* --- YOUR LEARNING & SOCIAL FOOTPRINT --- */}
          <SettingsSection label="Your Learning & Social Footprint" theme={activeTheme}>
            <MenuRow
              icon="analytics-outline"
              label="Learning analytics"
              onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'learning-analytics', from: 'settings' } })}
              theme={activeTheme}
            />
            <MenuRow
              icon="newspaper-outline"
              label="Community contributions"
              onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'community-contributions', from: 'settings' } })}
              theme={activeTheme}
            />
            <MenuRow
              icon="people-outline"
              label="Mentions & collaborations"
              onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'mentions-collaborations', from: 'settings' } })}
              theme={activeTheme}
            />
            <MenuRow
              icon="phone-portrait-outline"
              label="Device & privacy center"
              onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'device-privacy-center', from: 'settings' } })}
              theme={activeTheme}
            />
            <MenuRow
              icon="link-outline"
              label="Connected platforms"
              onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'connected-platforms', from: 'settings' } })}
              theme={activeTheme}
            />
            <MenuRow
              icon="sparkles-outline"
              label="AI Assistant memory"
              onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'ai-assistant-memory', from: 'settings' } })}
              theme={activeTheme}
            />
          </SettingsSection>

          {/* --- PRIVACY & SECURITY --- */}
          <SettingsSection label="Privacy & security" theme={activeTheme}>
            <MenuRow
              icon="lock-closed-outline"
              label="App lock"
              onPress={() => router.push({ pathname: '/app-lock', params: { from: 'settings' } })}
              theme={activeTheme}
            />
            <MenuRow
              icon="finger-print-outline"
              label="End-to-end encryption"
              onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'end-to-end-encryption', from: 'settings' } })}
              theme={activeTheme}
            />
            <MenuRow icon="shield-half-outline" label="Neural Encryption" theme={activeTheme} />
            <MenuRow icon="people-circle-outline" label="How people find and contact you" onPress={() => router.push({ pathname: '/privacy', params: { from: 'settings' } })} theme={activeTheme} />
            <MenuRow
              icon="chatbox-outline"
              label="Who can message you"
              onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'who-can-message-you', from: 'settings' } })}
              theme={activeTheme}
            />
            <MenuRow
              icon="ban-outline"
              label="Blocked users"
              onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'blocked-users', from: 'settings' } })}
              theme={activeTheme}
            />
            <MenuRow
              icon="stats-chart-outline"
              label="Study data privacy"
              right={<Switch value={toggles.studyDataPrivacy} onValueChange={() => updateToggle('studyDataPrivacy')} trackColor={{true: accentColor}} />}
              theme={activeTheme}
            />
            <MenuRow
              icon="cloud-offline-outline"
              label="Hide online status while studying"
              right={<Switch value={toggles.hideOnlineWhileStudying} onValueChange={() => updateToggle('hideOnlineWhileStudying')} trackColor={{true: accentColor}} />}
              theme={activeTheme}
            />
          </SettingsSection>

          {/* --- COMMUNITY STANDARDS & POLICIES --- */}
          <SettingsSection label="Community standards and legal policies" theme={activeTheme}>
            <MenuRow icon="document-outline" label="Terms of Service" onPress={() => router.push({ pathname: '/terms', params: { from: 'settings' } })} theme={activeTheme} />
            <MenuRow icon="document-text-outline" label="Privacy Policy" onPress={() => router.push({ pathname: '/privacy-policy', params: { from: 'settings' } })} theme={activeTheme} />
            <MenuRow icon="shield-outline" label="Cookies policy" onPress={() => router.push({ pathname: '/cookies-policy', params: { from: 'settings' } })} theme={activeTheme} />
            <MenuRow icon="bookmarks-outline" label="Academic Integrity Standards" onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'academic-integrity', from: 'settings' } })} theme={activeTheme} />
            <MenuRow icon="document-attach-outline" label="Copyright & DMCA" onPress={() => router.push({ pathname: '/settings-detail/[slug]', params: { slug: 'copyright-dmca', from: 'settings' } })} theme={activeTheme} />
            <MenuRow icon="warning-outline" label="Community Standards" onPress={() => router.push({ pathname: '/community-standards', params: { from: 'settings' } })} theme={activeTheme} />
            <MenuRow
              icon="information-circle-outline"
              label="About"
              onPress={() => router.push({ pathname: '/about', params: { from: 'settings' } })}
              theme={activeTheme}
            />
          </SettingsSection>

          {/* --- LOGOUT --- */}
          <TouchableOpacity 
            style={styles.logoutBtn}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              router.push('/auth/logout');
            }}
          >
            <Text style={[styles.logoutText, { color: '#FF3B30' }]}>LOG OUT</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: activeTheme.textMuted }]}>SPARKNEXAJX v2.6.0</Text>
          </View>

        </ScrollView>
      </SafeAreaView>

      {/* --- APP LANGUAGE MODAL --- */}
      <Modal visible={isLanguageModalVisible} animationType="slide" presentationStyle="overFullScreen" transparent>
        <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={[styles.modalContent, { justifyContent: 'flex-end' }]}>
          <View style={[styles.languageModalBody, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
            <View style={styles.languageModalHeader}>
              <Text style={[styles.languageModalTitle, { color: activeTheme.text }]}>App language</Text>
              <TouchableOpacity onPress={() => setIsLanguageModalVisible(false)}>
                <Ionicons name="close-outline" size={16} color={activeTheme.text} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.languageList}>
              {APP_LANGUAGES.map((language) => {
                const isSelected = selectedLanguage.code === language.code;
                return (
                  <TouchableOpacity
                    key={language.code}
                    style={styles.languageOption}
                    onPress={() => {
                      setSelectedLanguage(language);
                      Haptics.selectionAsync();
                      setIsLanguageModalVisible(false);
                    }}
                  >
                    <Text style={[styles.rowLabel, { color: activeTheme.text }]}>{language.label}</Text>
                    {isSelected ? (
                      <Ionicons name="checkmark-circle" size={16} color={Theme.brand.primary} />
                    ) : (
                      <Ionicons name="ellipse-outline" size={16} color={activeTheme.textMuted} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </BlurView>
      </Modal>

      {/* --- ADD GROUP/COMMUNITY MODAL --- */}
      <Modal visible={isAddModalVisible} animationType="slide" presentationStyle="overFullScreen" transparent>
        <View style={[styles.modalContent, { justifyContent: 'center', backgroundColor: activeTheme.background }]}> 
          <View style={[styles.addModalBody, { backgroundColor: isDark ? '#0B0B1E' : '#FFFFFF', borderColor: activeTheme.border }]}> 
            <Text style={[styles.modalTitle, { color: activeTheme.text, marginBottom: 20 }]}>Create or Manage</Text>
            <TouchableOpacity style={styles.addOption} onPress={() => {
                setIsAddModalVisible(false);
                router.push({ pathname: '/groups/new', params: { from: 'settings' } });
            }}> 
              <Text style={[styles.rowLabel, { color: activeTheme.text }]}>New Group</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addOption} onPress={() => {
                setIsAddModalVisible(false);
                router.push({ pathname: '/communities/new', params: { from: 'settings' } });
            }}> 
              <Text style={[styles.rowLabel, { color: activeTheme.text }]}>New Community</Text>
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: activeTheme.border, marginVertical: 20 }]} />
            <TouchableOpacity style={styles.addOption} onPress={() => {
                setIsAddModalVisible(false);
                router.push({ pathname: '/groups', params: { from: 'settings' } });
            }}>
              <Text style={[styles.rowLabel, { color: activeTheme.text }]}>Your Groups</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addOption} onPress={() => {
                setIsAddModalVisible(false);
                router.push({ pathname: '/communities', params: { from: 'settings' } });
            }}>
              <Text style={[styles.rowLabel, { color: activeTheme.text }]}>Your Communities</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsAddModalVisible(false)} style={[styles.doneBtn, { alignSelf: 'flex-end', marginTop: 20 }]}> 
              <Text style={{ color: '#FFF', fontWeight: '700' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- EDIT PROFILE MODAL --- */}
      <Modal visible={isEditModalVisible} animationType="slide" presentationStyle="pageSheet">
        <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: activeTheme.text }]}>Profile Settings</Text>
            <TouchableOpacity onPress={() => setIsEditModalVisible(false)} style={styles.doneBtn}>
              <Text style={{ color: '#FFF', fontWeight: '700' }}>Save</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
             <Text style={[styles.inputLabel, { color: activeTheme.textMuted }]}>IDENTIFIER</Text>
             <TextInput 
                style={[styles.modalInput, { color: activeTheme.text, backgroundColor: activeTheme.card, borderColor: activeTheme.border }]} 
                value={fullName}
                onChangeText={setFullName}
                placeholderTextColor={activeTheme.textMuted}
             />
             <Text style={[styles.inputLabel, { color: activeTheme.textMuted, marginTop: 25 }]}>BIOMETRIC DATA</Text>
             <View style={[styles.modalInput, { height: 80, borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
                <Text style={{color: activeTheme.textMuted, fontSize: 13}}>Neural link established. Syncing preferences across cloud nodes...</Text>
             </View>
          </View>
        </BlurView>
      </Modal>
    </View>
  );
}

// --- SUB-COMPONENTS ---

function SettingsSection({ label, children, theme }: any) {
  return (
    <Animated.View entering={FadeInRight.delay(200)} style={styles.sectionContainer}>
      <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>{label}</Text>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {children}
      </View>
    </Animated.View>
  );
}

function MenuRow({ icon, label, right, theme, onPress }: any) {
  return (
    <TouchableOpacity disabled={!onPress} onPress={onPress}>
      <View style={styles.row}>
        <View style={[styles.iconBox, { backgroundColor: theme.background }]}>
          <Ionicons name={icon as any} size={16} color={theme.text} />
        </View>
        <View style={styles.rowContent}>
          <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
        </View>
        {right ? right : <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />}
      </View>
      <View style={[styles.divider, { backgroundColor: theme.border, marginLeft: 50 }]} />
    </TouchableOpacity>
  );
}

function StatItem({ label, value, theme }: any) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgOrb: { position: 'absolute', width: width, height: width, borderRadius: width/2, opacity: 0.08, filter: Platform.OS === 'ios' ? 'blur(80px)' : undefined } as any,
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerCenter: { alignItems: 'center' },
  headerLabel: { color: Theme.brand.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.8, textTransform: 'uppercase' },
  headerTitle: { marginTop: 2, fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  
  scrollContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 120 },
  
  profileCard: { borderRadius: 32, padding: 24, marginBottom: 30, overflow: 'hidden' },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarContainer: { position: 'relative' },
  avatarRing: {
    width: 78,
    height: 78,
    borderRadius: 26,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 22, resizeMode: 'cover', backgroundColor: 'rgba(255,255,255,0.2)' },
  avatarFallback: { flex: 1, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 30, fontWeight: '900', color: '#FFF' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 24, fontWeight: '900', color: '#FFF', letterSpacing: -0.5 },
  profileEmail: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginTop: 4 },

  sectionContainer: { marginBottom: 24 },
  sectionLabel: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12, marginLeft: 4 },
  card: { borderRadius: 28, borderWidth: 1, overflow: 'hidden' },
  
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  rowContent: { flex: 1 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowLabel: { fontSize: 15, fontWeight: '700' },
  rowValue: { fontSize: 12, fontWeight: '600' },
  divider: { height: 1, marginHorizontal: 0, opacity: 0.3 },

  moreLink: { paddingHorizontal: 16, paddingVertical: 12 },
  moreLinkText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '900' },
  statLabel: { fontSize: 10, marginTop: 4, textTransform: 'uppercase', fontWeight: '700' },

  colorPicker: { flexDirection: 'row', gap: 12 },
  colorDot: { width: 22, height: 22, borderRadius: 8 },
  segmentedControl: { flexDirection: 'row', borderRadius: 14, padding: 4, width: 140 },
  segmentBtn: { flex: 1, paddingVertical: 6, borderRadius: 10, alignItems: 'center' },
  segmentText: { fontSize: 10, fontWeight: '900' },

  logoutBtn: { alignItems: 'center', padding: 20, marginTop: 20 },
  logoutText: { fontWeight: '800', fontSize: 14, letterSpacing: 1.5, textTransform: 'uppercase' },
  footer: { alignItems: 'center', marginTop: 20 },
  footerText: { fontSize: 9, fontWeight: '900', letterSpacing: 3, opacity: 0.4 },

  modalContent: { flex: 1, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, marginTop: 20 },
  modalTitle: { fontSize: 28, fontWeight: '900', letterSpacing: -1 },
  doneBtn: { backgroundColor: '#7367f0', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 14 },
  modalBody: { flex: 1 },
  inputLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  modalInput: { borderRadius: 18, padding: 18, fontSize: 16, marginTop: 10, borderWidth: 1, fontWeight: '600' },
  addModalBody: { padding: 24, borderRadius: 24, width: '80%' },
  addOption: { paddingVertical: 12, paddingHorizontal: 16 },
  languageModalBody: {
    borderWidth: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    marginHorizontal: -24,
    paddingBottom: 12,
  },
  languageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  languageModalTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.6 },
  languageList: { paddingHorizontal: 12 },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(120,120,140,0.16)',
  }
});
