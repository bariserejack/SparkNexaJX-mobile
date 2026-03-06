import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { Theme } from '../../constants/Theme';
import { supabase } from '../../lib/supabase';

export default function LogoutScreen() {
  useEffect(() => {
    let mounted = true;

    async function signOut() {
      try {
        await supabase.auth.signOut();
      } finally {
        if (mounted) {
          setTimeout(() => {
            router.replace('/auth/login');
          }, 700);
        }
      }
    }

    signOut();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#FFFFFF', '#F4F6FB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.card}>
        <ActivityIndicator size="large" color={Theme.brand.primary} />
        <Text style={styles.title}>Logging Out</Text>
        <Text style={styles.subtitle}>Your session is being cleared.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F6FB',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    paddingVertical: 32,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  title: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: '#64748B',
  },
});
