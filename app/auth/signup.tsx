// signup.tsx performs a multi-step account creation flow.
// It optionally captures a phone number and, if provided, goes into an
// OTP verification step afterward. Sending and verifying the code requires
// a backend or third-party service (e.g. Twilio) configured via environment
// variables shown in .env.example.

import React, { useMemo, useState } from 'react';
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

type Step = 1 | 2 | 3 | 4; // added step 4 for phone OTP verification

export default function SignUpScreen() {
  const [step, setStep] = useState<Step>(1);
  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev > 1 ? ((prev - 1) as Step) : prev));
      return;
    }
    router.back();
  };
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');

  const passwordStrength = useMemo(() => {
    if (password.length === 0) return { label: 'Empty', percent: 0, color: '#CBD5E1' };
    if (password.length < 6) return { label: 'Weak', percent: 0.33, color: '#EF4444' };
    if (password.length < 10) return { label: 'Good', percent: 0.66, color: '#F59E0B' };
    return { label: 'Strong', percent: 1, color: '#22C55E' };
  }, [password.length]);

  function goNext() {
    if (step === 1 && !fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (step === 1) {
      const dob = dateOfBirth.trim();
      if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(dob)) {
        setErrorMsg('Please enter your date of birth in YYYY-MM-DD format.');
        return;
      }
      if (!gender.trim()) {
        setErrorMsg('Please enter your gender (e.g. Male, Female, Other).');
        return;
      }
    }

    if (step === 2) {
      const normalized = email.trim();
      if (!normalized.includes('@') || !normalized.includes('.')) {
        setErrorMsg('Please enter a valid email address.');
        return;
      }
      if (phone && !/^\+?\d{7,15}$/.test(phone)) {
        setErrorMsg('Please enter a valid phone number.');
        return;
      }
    }

    setErrorMsg(null);
    if (step < 3) {
      setStep((step + 1) as Step);
    }
  }

  async function sendVerificationCode() {
    // this function should call your backend / third-party service (Twilio etc.)
    if (!phone) return;
    try {
      // await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/send-otp`, {
      //   method: 'POST',
      //   body: JSON.stringify({ phone }),
      // });
    } catch (e) {
      console.warn('sendVerificationCode failed', e);
    }
  }

  async function verifyCode() {
    setVerifying(true);
    setErrorMsg(null);
    try {
      // call backend to verify code
      // const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/verify-otp`, {
      //   method: 'POST',
      //   body: JSON.stringify({ phone, code: verificationCode }),
      // });
      // if (res.ok) {
        router.replace('/auth/login');
      // } else {
      //   throw new Error('bad code');
      // }
    } catch (e) {
      setErrorMsg('Verification failed');
    } finally {
      setVerifying(false);
    }
  }

  async function handleCreateAccount() {
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          date_of_birth: dateOfBirth.trim(),
          gender: gender.trim(),
          ...(phone ? { phone } : {}),
        },
      },
    });
    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    // if phone provided, go to verification step
    if (phone) {
      setStep(4);
      sendVerificationCode();
      return;
    }

    Alert.alert('Account created', 'You can now login with your email and password.');
    router.replace('/auth/login');
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
          <View style={styles.header}>
            <View style={styles.topRow}>
              <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                <Ionicons name="chevron-back" size={16} color={palette.text} />
              </TouchableOpacity>
              <Text style={styles.stepLabel}>
                Step {step} of {phone ? 4 : 3}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(step / (phone ? 4 : 3)) * 100}%` },
                ]}
              />
            </View>
          </View>

            <View style={styles.card}>
              <View style={styles.logoRow}>
                <AppLogo size={64} />
                <Text style={styles.appName}>SparkNexaJX</Text>
              </View>
            <Text style={styles.title}>Create Account</Text>
            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            {step === 1 && (
              <>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="person-outline" size={16} color={palette.textMuted} />
                  <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="John Doe"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
                <Text style={styles.label}>Date of Birth</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="calendar-outline" size={16} color={palette.textMuted} />
                  <TextInput
                    style={styles.input}
                    value={dateOfBirth}
                    onChangeText={setDateOfBirth}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
                <Text style={styles.label}>Gender</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="transgender-outline" size={16} color={palette.textMuted} />
                  <TextInput
                    style={styles.input}
                    value={gender}
                    onChangeText={setGender}
                    placeholder="Male / Female / Other"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
                <TouchableOpacity style={styles.cta} onPress={goNext}>
                  <Text style={styles.ctaText}>Continue</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </>
            )}

            {step === 2 && (
              <>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="mail-outline" size={16} color={palette.textMuted} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="you@example.com"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
                <Text style={styles.label}>Phone (optional)</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="call-outline" size={16} color={palette.textMuted} />
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholder="+1234567890"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
                <TouchableOpacity style={styles.cta} onPress={goNext}>
                  <Text style={styles.ctaText}>Continue</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </>
            )}

            {step === 3 && (
              <>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={16} color={palette.textMuted} />
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholder="********"
                    placeholderTextColor="#94A3B8"
                  />
                  <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={16} color={palette.textMuted} />
                  </TouchableOpacity>
                </View>

                <View style={styles.strengthRow}>
                  <View style={styles.strengthTrack}>
                    <View
                      style={[
                        styles.strengthFill,
                        { width: `${passwordStrength.percent * 100}%`, backgroundColor: passwordStrength.color },
                      ]}
                    />
                  </View>
                  <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>{passwordStrength.label}</Text>
                </View>

                <TouchableOpacity style={styles.cta} onPress={handleCreateAccount} disabled={loading}>
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.ctaText}>Create Account</Text>
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            {(step !== 4) && (
              <View style={styles.switchRow}>
                <Text style={styles.switchText}>Already signed up?</Text>
                <TouchableOpacity onPress={() => router.replace('/auth/login')}>
                  <Text style={styles.switchLink}>Login</Text>
                </TouchableOpacity>
              </View>
            )}
            {step === 4 && (
              <>
                <Text style={styles.label}>Verification code</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="key-outline" size={16} color={palette.textMuted} />
                  <TextInput
                    style={styles.input}
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    keyboardType="number-pad"
                    placeholder="123456"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
                <TouchableOpacity
                  style={styles.cta}
                  onPress={verifyCode}
                  disabled={verifying}
                >
                  {verifying ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.ctaText}>Verify</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={sendVerificationCode} style={styles.resendLink}>
                  <Text style={styles.resendText}>Resend code</Text>
                </TouchableOpacity>
              </>
            )}
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
  header: {
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: Theme.brand.primary,
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
  logoRow: {
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appName: {
    color: palette.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  title: {
    color: palette.text,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.textMuted,
    marginBottom: 8,
    marginTop: 14,
  },
  errorText: {
    marginTop: 8,
    color: '#EF4444',
    textAlign: 'center',
    fontSize: 13,
  },
  resendLink: {
    marginTop: 10,
    alignSelf: 'center',
  },
  resendText: {
    color: Theme.brand.primary,
    fontSize: 13,
    textDecorationLine: 'underline',
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
  strengthRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  strengthTrack: {
    flex: 1,
    height: 6,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 6,
  },
  strengthLabel: {
    width: 48,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
  },
  switchRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
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
});
