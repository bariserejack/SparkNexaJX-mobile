import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Theme } from '../constants/Theme';
import { useAppTheme } from '../lib/theme';

const { width } = Dimensions.get('window');

type ThemePreset = {
  id: string;
  bg?: [string, string];
  bubble: string;
  accent: string;
  image?: any;
};

const THEME_PRESETS: ThemePreset[] = [
  { id: 'bloom', image: require('../assets/images/chat-themes/bloom.png'), bubble: '#B15CFF', accent: '#FFFFFF' },
  { id: 'nature', image: require('../assets/images/chat-themes/nature.png'), bubble: '#2FD97A', accent: '#FFFFFF' },
  { id: 'soft-light', image: require('../assets/images/chat-themes/soft-light.png'), bubble: '#7C6AF6', accent: '#FFFFFF' },
  { id: 'midnight', bg: ['#1f2937', '#0b1220'], bubble: '#B7F7C7', accent: '#FFFFFF' },
  { id: 'linen', bg: ['#f4efe9', '#f0e6dc'], bubble: '#B7F7C7', accent: '#FFFFFF' },
  { id: 'paper', bg: ['#f6efe7', '#f0e8de'], bubble: '#2FD97A', accent: '#FFFFFF' },
  { id: 'lilac', bg: ['#f5d9ff', '#f1e7ff'], bubble: '#7C6AF6', accent: '#FFFFFF' },
  { id: 'cloud', bg: ['#d9f0ff', '#f2f7ff'], bubble: '#7C6AF6', accent: '#FFFFFF' },
];

export default function ChatThemeScreen() {
  const { activeTheme } = useAppTheme();
  const { returnTo, dmName, dmColor } = useLocalSearchParams<{ returnTo?: string; dmName?: string; dmColor?: string }>();
  const [selectedTheme, setSelectedTheme] = useState<string>(THEME_PRESETS[0].id);

  const handleBack = () => {
    const name = Array.isArray(dmName) ? dmName[0] : dmName;
    const color = Array.isArray(dmColor) ? dmColor[0] : dmColor;
    if (returnTo === 'dm' && name) {
      router.replace({ pathname: '/pulse', params: { dmName: name, dmColor: color || Theme.brand.primary } });
      return;
    }
    router.back();
  };

  const columns = useMemo(() => (width > 360 ? 4 : 3), []);
  const cardSize = useMemo(() => Math.floor((width - 44 - (columns - 1) * 12) / columns), [columns]);

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: activeTheme.border, backgroundColor: activeTheme.background }]}>
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
            <Ionicons name="chevron-back" size={16} color={activeTheme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: activeTheme.text }]}>Chat theme</Text>
          <TouchableOpacity style={[styles.moreBtn, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
            <Ionicons name="ellipsis-vertical" size={16} color={activeTheme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Text style={[styles.sectionLabel, { color: activeTheme.textMuted }]}>Themes</Text>
          <View style={styles.grid}>
            {THEME_PRESETS.map((item) => {
              const selected = selectedTheme === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.9}
                  style={[styles.themeCard, { width: cardSize, height: cardSize * 1.25, borderColor: selected ? '#111827' : activeTheme.border }]}
                  onPress={() => setSelectedTheme(item.id)}
                >
                  {item.image ? (
                    <Image source={item.image} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                  ) : (
                    <LinearGradient colors={item.bg || ['#ffffff', '#f1f5f9']} style={StyleSheet.absoluteFillObject} />
                  )}
                  <View style={[styles.bubbleTop, { backgroundColor: item.accent }]} />
                  <View style={[styles.bubbleBottom, { backgroundColor: item.bubble }]} />
                  {selected ? (
                    <View style={styles.selectedBadge}>
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.noteText, { color: activeTheme.textMuted }]}>
            The chat color and wallpaper will both change.
          </Text>

          <Text style={[styles.sectionLabel, { color: activeTheme.textMuted, marginTop: 20 }]}>Customize</Text>
          <TouchableOpacity
            style={[styles.optionRow, { borderBottomColor: activeTheme.border }]}
            onPress={() =>
              router.push({
                pathname: '/chat-color',
                params: { returnTo: 'chat-theme', dmName, dmColor },
              })
            }
          >
            <View style={[styles.optionIcon, { backgroundColor: activeTheme.card }]}>
              <Ionicons name="color-palette-outline" size={16} color={activeTheme.text} />
            </View>
            <Text style={[styles.optionLabel, { color: activeTheme.text }]}>Chat color</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() =>
              router.push({
                pathname: '/chat-wallpaper',
                params: { returnTo: 'chat-theme', dmName, dmColor },
              })
            }
          >
            <View style={[styles.optionIcon, { backgroundColor: activeTheme.card }]}>
              <Ionicons name="image-outline" size={16} color={activeTheme.text} />
            </View>
            <Text style={[styles.optionLabel, { color: activeTheme.text }]}>Wallpaper</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '800', letterSpacing: -0.2 },
  moreBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  content: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 40 },
  sectionLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  themeCard: {
    borderRadius: 18,
    borderWidth: 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubbleTop: { position: 'absolute', width: '60%', height: 18, borderRadius: 9, top: 12, left: 10 },
  bubbleBottom: { position: 'absolute', width: '58%', height: 20, borderRadius: 10, bottom: 16, right: 12 },
  selectedBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteText: { marginTop: 16, fontSize: 12, fontWeight: '500' },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  optionIcon: { width: 34, height: 34, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  optionLabel: { fontSize: 15, fontWeight: '600' },
});
