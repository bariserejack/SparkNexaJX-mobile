// login.tsx handles both email/password and OAuth sign-in via Supabase.
// Make sure your Supabase project has Google/Apple/GitHub providers enabled
// and that any required client IDs are set in your environment or backend.
// To stub additional providers, add to the `oauthProviders` array below.

import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { Theme } from '../../constants/Theme';
import { supabase } from '../../lib/supabase';
import { AppLogo } from '../../components/AppLogo';

const palette = {
  page: '#F4F6FB',
  card: '#FFFFFF',
  border: '#E2E8F0',
  text: '#0F172A',
  textMuted: '#64748B',
  inputBg: '#F8FAFC',
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // extensible list of providers, color mapping for branding
  const oauthProviders: Array<{ key: 'google' | 'apple' | 'github'; label: string; icon: string; color: string }> = [
    { key: 'google', label: 'Google', icon: 'logo-google', color: '#DB4437' },
    { key: 'apple', label: 'Apple', icon: 'logo-apple', color: '#000' },
    { key: 'github', label: 'GitHub', icon: 'logo-github', color: '#24292E' },
  ];

  // handle OAuth providers
  async function handleOAuthLogin(provider: 'google' | 'apple' | 'github') {
    setLoading(true);
    setErrorMsg(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
      Alert.alert('Login failed', error.message);
    }
  }

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Login failed', error.message);
      return;
    }

    router.replace('/(tabs)');
  }

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#FFFFFF', '#F4F6FB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.brandWrap}>
            <AppLogo size={74} />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Login with your existing account.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={16} color={palette.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={16} color={palette.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="********"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={16} color={palette.textMuted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.cta} onPress={handleLogin} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.ctaText}>Login</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            {/* social / oauth section */}
            <Text style={styles.orText}>or</Text>
            <View style={styles.socialRow}>
              {oauthProviders.map((p) => (
                <TouchableOpacity
                  key={p.key}
                  style={[styles.socialBtn, { borderColor: p.color }]}
                  onPress={() => handleOAuthLogin(p.key)}
                  disabled={loading}
                >
                  <Ionicons name={p.icon as any} size={16} color={p.color} />
                  <Text style={styles.socialTxt}>Continue with {p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>New user?</Text>
              <TouchableOpacity onPress={() => router.replace('/auth/signup')}>
                <Text style={styles.switchLink}>Create account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: {
    flex: 1,
    backgroundColor: palette.page,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 28,
  },
  brandWrap: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: palette.text,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 6,
    color: palette.textMuted,
    fontSize: 14,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.card,
    padding: 18,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.textMuted,
    marginBottom: 8,
    marginTop: 8,
  },
  inputWrap: {
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.inputBg,
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    color: palette.text,
    fontSize: 15,
    fontWeight: '600',
  },
  cta: {
    marginTop: 20,
    height: 54,
    borderRadius: 14,
    backgroundColor: Theme.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  switchRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  errorText: {
    marginTop: 8,
    color: '#EF4444',
    textAlign: 'center',
    fontSize: 13,
  },
  switchText: {
    color: palette.textMuted,
    fontSize: 13,
  },
  switchLink: {
    color: Theme.brand.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  orText: {
    marginTop: 16,
    textAlign: 'center',
    color: palette.textMuted,
    fontSize: 13,
  },
  socialRow: {
    marginTop: 12,
    flexDirection: 'column',
    gap: 12,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.card,
    gap: 8,
  },
  socialTxt: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.text,
  },
});
