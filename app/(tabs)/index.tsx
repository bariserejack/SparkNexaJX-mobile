import React, { useEffect, useMemo, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, RefreshControl,
  Dimensions, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { supabase } from '../../lib/supabase';
import { Theme } from '../../constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, router } from 'expo-router'; 
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import { useAppTheme } from '../../lib/theme';

const { width } = Dimensions.get('window');

const POST_PROTOCOLS = [
  { id: '1', name: 'Secure Intel', icon: 'shield-outline', color: '#7367f0' },
  { id: '2', name: 'Data Nexus', icon: 'share-social-outline', color: '#ce9ffc' },
  { id: '3', name: 'Snippet', icon: 'code-slash-outline', color: '#00d2ff' },
  { id: '4', name: 'Voice Encrypted', icon: 'mic-outline', color: '#32cc70' },
  { id: '5', name: 'Photo / Video', icon: 'image-outline', color: '#4facfe' },
  { id: '6', name: 'Live Spotlight', icon: 'videocam-outline', color: '#ff5e62' },
  { id: '7', name: 'Check In', icon: 'location-outline', color: '#f59e0b' },
  { id: '8', name: 'Feeling / Activity', icon: 'happy-outline', color: '#22c55e' },
  { id: '9', name: 'Music Drop', icon: 'musical-notes-outline', color: '#fb7185' },
  { id: '10', name: 'GIF Burst', icon: 'sparkles-outline', color: '#38bdf8' },
];

const AUDIENCE_OPTIONS = [
  { id: 'public', label: 'Public', sub: 'Anyone on or off SparkNexa', icon: 'earth-outline' },
  { id: 'friends', label: 'Friends', sub: 'Your friends on SparkNexa', icon: 'people-outline' },
  { id: 'friends_except', label: 'Friends except...', sub: "Don't show to some friends", icon: 'person-remove-outline' },
  { id: 'specific_friends', label: 'Specific friends', sub: 'Only show to some friends', icon: 'person-add-outline' },
  { id: 'only_me', label: 'Only me', sub: 'Only me', icon: 'lock-closed-outline' },
];

const POST_TOOLS = [
  { id: 'photo_video', label: 'Photo/Video', icon: 'image-outline' },
  { id: 'tag_people', label: 'Tag people', icon: 'person-add-outline' },
  { id: 'feeling_activity', label: 'Feeling/Activity', icon: 'happy-outline' },
  { id: 'check_in', label: 'Check in', icon: 'location-outline' },
  { id: 'live_video', label: 'Live Video', icon: 'videocam-outline' },
  { id: 'background_color', label: 'Background Color', icon: 'color-palette-outline' },
  { id: 'camera', label: 'Camera', icon: 'camera-outline' },
  { id: 'gif', label: 'GIF', icon: 'sparkles-outline' },
  { id: 'life_update', label: 'Life Update', icon: 'flag-outline' },
  { id: 'music', label: 'Music', icon: 'musical-notes-outline' },
  { id: 'call', label: 'Get Calls', icon: 'call-outline' },
];

type ComposerStep = 'audience' | 'category' | 'publish';

const COMPOSER_STEPS: Array<{ key: ComposerStep; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { key: 'audience', label: 'Audience', icon: 'people-outline' },
  { key: 'category', label: 'Category', icon: 'apps-outline' },
  { key: 'publish', label: 'Publish', icon: 'rocket-outline' },
];

function TransmissionCard({ user, content, time, theme, isDark }: any) {
  return (
    <BlurView 
      intensity={isDark ? 20 : 60} 
      tint={isDark ? "dark" : "light"} 
      style={[styles.postCard, { 
        borderColor: theme.border,
        backgroundColor: theme.card 
      }]}
    >
      <View style={styles.postHeader}>
        <View style={[styles.postAvatarThumb, { backgroundColor: Theme.brand.primary }]} />
        <View>
          <Text style={[styles.postUser, { color: theme.text }]}>{user}</Text>
          <Text style={[styles.postTime, { color: theme.textMuted }]}>{time}</Text>
        </View>
      </View>
      <Text style={[styles.postBody, { color: theme.text }]}>{content}</Text>
      <View style={styles.postActions}>
          <TouchableOpacity style={styles.actionBtn}><Ionicons name="heart-outline" size={16} color={theme.textMuted} /></TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}><Ionicons name="chatbubble-outline" size={16} color={theme.textMuted} /></TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}><Ionicons name="share-outline" size={16} color={theme.textMuted} /></TouchableOpacity>
      </View>
    </BlurView>
  );
}

