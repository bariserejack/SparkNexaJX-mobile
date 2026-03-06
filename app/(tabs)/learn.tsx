import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  StatusBar,
  Pressable,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import Animated, { 
  FadeInRight, 
  FadeInDown,
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from "react-native-reanimated";
import { Theme } from "../../constants/Theme"; 
import { useAppTheme } from "../../lib/theme";

const { width } = Dimensions.get("window");

// 1. Interactive Wrapper
const Interactive = ({ children, onPress, style }: any) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ 
    transform: [{ scale: scale.value }] 
  }));

  return (
    <Pressable
      onPressIn={() => { 
        scale.value = withSpring(0.96); 
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); 
      }}
      onPressOut={() => (scale.value = withSpring(1))}
      onPress={onPress}
    >
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
};

// 2. Skill Node
const SkillNode = ({ icon, label, progress, theme }: any) => (
  <View style={[styles.skillNode, { backgroundColor: theme.card, borderColor: theme.border }]}>
    <View style={[styles.nodeIconBg, { backgroundColor: Theme.brand.primary + '15' }]}>
      <Ionicons name={icon} size={20} color={Theme.brand.primary} />
    </View>
    <View style={styles.nodeInfo}>
      <Text style={[styles.nodeLabel, { color: theme.text }]}>{label}</Text>
      <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
        <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: Theme.brand.primary }]} />
      </View>
    </View>
    <Text style={[styles.nodePercentage, { color: theme.textMuted }]}>{progress}%</Text>
  </View>
);

