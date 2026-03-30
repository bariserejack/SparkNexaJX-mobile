import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Theme } from '../constants/Theme';
import { useAppTheme } from '../lib/theme';

const { width } = Dimensions.get('window');

const COLOR_SWATCHES = [
  '#1CA85A', '#CFF6D8', '#5B49D9', '#E7E2FF',
  '#B14CE3', '#F0D7FA', '#E46C52', '#F9DCCF',
  '#0A8674', '#CDEFF0', '#2D6CDF', '#CFE5FA',
  '#0B4E7B', '#CFE3EF', '#3C4F34', '#DBE6D8',
  '#7C1D2C', '#F8CAD6', '#2F2F32', '#DADCDD',
];

export default function ChatColorScreen() {
  const { activeTheme } = useAppTheme();
  const { returnTo, dmName, dmColor } = useLocalSearchParams<{ returnTo?: string; dmName?: string; dmColor?: string }>();
  const [selectedColor, setSelectedColor] = useState<string>(COLOR_SWATCHES[1]);

  const handleBack = () => {
    const name = Array.isArray(dmName) ? dmName[0] : dmName;
    const color = Array.isArray(dmColor) ? dmColor[0] : dmColor;
    if (returnTo === 'chat-theme') {
      router.replace({ pathname: '/chat-theme', params: { returnTo: 'dm', dmName: name, dmColor: color || Theme.brand.primary } });
      return;
    }
    router.back();
  };

  const size = Math.floor((width - 44 - 3 * 16) / 4);

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: activeTheme.border, backgroundColor: activeTheme.background }]}>
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
            <Ionicons name="chevron-back" size={16} color={activeTheme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: activeTheme.text }]}>Chat color</Text>
          <TouchableOpacity style={[styles.moreBtn, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
            <Ionicons name="ellipsis-vertical" size={16} color={activeTheme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.grid}>
            {COLOR_SWATCHES.map((color) => {
              const selected = selectedColor === color;
              return (
                <TouchableOpacity
                  key={color}
                  style={[styles.swatch, { width: size, height: size, backgroundColor: color }]}
                  activeOpacity={0.85}
                  onPress={() => setSelectedColor(color)}
                >
                  {selected ? (
                    <View style={styles.checkWrap}>
                      <Ionicons name="checkmark" size={16} color="#111827" />
                    </View>
                  ) : null}
                </TouchableOpacity>
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
  content: { paddingHorizontal: 22, paddingTop: 20, paddingBottom: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  swatch: { borderRadius: 999, justifyContent: 'center', alignItems: 'center' },
  checkWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D9F7DF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#111827',
  },
});