export default function HomeScreen() {
  const { activeTheme, isDark } = useAppTheme();
  const navigation = useNavigation(); 
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [composerSearchQuery, setComposerSearchQuery] = useState('');
  const [composerStep, setComposerStep] = useState<ComposerStep>('audience');
  const [selectedAudience, setSelectedAudience] = useState('public');
  const [selectedProtocolId, setSelectedProtocolId] = useState(POST_PROTOCOLS[0].id);
  const [selectedPostTools, setSelectedPostTools] = useState<string[]>([]);

  const composerQuery = composerSearchQuery.trim().toLowerCase();
  const filteredProtocols = useMemo(
    () =>
      composerQuery
        ? POST_PROTOCOLS.filter((item) => item.name.toLowerCase().includes(composerQuery))
        : POST_PROTOCOLS,
    [composerQuery]
  );
  const filteredPostTools = useMemo(
    () =>
      composerQuery
        ? POST_TOOLS.filter((item) => item.label.toLowerCase().includes(composerQuery))
        : POST_TOOLS,
    [composerQuery]
  );
  const filteredAudienceOptions = useMemo(
    () =>
      composerQuery
        ? AUDIENCE_OPTIONS.filter(
            (item) =>
              item.label.toLowerCase().includes(composerQuery) || item.sub.toLowerCase().includes(composerQuery)
          )
        : AUDIENCE_OPTIONS,
    [composerQuery]
  );
  const selectedAudienceData = useMemo(
    () => AUDIENCE_OPTIONS.find((item) => item.id === selectedAudience) ?? AUDIENCE_OPTIONS[0],
    [selectedAudience]
  );
  const selectedProtocol = useMemo(
    () => POST_PROTOCOLS.find((item) => item.id === selectedProtocolId) ?? POST_PROTOCOLS[0],
    [selectedProtocolId]
  );
  const selectedToolLabels = useMemo(
    () => POST_TOOLS.filter((item) => selectedPostTools.includes(item.id)).map((item) => item.label),
    [selectedPostTools]
  );
  const activeStepMeta = useMemo(
    () => COMPOSER_STEPS.find((step) => step.key === composerStep) ?? COMPOSER_STEPS[0],
    [composerStep]
  );

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  async function loadDashboardData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
        setProfileName(profile?.full_name || user.email?.split('@')[0] || "User");
      }
    } catch (error) { 
      console.error("Dashboard error:", error); 
    } finally { 
      setLoading(false); 
    }
  }

  const openProtocolMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setComposerStep('audience');
    setComposerSearchQuery('');
    setIsMenuOpen(true);
  };

  const closeProtocolMenu = () => {
    setIsMenuOpen(false);
  };

  const goToNextComposerStep = () => {
    setComposerStep((prev) => {
      if (prev === 'audience') return 'category';
      if (prev === 'category') return 'publish';
      return 'publish';
    });
  };

  const goToPrevComposerStep = () => {
    setComposerStep((prev) => {
      if (prev === 'publish') return 'category';
      if (prev === 'category') return 'audience';
      return 'audience';
    });
  };

  const togglePostTool = (toolId: string) => {
    setSelectedPostTools((prev) =>
      prev.includes(toolId) ? prev.filter((item) => item !== toolId) : [...prev, toolId]
    );
  };

  const publishTransmission = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsMenuOpen(false);
    setComposerStep('audience');
    setComposerSearchQuery('');
    setSelectedPostTools([]);
  };

  const openSideMenu = () => {
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

  if (loading) {
    return (
      <View style={[styles.loader, { backgroundColor: activeTheme.background }]}>
        <ActivityIndicator color={Theme.brand.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <View style={[styles.glowOrb, { top: -80, right: -40, backgroundColor: Theme.brand.primary, opacity: isDark ? 0.15 : 0.08 }]} />
      <View style={[styles.glowOrb, { bottom: 120, left: -100, backgroundColor: Theme.brand.accent, opacity: isDark ? 0.15 : 0.08 }]} />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.navBar}>
          <TouchableOpacity onPress={openSideMenu} style={styles.menuTrigger}>
            <BlurView intensity={40} tint={isDark ? "dark" : "light"} style={[styles.iconInner, { backgroundColor: activeTheme.glass }]}>
              <Ionicons name="reorder-three-outline" size={16} color={activeTheme.text} />
            </BlurView>
          </TouchableOpacity>

          <View style={styles.centerHeader}>
            <Text style={styles.welcomeText}>SPARKNEXA HOME</Text>
            <Text style={[styles.userName, { color: activeTheme.text }]} numberOfLines={1}>{profileName}</Text>
          </View>

          <View style={styles.navActions}>
            <TouchableOpacity style={styles.glassIcon} onPress={() => router.push('/pulse')}>
               <BlurView intensity={40} tint={isDark ? "dark" : "light"} style={[styles.iconInner, { backgroundColor: activeTheme.glass }]}>
                 <Ionicons name="chatbubbles-outline" size={16} color={Theme.brand.primary} />
               </BlurView>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchWrap}>
          <BlurView intensity={isDark ? 25 : 60} tint={isDark ? "dark" : "light"} style={[styles.searchBar, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
            <Ionicons name="search-outline" size={16} color={activeTheme.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: activeTheme.text }]}
              placeholder="Search tasks, updates, teams..."
              placeholderTextColor={activeTheme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </BlurView>
        </View>



        <ScrollView 
          contentContainerStyle={styles.content} 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.brand.primary} />}
        >
          <View style={styles.section}>
            <View style={styles.streamHeader}>
              <Text style={[styles.sectionLabel, { color: activeTheme.textMuted, marginBottom: 0 }]}>NEURAL STREAM</Text>
              <Text style={styles.streamHint}>Slide feed</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.streamSlideTrack}>
              <TouchableOpacity
                style={[styles.streamSlideCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}
                onPress={() => router.push('/pulse')}
              >
                <LinearGradient
                  colors={['rgba(115, 103, 240, 0.22)', 'rgba(206, 159, 252, 0.08)']}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={[styles.streamSlideIconWrap, { backgroundColor: activeTheme.background }]}>
                  <Ionicons name="add" size={16} color={Theme.brand.primary} />
                </View>
                <Text style={[styles.streamSlideTitle, { color: activeTheme.text }]}>You</Text>
                <Text style={[styles.streamSlideSub, { color: activeTheme.textMuted }]}>Create pulse</Text>
              </TouchableOpacity>

              {[1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  style={[styles.streamSlideCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}
                >
                  <View
                    style={[
                      styles.streamSlideIconWrap,
                      {
                        backgroundColor: i % 2 === 0 ? 'rgba(115, 103, 240, 0.12)' : 'rgba(206, 159, 252, 0.12)',
                      },
                    ]}
                  >
                    <Ionicons
                      name={i % 2 === 0 ? 'radio-outline' : 'pulse-outline'}
                      size={16}
                      color={i % 2 === 0 ? Theme.brand.primary : Theme.brand.accent}
                    />
                  </View>
                  <Text style={[styles.streamSlideTitle, { color: activeTheme.text }]}>Signal_{i}</Text>
                  <Text style={[styles.streamSlideSub, { color: activeTheme.textMuted }]}>Neural channel</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity activeOpacity={0.9} onPress={openProtocolMenu} style={styles.transmissionWrapper}>
            <BlurView intensity={isDark ? 60 : 80} tint={isDark ? "dark" : "light"} style={[styles.transmissionCard, { borderColor: activeTheme.border }]}>
              <LinearGradient 
                colors={isDark ? ['rgba(115, 103, 240, 0.1)', 'rgba(206, 159, 252, 0.05)'] : ['rgba(115, 103, 240, 0.05)', 'rgba(255, 255, 255, 0.01)']} 
                style={StyleSheet.absoluteFill} 
              />
              <View style={styles.transmissionContent}>
                <View style={styles.transmissionHeader}>
                  <View style={[styles.statusDot, { backgroundColor: Theme.brand.success }]} />
                  <Text style={styles.statusText}>ENCRYPTION ACTIVE</Text>
                </View>
                <Text style={[styles.transmissionMainText, { color: activeTheme.text }]}>Initialize Transmission...</Text>
              </View>
            </BlurView>
          </TouchableOpacity>

          <View style={styles.feedHeader}>
            <Text style={[styles.feedTitle, { color: activeTheme.text }]}>Global Data</Text>
          </View>
          
          <TransmissionCard 
              user="Nexus_Core" 
              content="Optimization complete. The SparkNexa neural engine is now running at 98% efficiency." 
              time="2m ago"
              theme={activeTheme}
              isDark={isDark}
          />

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>

      {/* --- PROTOCOL OVERLAY MENU --- */}
      {isMenuOpen && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.overlay}>
          <BlurView intensity={90} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill}>
            <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeProtocolMenu} />
            <Animated.View 
              entering={FadeInDown.springify()} 
              style={[styles.menuContent, { backgroundColor: activeTheme.background, borderColor: activeTheme.border }]}
            >
              <View style={[styles.menuDragHandle, { backgroundColor: activeTheme.textMuted + '40' }]} />
              <View style={styles.menuHeader}>
                <View style={styles.menuHeaderLeft}>
                  {composerStep !== 'audience' ? (
                    <TouchableOpacity onPress={goToPrevComposerStep} style={styles.menuBackBtn}>
                      <Ionicons name="chevron-back" size={16} color={activeTheme.text} />
                    </TouchableOpacity>
                  ) : null}
                  <View style={[styles.menuHeaderIconWrap, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
                    <Ionicons name={activeStepMeta.icon} size={16} color={Theme.brand.primary} />
                  </View>
                  <View>
                    <Text style={[styles.menuTitle, { color: activeTheme.text }]}>
                      {composerStep === 'audience' ? 'Choose Audience' : composerStep === 'category' ? 'Select Category' : 'Publish Post'}
                    </Text>
                    <Text style={[styles.menuSubtitle, { color: activeTheme.textMuted }]}>
                      {composerStep === 'audience'
                        ? 'Step 1 of 3'
                        : composerStep === 'category'
                          ? 'Step 2 of 3'
                          : 'Step 3 of 3'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={closeProtocolMenu}>
                   <Ionicons name="close-outline" size={16} color={activeTheme.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={styles.stepIndicatorRow}>
                {COMPOSER_STEPS.map((step) => {
                  const active = composerStep === step.key;
                  return (
                    <View
                      key={step.key}
                      style={[
                        styles.stepPill,
                        { backgroundColor: active ? Theme.brand.primary : activeTheme.card, borderColor: activeTheme.border },
                      ]}
                    >
                      <Ionicons name={step.icon} size={16} color={active ? '#FFF' : activeTheme.textMuted} />
                      <Text style={[styles.stepPillText, { color: active ? '#FFF' : activeTheme.textMuted }]}>{step.label}</Text>
                    </View>
                  );
                })}
              </View>

              {composerStep !== 'publish' ? (
                <BlurView
                  intensity={isDark ? 30 : 60}
                  tint={isDark ? "dark" : "light"}
                  style={[styles.menuSearchBar, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}
                >
                  <Ionicons name="search-outline" size={16} color={activeTheme.textMuted} />
                  <TextInput
                    style={[styles.menuSearchInput, { color: activeTheme.text }]}
                    placeholder={composerStep === 'audience' ? 'Search audience...' : 'Search categories and tools...'}
                    placeholderTextColor={activeTheme.textMuted}
                    value={composerSearchQuery}
                    onChangeText={setComposerSearchQuery}
                  />
                </BlurView>
              ) : null}

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.menuScrollContent}>
                {composerStep === 'audience' ? (
                  <>
                    <Text style={[styles.menuSectionTitle, { color: activeTheme.textMuted }]}>Who can see your post?</Text>
                    <View style={[styles.audienceCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
                      {filteredAudienceOptions.length === 0 ? (
                        <Text style={[styles.emptyMenuText, { color: activeTheme.textMuted }]}>No audience options found.</Text>
                      ) : filteredAudienceOptions.map((item, index) => {
                        const selected = selectedAudience === item.id;
                        return (
                          <View key={item.id}>
                            <TouchableOpacity style={styles.audienceRow} onPress={() => setSelectedAudience(item.id)}>
                              <View style={[styles.audienceIconBox, { backgroundColor: activeTheme.background }]}>
                                <Ionicons name={item.icon as any} size={16} color={activeTheme.text} />
                              </View>
                              <View style={styles.audienceTextWrap}>
                                <Text style={[styles.audienceLabel, { color: activeTheme.text }]}>{item.label}</Text>
                                <Text style={[styles.audienceSub, { color: activeTheme.textMuted }]}>{item.sub}</Text>
                              </View>
                              <Ionicons
                                name={selected ? 'radio-button-on' : 'radio-button-off'}
                                size={16}
                                color={selected ? Theme.brand.primary : activeTheme.textMuted}
                              />
                            </TouchableOpacity>
                            {index < filteredAudienceOptions.length - 1 ? (
                              <View style={[styles.audienceDivider, { backgroundColor: activeTheme.border }]} />
                            ) : null}
                          </View>
                        );
                      })}
                    </View>
                  </>
                ) : null}

                {composerStep === 'category' ? (
                  <>
                    <Text style={[styles.menuSectionTitle, { color: activeTheme.textMuted }]}>Post categories</Text>
                    <View style={styles.categoryGrid}>
                      {filteredProtocols.length === 0 ? (
                        <Text style={[styles.emptyMenuText, { color: activeTheme.textMuted }]}>No categories found.</Text>
                      ) : filteredProtocols.map((cat) => {
                        const selected = selectedProtocolId === cat.id;
                        return (
                          <TouchableOpacity
                            key={cat.id}
                            style={[
                              styles.catCard,
                              {
                                backgroundColor: activeTheme.card,
                                borderColor: selected ? Theme.brand.primary : activeTheme.border,
                              },
                            ]}
                            onPress={() => setSelectedProtocolId(cat.id)}
                          >
                            <View style={[styles.catIconBox, { backgroundColor: `${cat.color}20` }]}>
                              <Ionicons name={cat.icon as any} size={16} color={cat.color} />
                            </View>
                            <Text style={[styles.catLabel, { color: activeTheme.text }]}>{cat.name}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <Text style={[styles.menuSectionTitle, { color: activeTheme.textMuted }]}>Add to post</Text>
                    <View style={[styles.toolsCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
                      {filteredPostTools.length === 0 ? (
                        <Text style={[styles.emptyMenuText, { color: activeTheme.textMuted }]}>No related post tools found.</Text>
                      ) : filteredPostTools.map((tool, index) => {
                        const selected = selectedPostTools.includes(tool.id);
                        return (
                          <View key={tool.id}>
                            <TouchableOpacity style={styles.toolRow} onPress={() => togglePostTool(tool.id)}>
                              <View style={[styles.toolIconBox, { backgroundColor: activeTheme.background }]}>
                                <Ionicons name={tool.icon as any} size={16} color={Theme.brand.primary} />
                              </View>
                              <Text style={[styles.toolLabel, { color: activeTheme.text }]}>{tool.label}</Text>
                              <Ionicons
                                name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                                size={16}
                                color={selected ? Theme.brand.primary : activeTheme.textMuted}
                              />
                            </TouchableOpacity>
                            {index < filteredPostTools.length - 1 ? (
                              <View style={[styles.audienceDivider, { backgroundColor: activeTheme.border }]} />
                            ) : null}
                          </View>
                        );
                      })}
                    </View>
                  </>
                ) : null}

                {composerStep === 'publish' ? (
                  <>
                    <Text style={[styles.menuSectionTitle, { color: activeTheme.textMuted }]}>Review your post settings</Text>
                    <View style={[styles.publishCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
                      <View style={styles.publishRow}>
                        <Ionicons name="people-outline" size={16} color={Theme.brand.primary} />
                        <Text style={[styles.publishLabel, { color: activeTheme.textMuted }]}>Audience</Text>
                        <Text style={[styles.publishValue, { color: activeTheme.text }]}>{selectedAudienceData.label}</Text>
                      </View>
                      <View style={[styles.audienceDivider, { backgroundColor: activeTheme.border, marginLeft: 0 }]} />
                      <View style={styles.publishRow}>
                        <Ionicons name="apps-outline" size={16} color={Theme.brand.primary} />
                        <Text style={[styles.publishLabel, { color: activeTheme.textMuted }]}>Category</Text>
                        <Text style={[styles.publishValue, { color: activeTheme.text }]}>{selectedProtocol.name}</Text>
                      </View>
                      <View style={[styles.audienceDivider, { backgroundColor: activeTheme.border, marginLeft: 0 }]} />
                      <View style={styles.publishRowColumn}>
                        <Ionicons name="add-circle-outline" size={16} color={Theme.brand.primary} />
                        <Text style={[styles.publishLabel, { color: activeTheme.textMuted }]}>Add to post</Text>
                        <Text style={[styles.publishValue, { color: activeTheme.text }]}>
                          {selectedToolLabels.length > 0 ? selectedToolLabels.join(', ') : 'No additional tools selected'}
                        </Text>
                      </View>
                    </View>
                  </>
                ) : null}
              </ScrollView>

              <View style={styles.menuFooter}>
                <TouchableOpacity
                  style={[styles.menuSecondaryBtn, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}
                  onPress={composerStep === 'audience' ? closeProtocolMenu : goToPrevComposerStep}
                >
                  <Text style={[styles.menuSecondaryBtnText, { color: activeTheme.text }]}>
                    {composerStep === 'audience' ? 'Cancel' : 'Back'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuPrimaryBtn}
                  onPress={composerStep === 'publish' ? publishTransmission : goToNextComposerStep}
                >
                  <Text style={styles.menuPrimaryBtnText}>
                    {composerStep === 'publish' ? `Publish to ${selectedAudienceData.label}` : 'Next'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </BlurView>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  glowOrb: { position: 'absolute', width: 300, height: 300, borderRadius: 150 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { paddingBottom: 20, paddingHorizontal: 20 },
  navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  menuTrigger: { borderRadius: 18, overflow: 'hidden' },
  centerHeader: { alignItems: 'center' },
  welcomeText: { color: Theme.brand.primary, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 2 },
  userName: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  navActions: { flexDirection: 'row', gap: 10 },
  iconInner: { padding: 12 },
  glassIcon: { borderRadius: 18, overflow: 'hidden' },
  searchWrap: { paddingHorizontal: 20, paddingBottom: 8 },
  searchBar: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
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
  composerWrap: { paddingHorizontal: 20, marginBottom: 14 },
  composerCard: {
    borderWidth: 1,
    borderRadius: 18,
    minHeight: 66,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    overflow: 'hidden',
  },
  composerTextWrap: { flex: 1 },
  composerText: { fontSize: 14, fontWeight: '700' },
  composerHint: { marginTop: 2, fontSize: 12, fontWeight: '500' },
  composerIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { marginBottom: 35 },
  sectionLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginBottom: 15 },
  streamHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  streamHint: { color: Theme.brand.primary, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  streamSlideTrack: { gap: 14, paddingRight: 4 },
  streamSlideCard: {
    width: 142,
    height: 172,
    borderRadius: 30,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  streamSlideIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  streamSlideTitle: { fontSize: 14, fontWeight: '800', marginBottom: 2 },
  streamSlideSub: { fontSize: 11, fontWeight: '600' },
  transmissionWrapper: { marginBottom: 35 },
  transmissionCard: { borderRadius: 32, overflow: 'hidden', borderWidth: 1 },
  transmissionContent: { padding: 25 },
  transmissionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { color: Theme.brand.success, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  transmissionMainText: { fontSize: 20, fontWeight: '700' },
  feedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  feedTitle: { fontSize: 22, fontWeight: '900' },
  postCard: { marginBottom: 18, borderRadius: 32, padding: 20, borderWidth: 1, overflow: 'hidden' },
  postHeader: { flexDirection: 'row', gap: 14, marginBottom: 16 },
  postAvatarThumb: { width: 48, height: 48, borderRadius: 18 },
  postUser: { fontWeight: '800', fontSize: 16 },
  postTime: { fontSize: 12, fontWeight: '600' },
  postBody: { lineHeight: 22, fontSize: 15, marginBottom: 20, fontWeight: '500' },
  postActions: { flexDirection: 'row', gap: 28 },
  actionBtn: { padding: 2 },
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 1000 },
  menuContent: {
    position: 'absolute',
    bottom: 0,
    width: width,
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    padding: 24,
    paddingBottom: 36,
    borderTopWidth: 1,
    maxHeight: '92%',
  },
  menuDragHandle: { width: 40, height: 5, borderRadius: 2.5, alignSelf: 'center', marginBottom: 25 },
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  menuHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  menuBackBtn: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  menuHeaderIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: { fontSize: 24, fontWeight: '900' },
  menuSubtitle: { marginTop: 2, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.7 },
  stepIndicatorRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  stepPill: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepPillText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  menuSearchBar: {
    borderWidth: 1,
    borderRadius: 14,
    height: 44,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  menuSearchInput: { flex: 1, fontSize: 14, fontWeight: '600' },
  menuScrollContent: { paddingTop: 16, paddingBottom: 10 },
  menuSectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
    marginTop: 6,
  },
  audienceCard: { borderWidth: 1, borderRadius: 18, overflow: 'hidden', marginBottom: 16 },
  audienceRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  audienceIconBox: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  audienceTextWrap: { flex: 1 },
  audienceLabel: { fontSize: 15, fontWeight: '700' },
  audienceSub: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  audienceDivider: { height: 1, marginLeft: 56 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  catCard: { width: (width - 80) / 2, padding: 20, borderRadius: 24, marginBottom: 20, alignItems: 'center', borderWidth: 1 },
  catIconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  catLabel: { fontSize: 13, fontWeight: '800' },
  toolsCard: { borderWidth: 1, borderRadius: 18, overflow: 'hidden', marginTop: 2 },
  toolRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  toolIconBox: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  toolLabel: { flex: 1, fontSize: 15, fontWeight: '700' },
  emptyMenuText: { paddingHorizontal: 14, paddingVertical: 14, fontSize: 13, fontWeight: '500' },
  publishCard: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  publishRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, gap: 8 },
  publishRowColumn: { paddingVertical: 10, gap: 6, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 8 },
  publishLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  publishValue: { fontSize: 14, fontWeight: '700', flexShrink: 1 },
  menuFooter: { flexDirection: 'row', gap: 10, marginTop: 14 },
  menuSecondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuSecondaryBtnText: { fontSize: 14, fontWeight: '700' },
  menuPrimaryBtn: {
    flex: 1.5,
    borderRadius: 14,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.brand.primary,
  },
  menuPrimaryBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
});
