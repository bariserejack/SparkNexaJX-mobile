import React, { useEffect, useMemo, useState } from 'react';
import { BackHandler, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { Theme } from '../constants/Theme';
import { useAppTheme } from '../lib/theme';

type Country = {
  name: string;
  iso: string;
  dial: string;
};

const COUNTRIES: Country[] = [
  { name: 'Nigeria', iso: 'NG', dial: '+234' },
  { name: 'India', iso: 'IN', dial: '+91' },
  { name: 'Pakistan', iso: 'PK', dial: '+92' },
  { name: 'South Africa', iso: 'ZA', dial: '+27' },
  { name: 'United Kingdom', iso: 'GB', dial: '+44' },
  { name: 'United States', iso: 'US', dial: '+1' },
  { name: 'Afghanistan', iso: 'AF', dial: '+93' },
  { name: 'Aland Islands', iso: 'AX', dial: '+358' },
  { name: 'Albania', iso: 'AL', dial: '+355' },
  { name: 'Algeria', iso: 'DZ', dial: '+213' },
  { name: 'American Samoa', iso: 'AS', dial: '+1' },
  { name: 'Andorra', iso: 'AD', dial: '+376' },
];

export default function CountryPickerScreen() {
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

  const [query, setQuery] = useState('');
  const selectedIso = typeof params.iso === 'string' ? params.iso : 'NG';

  const goBackToContact = (country?: Country) => {
    router.replace({
      pathname: '/new-contact',
      params: {
        first: params.first ?? '',
        last: params.last ?? '',
        phone: params.phone ?? '',
        country: country?.name ?? (params.country ?? 'Nigeria'),
        iso: country?.iso ?? selectedIso,
        dial: country?.dial ?? (params.dial ?? '+234'),
        sync: params.sync ?? '0',
        returnTo: params.returnTo ?? '',
      },
    });
  };

  const handleBack = () => {
    goBackToContact();
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });
    return () => sub.remove();
  }, [params.first, params.last, params.phone, params.country, params.dial, params.sync, params.returnTo, selectedIso]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((item) =>
      item.name.toLowerCase().includes(q) ||
      item.iso.toLowerCase().includes(q) ||
      item.dial.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}> 
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: activeTheme.border }]}> 
          <TouchableOpacity onPress={handleBack} style={[styles.headerIcon, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}> 
            <Ionicons name="chevron-back" size={16} color={activeTheme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: activeTheme.text }]}>Choose a country</Text>
          <View style={[styles.headerIcon, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}> 
            <Ionicons name="search-outline" size={16} color={activeTheme.textMuted} />
          </View>
        </View>
      </SafeAreaView>

      <View style={styles.searchWrap}>
        <View style={[styles.searchBar, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}> 
          <Ionicons name="search-outline" size={16} color={activeTheme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: activeTheme.text }]}
            placeholder="Search country or code"
            placeholderTextColor={activeTheme.textMuted}
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {filtered.map((item) => {
          const isSelected = item.iso === selectedIso;
          return (
            <TouchableOpacity
              key={item.iso}
              style={[styles.row, { borderBottomColor: activeTheme.border }]}
              onPress={() => goBackToContact(item)}
            >
              <View style={[styles.flag, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}> 
                <Text style={[styles.flagText, { color: activeTheme.text }]}>{item.iso}</Text>
              </View>
              <Text style={[styles.countryName, { color: activeTheme.text }]}>{item.name}</Text>
              <View style={styles.rowRight}>
                <Text style={[styles.dial, { color: activeTheme.textMuted }]}>{item.dial}</Text>
                {isSelected ? <Ionicons name="checkmark" size={16} color={Theme.brand.primary} /> : null}
              </View>
            </TouchableOpacity>
          );
        })}
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
  headerTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.3 },
  headerIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 10 },
  searchBar: { borderWidth: 1, borderRadius: 18, height: 44, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '600' },
  scrollContent: { paddingBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  flag: { width: 36, height: 36, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  flagText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.4 },
  countryName: { flex: 1, fontSize: 16, fontWeight: '700' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dial: { fontSize: 14, fontWeight: '700' },
});
