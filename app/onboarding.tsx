import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { Theme } from '../constants/Theme';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AppLogo } from '../components/AppLogo';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  FadeInUp, 
  useAnimatedStyle, 
  interpolate,
  useSharedValue
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const SLIDES = [
  { 
    id: '1', 
    title: 'Neural\nInnovation', 
    desc: 'Deploy enterprise-grade projects with biometric precision and neural speed.', 
    icon: 'flash-outline',
    color: '#7367f0' 
  },
  { 
    id: '2', 
    title: 'Seamless\nLinkage', 
    desc: 'Sync your workspace across the global node network in real-time.', 
    icon: 'infinite-outline',
    color: '#ce9ffc' 
  },
  { 
    id: '3', 
    title: 'Elite\nProtocol', 
    desc: 'Your intellectual assets are shielded by proprietary 2026 neural encryption.', 
    icon: 'shield-half-outline',
    color: '#00E676' 
  },
];

export default function Onboarding() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<FlatList>(null);
  const brand = Theme.brand;

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
    } else {
      router.replace('/auth/login');
    }
  };

  const renderItem = ({ item }: { item: typeof SLIDES[0] }) => {
    return (
      <View style={styles.slide}>
        <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.iconContainer}>
          <BlurView intensity={20} tint="light" style={styles.iconGlass}>
            <LinearGradient
              colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.01)']}
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name={item.icon as any} size={16} color={item.color} />
          </BlurView>
          <View style={[styles.iconGlow, { backgroundColor: item.color }]} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(800)} style={styles.textContainer}>
          <Text style={styles.slideTitle}>{item.title}</Text>
          <Text style={styles.slideDesc}>{item.desc}</Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#020205', '#0A0A12']} style={StyleSheet.absoluteFill} />
      
      {/* Dynamic Background Orbs */}
      <View style={[styles.ambientBlob, { top: -50, right: -50, backgroundColor: brand.primary }]} />
      <View style={[styles.ambientBlob, { bottom: 50, left: -100, backgroundColor: brand.accent }]} />

      <View style={styles.topBar}>
        <AppLogo size={42} />
        <TouchableOpacity onPress={() => router.replace('/auth/login')}>
          <BlurView intensity={10} tint="dark" style={styles.skipBlur}>
            <Text style={styles.skipText}>BYPASS</Text>
          </BlurView>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          scrollX.value = e.nativeEvent.contentOffset.x;
        }}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.footerContainer}>
        {/* Pagination Dots */}
        <View style={styles.indicatorRow}>
          {SLIDES.map((_, i) => {
            const animatedDotStyle = useAnimatedStyle(() => {
              const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
              const dotWidth = interpolate(scrollX.value, inputRange, [8, 28, 8], 'clamp');
              const opacity = interpolate(scrollX.value, inputRange, [0.2, 1, 0.2], 'clamp');
              return { width: dotWidth, opacity };
            });

            return (
              <Animated.View 
                key={i} 
                style={[styles.dot, animatedDotStyle, activeIndex === i && { backgroundColor: brand.primary }]} 
              />
            );
          })}
        </View>

        <TouchableOpacity activeOpacity={0.9} onPress={handleNext} style={styles.ctaWrapper}>
          <LinearGradient
            colors={[brand.primary, '#ce9ffc']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btn}
          >
            <Text style={styles.btnText}>
              {activeIndex === SLIDES.length - 1 ? "INITIALIZE" : "CONTINUE"}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
        
        <Text style={styles.progressText}>LINK STATUS: {activeIndex + 1} / {SLIDES.length}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020205' },
  ambientBlob: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    opacity: 0.1,
    filter: Platform.OS === 'ios' ? 'blur(80px)' : undefined,
  },
  topBar: {
    position: 'absolute',
    top: 60,
    left: 25,
    right: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  skipBlur: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden'
  },
  skipText: {
    color: '#475569',
    fontWeight: '900',
    fontSize: 10,
    letterSpacing: 2,
  },
  slide: { width, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  
  iconContainer: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
  },
  iconGlass: {
    width: 130,
    height: 130,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    zIndex: 2,
  },
  iconGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.25,
    filter: Platform.OS === 'ios' ? 'blur(30px)' : undefined,
  },

  textContainer: { alignItems: 'center' },
  slideTitle: { 
    color: '#FFF', 
    fontSize: 44, 
    fontWeight: '900', 
    textAlign: 'center', 
    letterSpacing: -1.5,
    lineHeight: 48 
  },
  slideDesc: { 
    color: '#64748B', 
    fontSize: 16, 
    textAlign: 'center', 
    marginTop: 20, 
    lineHeight: 26,
    maxWidth: 280,
    fontWeight: '500'
  },

  footerContainer: {
    position: 'absolute',
    bottom: 60,
    width: '100%',
    alignItems: 'center',
  },
  indicatorRow: { 
    flexDirection: 'row', 
    marginBottom: 40, 
    alignItems: 'center',
    height: 10 
  },
  dot: { 
    height: 4, 
    borderRadius: 2, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    marginHorizontal: 4 
  },
  ctaWrapper: {
    width: width * 0.7,
    shadowColor: '#7367f0',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  btn: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20, 
    borderRadius: 24,
    gap: 10
  },
  btnText: { color: '#FFF', fontWeight: '900', fontSize: 14, letterSpacing: 2 },
  progressText: {
    color: '#334155',
    fontSize: 9,
    fontWeight: '900',
    marginTop: 30,
    letterSpacing: 2.5
  }
});
