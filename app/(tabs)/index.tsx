import React, { useEffect, useState } from 'react';
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
import { AppLogo } from '../../components/AppLogo';

const { width } = Dimensions.get('window');

const POST_PROTOCOLS = [
  { id: '1', name: 'Secure Intel', icon: 'shield-outline', color: '#7367f0' },
  { id: '2', name: 'Data Nexus', icon: 'share-social-outline', color: '#ce9ffc' },
  { id: '3', name: 'Snippet', icon: 'code-slash-outline', color: '#00d2ff' },
  { id: '4', name: 'Vocal encrypted', icon: 'mic-outline', color: '#32cc70' },
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
          <TouchableOpacity style={styles.actionBtn}><Ionicons name="heart-outline" size={20} color={theme.textMuted} /></TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}><Ionicons name="chatbubble-outline" size={20} color={theme.textMuted} /></TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}><Ionicons name="share-outline" size={20} color={theme.textMuted} /></TouchableOpacity>
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

  const toggleProtocolMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsMenuOpen(!isMenuOpen);
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
              <Ionicons name="reorder-three-outline" size={22} color={activeTheme.text} />
            </BlurView>
          </TouchableOpacity>

          <View style={styles.centerHeader}>
            <Text style={styles.welcomeText}>SPARKNEXA HOME</Text>
            <Text style={[styles.userName, { color: activeTheme.text }]} numberOfLines={1}>{profileName}</Text>
          </View>

          <View style={styles.navActions}>
            <TouchableOpacity style={styles.glassIcon} onPress={() => router.push('/pulse')}>
               <BlurView intensity={40} tint={isDark ? "dark" : "light"} style={[styles.iconInner, { backgroundColor: activeTheme.glass }]}>
                 <Ionicons name="send" size={20} color={Theme.brand.primary} />
               </BlurView>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchWrap}>
          <BlurView intensity={isDark ? 25 : 60} tint={isDark ? "dark" : "light"} style={[styles.searchBar, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
            <Ionicons name="search-outline" size={18} color={activeTheme.textMuted} />
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
            <Text style={[styles.sectionLabel, { color: activeTheme.textMuted }]}>NEURAL STREAM</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pulseScroll}>
              <TouchableOpacity style={styles.pulseItem} onPress={() => router.push('/pulse')}>
                <LinearGradient colors={Theme.brand.primaryGradient} style={styles.pulseAvatarGradient}>
                  <View style={[styles.pulseAvatarInner, { backgroundColor: activeTheme.background }]}>
                    <Ionicons name="add" size={24} color={Theme.brand.primary} />
                  </View>
                </LinearGradient>
                <Text style={[styles.pulseLabel, { color: activeTheme.text }]}>You</Text>
              </TouchableOpacity>
              
              {[1, 2, 3, 4].map((i) => (
                <View key={i} style={styles.pulseItem}>
                   <View style={[styles.neuralNode, { backgroundColor: activeTheme.card }]}>
                      <View style={[styles.nodeInner, { borderColor: i % 2 === 0 ? Theme.brand.primary : Theme.brand.accent }]} />
                   </View>
                   <Text style={[styles.pulseLabel, { color: activeTheme.text }]}>Signal_{i}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity activeOpacity={0.9} onPress={toggleProtocolMenu} style={styles.transmissionWrapper}>
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
            <TouchableOpacity onPress={() => router.push('/pulse')}>
                <Text style={{color: Theme.brand.primary, fontWeight: '700'}}>Live Pulse</Text>
            </TouchableOpacity>
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
            <TouchableOpacity style={StyleSheet.absoluteFill} onPress={toggleProtocolMenu} />
            <Animated.View 
              entering={FadeInDown.springify()} 
              style={[styles.menuContent, { backgroundColor: activeTheme.background, borderColor: activeTheme.border }]}
            >
              <View style={[styles.menuDragHandle, { backgroundColor: activeTheme.textMuted + '40' }]} />
              <View style={styles.menuHeader}>
                <Text style={[styles.menuTitle, { color: activeTheme.text }]}>Neural Hub</Text>
                <TouchableOpacity onPress={toggleProtocolMenu}>
                   <Ionicons name="close-circle" size={28} color={activeTheme.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={styles.categoryGrid}>
                {POST_PROTOCOLS.map((cat) => (
                  <TouchableOpacity 
                    key={cat.id} 
                    style={[styles.catCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]} 
                    onPress={() => setIsMenuOpen(false)}
                  >
                    <View style={[styles.catIconBox, { backgroundColor: `${cat.color}20` }]}>
                      <Ionicons name={cat.icon as any} size={24} color={cat.color} />
                    </View>
                    <Text style={[styles.catLabel, { color: activeTheme.text }]}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
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
  pulseScroll: { gap: 18 },
  pulseItem: { alignItems: 'center', gap: 10 },
  pulseAvatarGradient: { width: 70, height: 70, borderRadius: 28, padding: 2.5 },
  pulseAvatarInner: { flex: 1, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  neuralNode: { width: 70, height: 70, borderRadius: 28, padding: 3 },
  nodeInner: { flex: 1, borderRadius: 25, borderWidth: 1.5, borderStyle: 'dashed' },
  pulseLabel: { fontSize: 12, fontWeight: '700' },
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
  menuContent: { position: 'absolute', bottom: 0, width: width, borderTopLeftRadius: 45, borderTopRightRadius: 45, padding: 30, paddingBottom: 60, borderTopWidth: 1 },
  menuDragHandle: { width: 40, height: 5, borderRadius: 2.5, alignSelf: 'center', marginBottom: 25 },
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  menuTitle: { fontSize: 24, fontWeight: '900' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  catCard: { width: (width - 80) / 2, padding: 20, borderRadius: 24, marginBottom: 20, alignItems: 'center', borderWidth: 1 },
  catIconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  catLabel: { fontSize: 13, fontWeight: '800' },
});
