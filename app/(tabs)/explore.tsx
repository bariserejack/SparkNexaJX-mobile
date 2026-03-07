import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions,
    TextInput,
    Modal,
    Alert,
    Platform,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useState } from "react";
import Animated, { FadeInRight } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { Theme } from "../../constants/Theme";
import { useAppTheme } from "../../lib/theme";

const { width } = Dimensions.get('window');

const NEWS_CATEGORIES: Array<{
    key: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    accent: string;
}> = [
    { key: 'all', label: 'All', icon: 'apps-outline', accent: '#7367f0' },
    { key: 'ai', label: 'AI', icon: 'sparkles-outline', accent: '#00d2ff' },
    { key: 'tech', label: 'Tech', icon: 'hardware-chip-outline', accent: '#4facfe' },
    { key: 'design', label: 'Design', icon: 'color-palette-outline', accent: '#ce9ffc' },
    { key: 'dev', label: 'Dev', icon: 'code-slash-outline', accent: '#32cc70' },
    { key: 'security', label: 'Security', icon: 'shield-checkmark-outline', accent: '#fb7185' },
    { key: 'data', label: 'Data', icon: 'bar-chart-outline', accent: '#f59e0b' },
    { key: 'product', label: 'Product', icon: 'grid-outline', accent: '#22c55e' },
    { key: 'cloud', label: 'Cloud', icon: 'cloud-outline', accent: '#38bdf8' },
];

export default function ExploreScreen() {
    const { activeTheme, isDark } = useAppTheme();
    const navigation = useNavigation();
    
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [selectedBolt, setSelectedBolt] = useState<any>(null);

    const selectedCategory = NEWS_CATEGORIES.find((cat) => cat.key === activeFilter) ?? NEWS_CATEGORIES[0];

    const openDrawer = () => {
        const parent = (navigation as any).getParent?.();
        if (parent?.openDrawer) {
            parent.openDrawer();
            return;
        }
        if ((navigation as any).openDrawer) {
            (navigation as any).openDrawer();
        }
    };

    const handleUploadBolt = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert("Permission Required", "Allow access to photos to upload a Bolt!");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true,
            aspect: [9, 16],
            quality: 1,
        });
        if (!result.canceled) {
            Alert.alert("Success! 🎉", "Your Bolt is being processed.");
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
            {/* Premium Background Orbs - Adjusted for Light/Dark visibility */}
            <View style={[styles.bgOrb, { top: -50, right: -80, backgroundColor: Theme.brand.primary, opacity: isDark ? 0.15 : 0.1 }]} />
            <View style={[styles.bgOrb, { bottom: 200, left: -100, backgroundColor: Theme.brand.accent, opacity: isDark ? 0.1 : 0.05 }]} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.topBar}>
                    <TouchableOpacity style={styles.topAction} onPress={openDrawer}>
                        <Ionicons name="reorder-three-outline" size={16} color={activeTheme.text} />
                    </TouchableOpacity>
                    <View style={styles.topCenter}>
                        <Text style={styles.topLabel}>DISCOVERY NODE</Text>
                        <Text style={[styles.topTitle, { color: activeTheme.text }]}>Explore</Text>
                    </View>
                    <TouchableOpacity style={styles.topAction} onPress={() => router.push('/settings')}>
                        <Ionicons name="settings-outline" size={16} color={activeTheme.text} />
                    </TouchableOpacity>
                </View>

                {/* 1. Modern Header */}
                <View style={styles.header}>
                    <Text style={styles.preTitle}>NEURAL NETWORK</Text>
                    <Text style={[styles.headerTitle, { color: activeTheme.text }]}>Explore</Text>
                    
                    <BlurView 
                        intensity={isDark ? 30 : 60} 
                        tint={activeTheme.tint as any} 
                        style={[styles.searchGlass, { borderColor: activeTheme.border }]}
                    >
                        <Ionicons name="search" size={16} color={activeTheme.textMuted} />
                        <TextInput 
                            placeholder="Search the network..." 
                            placeholderTextColor={activeTheme.textMuted}
                            style={[styles.searchInput, { color: activeTheme.text }]}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </BlurView>
                </View>

                {/* 2. Trending Bolts */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: activeTheme.text }]}>Trending Bolts</Text>
                        <Text style={styles.viewAll}>Live Now</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.boltScroll}>
                        <BoltCard 
                            username="alex_dev" views="12.4k" 
                            gradient={Theme.brand.primaryGradient}
                            onPress={() => setSelectedBolt({ user: "alex_dev", color: Theme.brand.primary })} 
                        />
                        <BoltCard 
                            username="sarah.io" views="8.1k" 
                            gradient={['#ce9ffc', '#7367f0']}
                            onPress={() => setSelectedBolt({ user: "sarah.io", color: "#ce9ffc" })} 
                        />
                        <BoltCard 
                            username="nexa_hq" views="45k" 
                            gradient={['#4facfe', '#00f2fe']}
                            onPress={() => setSelectedBolt({ user: "nexa_hq", color: Theme.brand.accent })} 
                        />
                    </ScrollView>
                </View>

                {/* 3. News Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: activeTheme.text, paddingHorizontal: 25, marginBottom: 15 }]}>
                        Neural News
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterBar}>
                        {NEWS_CATEGORIES.map((cat, index) => {
                            const active = activeFilter === cat.key;
                            return (
                                <Animated.View key={cat.key} entering={FadeInRight.delay(index * 55).springify()}>
                                    <TouchableOpacity 
                                        onPress={() => setActiveFilter(cat.key)}
                                        style={[
                                            styles.filterChip, 
                                            { backgroundColor: active ? Theme.brand.primary : activeTheme.card },
                                            { borderColor: active ? Theme.brand.primary : activeTheme.border }
                                        ]}
                                    >
                                        <Ionicons
                                            name={cat.icon}
                                            size={16}
                                            color={active ? "#FFF" : cat.accent}
                                        />
                                        <Text style={[styles.filterText, { color: active ? "#FFF" : activeTheme.textMuted }]}>
                                            {cat.label}
                                        </Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            );
                        })}
                    </ScrollView>
                    
                    <NewsCard 
                        title={`${selectedCategory.label} Update`} 
                        snippet={`New protocols detected in ${selectedCategory.label} development for 2026.`} 
                        time="Just now" 
                        theme={activeTheme} 
                    />
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* --- PREMIUM FAB --- */}
            <TouchableOpacity style={styles.fab} onPress={handleUploadBolt} activeOpacity={0.9}>
                <LinearGradient 
                    colors={Theme.brand.primaryGradient as [string, string, ...string[]]} 
                    style={styles.fabGradient}
                >
                    <Ionicons name="add" size={16} color="#FFF" />
                </LinearGradient>
            </TouchableOpacity>

            {/* --- VIDEO PLAYER MODAL --- */}
            <Modal visible={!!selectedBolt} animationType="slide" transparent={false}>
                <View style={[styles.videoPlayerContainer, { backgroundColor: isDark ? '#000' : '#FFF' }]}>
                    <LinearGradient 
                        colors={isDark ? ['#0B0B1E', '#000'] : ['#F8F9FA', '#E9ECEF']} 
                        style={StyleSheet.absoluteFill} 
                    />
                    <TouchableOpacity style={styles.closeVideo} onPress={() => setSelectedBolt(null)}>
                        <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={styles.closeBlur}>
                            <Ionicons name="close" size={16} color={isDark ? "#FFF" : "#000"} />
                        </BlurView>
                    </TouchableOpacity>
                    <Text style={[styles.videoPlaceholderText, { color: isDark ? Theme.brand.primary : '#333' }]}>
                        ⚡ STREAMING FROM {selectedBolt?.user?.toUpperCase()}
                    </Text>
                </View>
            </Modal>
        </View>
    );
}

