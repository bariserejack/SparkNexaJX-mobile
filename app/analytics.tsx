import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Dimensions, 
  ActivityIndicator, TouchableOpacity, Image, Platform
} from 'react-native';
import { LineChart } from "react-native-chart-kit";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { supabase } from '../lib/supabase';
import { Theme } from '../constants/Theme';
import { useAppTheme } from '../lib/theme';

const screenWidth = Dimensions.get("window").width;

const LEADERBOARD = [
  { id: '1', name: 'Alex Rivera', score: 2450, avatar: 'https://i.pravatar.cc/150?u=1', trend: 'up' },
  { id: '2', name: 'Sarah Chen', score: 2120, avatar: 'https://i.pravatar.cc/150?u=2', trend: 'up' },
  { id: '3', name: 'Jordan Miles', score: 1890, avatar: 'https://i.pravatar.cc/150?u=3', trend: 'down' },
];

export default function AnalyticsScreen() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 });

  const { activeTheme, isDark } = useAppTheme();
  const primaryColor = Theme.brand?.primary || '#7367f0';

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      const { data } = await supabase.from('projects').select('status');
      if (data) {
        setStats({ 
          total: data.length, 
          active: data.filter(p => p.status === 'active').length, 
          completed: data.filter(p => p.status === 'completed').length 
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const chartConfig = {
    backgroundGradientFrom: activeTheme.background,
    backgroundGradientTo: activeTheme.background,
    color: (opacity = 1) => `rgba(115, 103, 240, ${opacity})`,
    labelColor: (opacity = 1) => isDark ? `rgba(148, 163, 184, ${opacity})` : `rgba(71, 85, 105, ${opacity})`,
    strokeWidth: 3,
    propsForDots: { r: "4", strokeWidth: "2", stroke: primaryColor },
    propsForBackgroundLines: { stroke: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)', strokeDasharray: '' }
  };

  if (loading) return (
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: activeTheme.background }]}>
      <ActivityIndicator size="large" color={primaryColor} />
    </View>
  );

  return (
    <View style={[styles.mainWrapper, { backgroundColor: activeTheme.background }]}>
      <LinearGradient colors={isDark ? ['#06061E', '#020205'] : ['#FFFFFF', '#F1F5F9']} style={styles.container}>
        
        {/* Decorative Background Element */}
        <View style={styles.bgGlow} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerSubtitle}>NEURAL INSIGHTS</Text>
              <Text style={[styles.headerTitle, { color: activeTheme.text }]}>Analytics</Text>
            </View>
            <TouchableOpacity
              style={[styles.iconCircle, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Ionicons name="scan-outline" size={16} color={primaryColor} />
            </TouchableOpacity>
          </View>

          {/* Hero Performance Card */}
          <TouchableOpacity activeOpacity={0.9} onPress={() => Haptics.selectionAsync()}>
            <LinearGradient 
              colors={[primaryColor, '#4facfe']} 
              start={{x: 0, y: 0}} end={{x: 1, y: 1}}
              style={styles.heroCard}
            >
              <View style={styles.heroInfo}>
                <Text style={styles.heroLabel}>Total Bandwidth</Text>
                <Text style={styles.heroNumber}>{stats.total * 12}GB</Text>
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>⚡ Optimized</Text>
                </View>
              </View>
              <Ionicons name="pulse" size={16} color="rgba(255,255,255,0.15)" style={styles.heroIcon} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Metrics Row */}
          <View style={styles.metricsRow}>
            <MetricCard label="Live Nodes" value={stats.active} color={primaryColor} icon="radio-outline" />
            <MetricCard label="Synced" value={stats.completed} color="#4ADE80" icon="cloud-done-outline" />
          </View>

          {/* Productivity Chart */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: activeTheme.text }]}>Activity Protocol</Text>
            <TouchableOpacity><Text style={styles.seeMore}>Real-time</Text></TouchableOpacity>
          </View>
          <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={[styles.glassChartCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
            <LineChart
              data={{
                labels: ["04:00", "08:00", "12:00", "16:00", "20:00"],
                datasets: [{ data: [20, 45, 28, 80, 99] }]
              }}
              width={screenWidth - 50}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={true}
              withVerticalLines={false}
            />
          </BlurView>

          {/* Contributors / Leaderboard */}
          <Text style={[styles.sectionTitle, { color: activeTheme.text }]}>Top Contributors</Text>
          <View style={[styles.leaderboardCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
            {LEADERBOARD.map((user, index) => (
              <View key={user.id} style={[styles.leaderRow, { borderBottomColor: activeTheme.border }, index === LEADERBOARD.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={[styles.rankText, { color: activeTheme.textMuted }]}>0{index + 1}</Text>
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.leaderName, { color: activeTheme.text }]}>{user.name}</Text>
                  <Text style={[styles.leaderSubText, { color: activeTheme.textMuted }]}>Node Developer</Text>
                </View>
                <View style={styles.scoreContainer}>
                  <Text style={[styles.leaderScore, { color: primaryColor }]}>{user.score}</Text>
                  <Ionicons 
                    name={user.trend === 'up' ? "caret-up" : "caret-down"} 
                    size={16} 
                    color={user.trend === 'up' ? "#4ADE80" : "#FF3B30"} 
                  />
                </View>
              </View>
            ))}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

function MetricCard({ label, value, color, icon }: any) {
  return (
    <View style={styles.miniCard}>
      <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <View>
        <Text style={styles.miniLabel}>{label}</Text>
        <Text style={[styles.miniValue, { color }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1 },
  container: { flex: 1 },
  bgGlow: { position: 'absolute', bottom: -100, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: '#7367f0', opacity: 0.1, filter: Platform.OS === 'ios' ? 'blur(60px)' : undefined },
  scrollContent: { padding: 25, paddingTop: 60 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 30 },
  headerSubtitle: { color: '#7367f0', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 4 },
  headerTitle: { fontSize: 34, fontWeight: '900', letterSpacing: -1 },
  iconCircle: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  
  heroCard: { padding: 25, borderRadius: 32, marginBottom: 25, position: 'relative', overflow: 'hidden' },
  heroInfo: { zIndex: 1 },
  heroLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  heroNumber: { fontSize: 44, fontWeight: '900', color: '#FFF', marginVertical: 8 },
  heroBadge: { backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  heroBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
  heroIcon: { position: 'absolute', right: -10, bottom: -20 },

  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  miniCard: { backgroundColor: 'rgba(255,255,255,0.03)', width: '48%', padding: 18, borderRadius: 24, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  miniLabel: { color: '#64748B', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  miniValue: { fontSize: 22, fontWeight: '900' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5, marginBottom: 15 },
  seeMore: { color: '#7367f0', fontWeight: '700', fontSize: 12 },

  glassChartCard: { borderRadius: 30, overflow: 'hidden', padding: 10, borderWidth: 1, marginBottom: 30 },
  chart: { borderRadius: 16, marginTop: 10, marginLeft: -10 },

  leaderboardCard: { borderRadius: 28, padding: 10, borderWidth: 1 },
  leaderRow: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1 },
  rankText: { fontWeight: '900', width: 35, fontSize: 12 },
  avatar: { width: 44, height: 44, borderRadius: 15, marginRight: 15 },
  leaderName: { fontWeight: '800', fontSize: 16 },
  leaderSubText: { fontSize: 11, fontWeight: '600' },
  scoreContainer: { alignItems: 'flex-end' },
  leaderScore: { fontWeight: '900', fontSize: 16, marginBottom: 2 }
});
