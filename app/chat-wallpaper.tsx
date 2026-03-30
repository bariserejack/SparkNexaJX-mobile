import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Theme } from '../constants/Theme';
import { useAppTheme } from '../lib/theme';

const { width } = Dimensions.get('window');

type WallpaperItem = { id: string; image?: any; colors?: [string, string] };

const WALLPAPERS: WallpaperItem[] = [
  { id: 'bloom', image: require('../assets/images/chat-themes/bloom.png') },
  { id: 'nature', image: require('../assets/images/chat-themes/nature.png') },
  { id: 'soft-light', image: require('../assets/images/chat-themes/soft-light.png') },
  { id: 'rose', colors: ['#f6c0e2', '#f2a7d4'] },
  { id: 'lavender', colors: ['#e7d3ff', '#c8b5ff'] },
  { id: 'pink', colors: ['#ffc6e3', '#ffb6d0'] },
  { id: 'peach', colors: ['#ffd6c2', '#ffc0a8'] },
  { id: 'violet', colors: ['#f0d4ff', '#e3c5ff'] },
  { id: 'iris', colors: ['#b8b0ff', '#9b8cff'] },
  { id: 'sun', colors: ['#ffb983', '#f08d5d'] },
  { id: 'blush', colors: ['#f7c3d7', '#e89db8'] },
  { id: 'mint', colors: ['#6ad07d', '#3bbf7a'] },
  { id: 'sky', colors: ['#6ab8ff', '#3f8dfb'] },
  { id: 'ice', colors: ['#c1f1ff', '#a0dbff'] },
  { id: 'sage', colors: ['#d5f2c7', '#b7d9a2'] },
];

export default function ChatWallpaperScreen() {
  const { activeTheme } = useAppTheme();
  const { returnTo, dmName, dmColor } = useLocalSearchParams<{ returnTo?: string; dmName?: string; dmColor?: string }>();

  const handleBack = () => {
    const name = Array.isArray(dmName) ? dmName[0] : dmName;
    const color = Array.isArray(dmColor) ? dmColor[0] : dmColor;
    if (returnTo === 'chat-theme') {
      router.replace({ pathname: '/chat-theme', params: { returnTo: 'dm', dmName: name, dmColor: color || Theme.brand.primary } });
      return;
    }
    router.back();
  };

  const cardWidth = Math.floor((width - 44 - 2 * 12) / 3);
  const cardHeight = Math.floor(cardWidth * 1.3);

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: activeTheme.border, backgroundColor: activeTheme.background }]}>
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
            <Ionicons name="chevron-back" size={16} color={activeTheme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: activeTheme.text }]}>Wallpaper</Text>
          <TouchableOpacity style={[styles.moreBtn, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
            <Ionicons name="ellipsis-vertical" size={16} color={activeTheme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <TouchableOpacity style={[styles.optionRow, { borderBottomColor: activeTheme.border }]}>
            <View style={[styles.optionIcon, { backgroundColor: activeTheme.card }]}>
              <Ionicons name="image-outline" size={16} color={activeTheme.text} />
            </View>
            <Text style={[styles.optionLabel, { color: activeTheme.text }]}>Choose from gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionRow}>
            <View style={[styles.optionIcon, { backgroundColor: activeTheme.card }]}>
              <Ionicons name="color-palette-outline" size={16} color={activeTheme.text} />
            </View>
            <Text style={[styles.optionLabel, { color: activeTheme.text }]}>Set a color</Text>
          </TouchableOpacity>

          <View style={styles.grid}>
            {WALLPAPERS.map((item, idx) => (
              <View key={`${item.id}-${idx}`} style={[styles.wallCard, { width: cardWidth, height: cardHeight }]}>
                {item.image ? (
                  <Image source={item.image} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                ) : (
                  <LinearGradient colors={item.colors || ['#fff', '#f1f5f9']} style={StyleSheet.absoluteFillObject} />
                )}
              </View>
            ))}
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
  content: { paddingHorizontal: 22, paddingTop: 10, paddingBottom: 40 },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1 },
  optionIcon: { width: 34, height: 34, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  optionLabel: { fontSize: 15, fontWeight: '600' },
  grid: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  wallCard: { borderRadius: 18, overflow: 'hidden' },
});