// 3. Video Card
const VideoBlueprintCard = ({ title, instructor, duration, color, index, theme, isDark }: any) => (
  <Animated.View entering={FadeInRight.delay(index * 100)}>
    <Interactive style={[styles.videoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <LinearGradient 
        colors={['transparent', isDark ? 'rgba(6, 6, 18, 0.95)' : 'rgba(255, 255, 255, 0.95)']} 
        style={styles.videoGradient}
      >
        <View style={[styles.playTag, { backgroundColor: color }]}>
          <Ionicons name="play" size={10} color="#FFF" />
          <Text style={styles.playTagText}>{duration}</Text>
        </View>
        <Text style={[styles.videoTitle, { color: theme.text }]} numberOfLines={2}>{title}</Text>
        <Text style={[styles.videoInstructor, { color: theme.textMuted }]}>{instructor}</Text>
      </LinearGradient>
      <View style={[styles.videoGlow, { backgroundColor: color }]} />
    </Interactive>
  </Animated.View>
);

export default function LearnScreen() {
  const { activeTheme, isDark } = useAppTheme();
  const navigation = useNavigation();

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

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Background Atmosphere */}
      <View style={[styles.bgOrb, { top: -50, right: -50, backgroundColor: Theme.brand.primary, opacity: isDark ? 0.1 : 0.05 }]} />

      <BlurView intensity={isDark ? 20 : 80} tint={activeTheme.tint as any} style={[styles.headerContainer, { borderBottomColor: activeTheme.border }]}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.topAction} onPress={openDrawer}>
            <Ionicons name="reorder-three-outline" size={24} color={activeTheme.text} />
          </TouchableOpacity>
          <View style={styles.topCenter}>
            <Text style={styles.topLabel}>LEARNING NODE</Text>
            <Text style={[styles.topTitle, { color: activeTheme.text }]}>Learn</Text>
          </View>
          <TouchableOpacity style={styles.topAction} onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={21} color={activeTheme.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerContent}>
          <Text style={[styles.headerSubtitle, { color: Theme.brand.primary }]}>KNOWLEDGE ARCHIVE</Text>
          <Text style={[styles.headerTitle, { color: activeTheme.text }]}>Blueprints</Text>
        </View>
      </BlurView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Neural Progress Tracker */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: activeTheme.text }]}>Neural Progress</Text>
            <TouchableOpacity><Text style={{color: Theme.brand.primary, fontWeight: '700'}}>Sync</Text></TouchableOpacity>
          </View>
          <View style={styles.skillsGrid}>
            <SkillNode icon="code-slash" label="System Architecture" progress={78} theme={activeTheme} />
            <SkillNode icon="color-palette" label="Neural UI/UX" progress={92} theme={activeTheme} />
            <SkillNode icon="server" label="Backend Mastery" progress={45} theme={activeTheme} />
          </View>
        </Animated.View>

        {/* Featured Mastery Card */}
        <View style={styles.tutorialContainer}>
          <Text style={[styles.sectionTitle, { color: activeTheme.text, paddingHorizontal: 25 }]}>Daily Mastery</Text>
          <Interactive style={styles.tutorialSlide}>
            <LinearGradient 
              colors={Theme.brand.primaryGradient} 
              start={{x: 0, y: 0}} end={{x: 1, y: 1}}
              style={styles.slideGradient}
            >
              <View style={styles.slideInfo}>
                <View style={styles.premiumBadge}>
                  <Ionicons name="star" size={10} color="#FFF" />
                  <Text style={styles.premiumText}>PREMIUM MODULE</Text>
                </View>
                <Text style={styles.slideTitle}>Deep Focus Protocols</Text>
                <Text style={styles.slideDesc}>Advanced neuro-scientific methods to maintain 4-hour focus blocks.</Text>
                
                <TouchableOpacity style={[styles.resumeBtn, { backgroundColor: isDark ? '#FFF' : activeTheme.background }]}>
                  <Text style={[styles.resumeBtnText, { color: isDark ? '#060612' : Theme.brand.primary }]}>Resume Protocol</Text>
                  <Ionicons name="arrow-forward" size={16} color={isDark ? Theme.brand.primary : Theme.brand.primary} />
                </TouchableOpacity>
              </View>
              <Ionicons name="pulse" size={100} color="rgba(255,255,255,0.1)" style={styles.bgIcon} />
            </LinearGradient>
          </Interactive>
        </View>

        {/* Video Masterclasses */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: activeTheme.text, paddingHorizontal: 25 }]}>Video Masterclasses</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.videoScroll}>
            <VideoBlueprintCard theme={activeTheme} isDark={isDark} index={1} title="Advanced Motion Systems" instructor="Dr. Nexa" duration="45m" color="#7367f0" />
            <VideoBlueprintCard theme={activeTheme} isDark={isDark} index={2} title="Cloud Native Scaling" instructor="Alex Dev" duration="1h 10m" color="#00D2FF" />
            <VideoBlueprintCard theme={activeTheme} isDark={isDark} index={3} title="Security & Encryption" instructor="Elena Ray" duration="32m" color="#FF3B30" />
          </ScrollView>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgOrb: { position: 'absolute', width: 300, height: 300, borderRadius: 150 },
  headerContainer: { position: 'absolute', top: 0, width: '100%', zIndex: 10, paddingTop: 52, paddingBottom: 20, borderBottomWidth: 1 },
  topBar: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
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
    fontWeight: "900",
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  topTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.3 },
  headerContent: { paddingHorizontal: 25 },
  headerSubtitle: { fontSize: 10, fontWeight: "900", letterSpacing: 2, marginBottom: 5 },
  headerTitle: { fontSize: 34, fontWeight: "900", letterSpacing: -1 },
  scrollContent: { paddingTop: 194 },
  
  section: { marginBottom: 35 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  
  skillsGrid: { paddingHorizontal: 25, gap: 12 },
  skillNode: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 24, borderWidth: 1 },
  nodeIconBg: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  nodeInfo: { flex: 1 },
  nodeLabel: { fontSize: 14, fontWeight: '800', marginBottom: 6 },
  progressBarBg: { height: 6, borderRadius: 3, width: '100%', overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  nodePercentage: { fontSize: 12, fontWeight: '900', marginLeft: 15, width: 35 },

  tutorialContainer: { marginBottom: 40 },
  tutorialSlide: { width: width - 50, marginHorizontal: 25, borderRadius: 32, overflow: 'hidden', elevation: 10, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 15 },
  slideGradient: { padding: 30, position: 'relative' },
  slideInfo: { zIndex: 2 },
  premiumBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, gap: 5, marginBottom: 15 },
  premiumText: { color: '#FFF', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  slideTitle: { fontSize: 26, fontWeight: '900', color: '#FFF', marginBottom: 10 },
  slideDesc: { fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 20, marginBottom: 20, maxWidth: '80%' },
  resumeBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 8 },
  resumeBtnText: { fontWeight: '900', fontSize: 14 },
  bgIcon: { position: 'absolute', right: -10, bottom: -10 },

  videoScroll: { paddingLeft: 25, gap: 15, paddingRight: 25 },
  videoCard: { width: 200, height: 280, borderRadius: 32, overflow: 'hidden', borderWidth: 1 },
  videoGradient: { flex: 1, justifyContent: 'flex-end', padding: 20 },
  videoGlow: { position: 'absolute', top: 0, left: 0, width: '100%', height: 4, opacity: 0.8 },
  playTag: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 6, marginBottom: 12 },
  playTagText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
  videoTitle: { fontSize: 17, fontWeight: '900', marginBottom: 6, lineHeight: 22 },
  videoInstructor: { fontSize: 13, fontWeight: '600', opacity: 0.7 },
});
