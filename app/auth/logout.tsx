import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
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
      <ActivityIndicator size="large" color={Theme.brand.primary} />
      <Text style={styles.title}>Logging Out</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.light.background,
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
});