// --- Sub Components ---

function BoltCard({ username, views, gradient, onPress }: any) {
    return (
        <TouchableOpacity style={styles.boltCard} activeOpacity={0.9} onPress={onPress}>
            <View style={[StyleSheet.absoluteFill, { opacity: 0.2 }]}>
                <LinearGradient 
                    colors={gradient as [string, string, ...string[]]} 
                    style={StyleSheet.absoluteFill} 
                />
            </View>

            <LinearGradient 
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)'] as [string, string, ...string[]]} 
                style={styles.boltGradient}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                    <Ionicons name="play" size={16} color={Theme.brand.primary} />
                    <Text style={styles.boltViews}>{views}</Text>
                </View>
                <Text style={styles.boltUser}>@{username}</Text>
            </LinearGradient>
        </TouchableOpacity>
    );
}

function NewsCard({ title, snippet, time, theme }: any) {
    return (
        <TouchableOpacity style={[styles.glassNewsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.newsInfo}>
                <Text style={[styles.newsTitle, { color: theme.text }]}>{title}</Text>
                <Text style={[styles.newsSnippet, { color: theme.textMuted }]}>{snippet}</Text>
                <Text style={styles.newsTime}>{time}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    bgOrb: { position: 'absolute', width: 350, height: 350, borderRadius: 175 },
    scrollContent: { paddingTop: 16 },
    topBar: {
        paddingHorizontal: 20,
        paddingTop: 34,
        paddingBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
        fontWeight: '900',
        letterSpacing: 1.6,
        textTransform: 'uppercase',
    },
    topTitle: {
        marginTop: 1,
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: -0.3,
    },
    header: { paddingHorizontal: 25, marginBottom: 35 },
    preTitle: { color: Theme.brand.primary, fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 5 },
    headerTitle: { fontSize: 36, fontWeight: "900", letterSpacing: -1, marginBottom: 20 },
    searchGlass: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, height: 55, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
    searchInput: { flex: 1, marginLeft: 12, fontSize: 16, fontWeight: '500' },
    section: { marginBottom: 40 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginBottom: 18 },
    sectionTitle: { fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
    viewAll: { color: Theme.brand.primary, fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },
    filterBar: { paddingLeft: 25, marginBottom: 20, gap: 10 },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 16,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
    },
    filterText: { fontWeight: '800', fontSize: 13 },
    boltScroll: { paddingLeft: 25, gap: 15 },
    boltCard: { width: 140, height: 220, borderRadius: 32, backgroundColor: '#1A1A1E', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    boltGradient: { flex: 1, justifyContent: 'flex-end', padding: 15 },
    boltViews: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '800' },
    boltUser: { color: '#FFF', fontSize: 14, fontWeight: '800' },
    glassNewsCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 25, borderRadius: 28, padding: 20, borderWidth: 1, overflow: 'hidden' },
    newsInfo: { flex: 1 },
    newsTitle: { fontSize: 18, fontWeight: '900', marginBottom: 6 },
    newsSnippet: { fontSize: 14, marginBottom: 12, lineHeight: 20 },
    newsTime: { color: Theme.brand.primary, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
    fab: { position: 'absolute', bottom: 30, right: 25, width: 68, height: 68, borderRadius: 24, elevation: 10, shadowColor: Theme.brand.primary, shadowOpacity: 0.5, shadowRadius: 15 },
    fabGradient: { flex: 1, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
    videoPlayerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    closeVideo: { position: 'absolute', top: 50, right: 20, borderRadius: 20, overflow: 'hidden' },
    closeBlur: { padding: 10 },
    videoPlaceholderText: { fontSize: 12, fontWeight: '900', letterSpacing: 2 },
});
