import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { supabase } from '../../lib/supabase';

const palette = {
  page: '#F4F6FB',
  text: '#0F172A',
  textMuted: '#64748B',
};

type CallbackParams = {
  code?: string | string[];
  error?: string | string[];
  error_description?: string | string[];
};

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default function AuthCallbackScreen() {
  const params = useLocalSearchParams<CallbackParams>();
  const code = firstParam(params.code);
  const errorParam = firstParam(params.error);
  const errorDescription = firstParam(params.error_description);
  const hasRunRef = useRef(false);
  const [message, setMessage] = useState('Signing you in...');
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!code && !errorParam) return;
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    async function run() {
      if (errorParam) {
        setMessage(errorDescription || 'Login cancelled.');
        setBusy(false);
        return;
      }
      if (!code) {
        setMessage('Missing login code.');
        setBusy(false);
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        setMessage(error.message);
        setBusy(false);
        return;
      }

      router.replace('/(tabs)');
    }

    run();
  }, [code, errorParam, errorDescription]);

  return (
    <View style={styles.screen}>
      {busy ? <ActivityIndicator size="large" color={palette.text} /> : null}
      <Text style={styles.message}>{message}</Text>
      {busy ? <Text style={styles.subMessage}>This should only take a moment.</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.page,
    paddingHorizontal: 24,
  },
  message: {
    marginTop: 16,
    color: palette.text,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  subMessage: {
    marginTop: 8,
    color: palette.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
});
