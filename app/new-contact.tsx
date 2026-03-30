import React, { useEffect, useState } from 'react';
import { Alert, BackHandler, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { Theme } from '../constants/Theme';
import { useAppTheme } from '../lib/theme';

export default function NewContactScreen() {
  const { activeTheme } = useAppTheme();
  const params = useLocalSearchParams<{
    first?: string;
    last?: string;
    phone?: string;
    country?: string;
    iso?: string;
    dial?: string;
    sync?: string;
    returnTo?: string;
  }>();

  const [firstName, setFirstName] = useState(params.first ?? '');
  const [lastName, setLastName] = useState(params.last ?? '');
  const [phone, setPhone] = useState(params.phone ?? '');
  const [countryName, setCountryName] = useState(params.country ?? 'Nigeria');
  const [countryIso, setCountryIso] = useState(params.iso ?? 'NG');
  const [dialCode, setDialCode] = useState(params.dial ?? '+234');
  const [syncToPhone, setSyncToPhone] = useState(params.sync === '1');

  useEffect(() => {
    if (typeof params.first === 'string') setFirstName(params.first);
    if (typeof params.last === 'string') setLastName(params.last);
    if (typeof params.phone === 'string') setPhone(params.phone);
    if (typeof params.country === 'string') setCountryName(params.country);
    if (typeof params.iso === 'string') setCountryIso(params.iso);
    if (typeof params.dial === 'string') setDialCode(params.dial);
    if (typeof params.sync === 'string') setSyncToPhone(params.sync === '1');
  }, [params.first, params.last, params.phone, params.country, params.iso, params.dial, params.sync]);

  const goBackToOrigin = () => {
    const returnTo = typeof params.returnTo === 'string' ? params.returnTo : '';
    if (returnTo === 'new-chat') {
      router.replace({ pathname: '/pulse', params: { modal: 'new-chat' } });
      return;
    }
    if (!returnTo || returnTo === 'pulse') {
      router.replace('/pulse');
      return;
    }
    if (returnTo.startsWith('/')) {
      router.replace(returnTo);
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/pulse');
  };

  const handleBack = () => {
    goBackToOrigin();
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      goBackToOrigin();
      return true;
    });
    return () => sub.remove();
  }, [params.returnTo]);

  const openCountryPicker = () => {
    router.push({
      pathname: '/country-picker',
      params: {
        first: firstName,
        last: lastName,
        phone,
        country: countryName,
        iso: countryIso,
        dial: dialCode,
        sync: syncToPhone ? '1' : '0',
        returnTo: typeof params.returnTo === 'string' ? params.returnTo : '/pulse',
      },
    });
  };

  const handleSave = () => {
    const fullName = `${firstName} ${lastName}`.trim() || 'New contact';
    goBackToOrigin();
    setTimeout(() => {
      Alert.alert('Saved', `${fullName} saved.`);
    }, 50);
  };

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: activeTheme.border }]}>
          <TouchableOpacity onPress={handleBack} style={[styles.headerIcon, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}> 
            <Ionicons name="chevron-back" size={16} color={activeTheme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: activeTheme.text }]}>New contact</Text>
          <TouchableOpacity style={[styles.headerIcon, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}> 
            <Ionicons name="qr-code-outline" size={16} color={activeTheme.text} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.formBlock}>
          <View style={styles.fieldRow}>
            <View style={[styles.fieldIcon, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}> 
              <Ionicons name="person-outline" size={16} color={activeTheme.textMuted} />
            </View>
            <TextInput
              style={[styles.input, { backgroundColor: activeTheme.card, borderColor: activeTheme.border, color: activeTheme.text }]}
              placeholder="First name"
              placeholderTextColor={activeTheme.textMuted}
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          <View style={styles.fieldRow}>
            <View style={[styles.fieldIcon, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}> 
              <Ionicons name="person-outline" size={16} color={activeTheme.textMuted} />
            </View>
            <TextInput
              style={[styles.input, { backgroundColor: activeTheme.card, borderColor: activeTheme.border, color: activeTheme.text }]}
              placeholder="Last name"
              placeholderTextColor={activeTheme.textMuted}
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          <View style={styles.fieldRow}>
            <View style={[styles.fieldIcon, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}> 
              <Ionicons name="call-outline" size={16} color={activeTheme.textMuted} />
            </View>
            <TouchableOpacity
              style={[styles.countryPicker, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}
              onPress={openCountryPicker}
            >
              <Text style={[styles.countryCodeText, { color: activeTheme.text }]}>{countryIso} {dialCode}</Text>
              <Ionicons name="chevron-down" size={16} color={activeTheme.textMuted} />
            </TouchableOpacity>
            <TextInput
              style={[styles.phoneInput, { backgroundColor: activeTheme.card, borderColor: activeTheme.border, color: activeTheme.text }]}
              placeholder="Phone"
              placeholderTextColor={activeTheme.textMuted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <View style={[styles.toggleRow, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}> 
            <View style={styles.toggleLeft}>
              <View style={[styles.toggleIcon, { backgroundColor: activeTheme.background, borderColor: activeTheme.border }]}> 
                <Ionicons name="sync-outline" size={16} color={activeTheme.textMuted} />
              </View>
              <Text style={[styles.toggleLabel, { color: activeTheme.text }]}>Sync contact to phone</Text>
            </View>
            <Switch
              value={syncToPhone}
              onValueChange={setSyncToPhone}
              trackColor={{ false: activeTheme.border, true: Theme.brand.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <TouchableOpacity style={[styles.saveButton, { backgroundColor: Theme.brand.primary }]} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.4 },
  headerIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40, gap: 24 },
  formBlock: { gap: 16 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  fieldIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  input: { flex: 1, height: 54, borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, fontSize: 15, fontWeight: '600' },
  countryPicker: { height: 54, borderRadius: 16, borderWidth: 1, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  countryCodeText: { fontSize: 14, fontWeight: '700' },
  phoneInput: { flex: 1, height: 54, borderRadius: 16, borderWidth: 1, paddingHorizontal: 12, fontSize: 15, fontWeight: '600' },
  toggleRow: { marginTop: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 14 },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  toggleIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  toggleLabel: { fontSize: 15, fontWeight: '600' },
  saveButton: { height: 52, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.4 },
});
