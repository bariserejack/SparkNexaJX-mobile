import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { Theme } from '../constants/Theme';
import { useAppTheme } from '../lib/theme';

type EditItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  visibility?: 'Public' | 'Only me';
  editable?: boolean;
};

type EditSection = {
  title: string;
  collapsible?: boolean;
  items: EditItem[];
};

const TOP_ITEMS: EditItem[] = [
  { icon: 'language-outline', label: 'Languages' },
];

const SECTIONS: EditSection[] = [
  {
    title: 'Intro',
    collapsible: true,
    items: [
      { icon: 'hand-left-outline', label: 'Bio', editable: true },
      {
        icon: 'pin-outline',
        label: 'Pinned details',
        editable: true,
      },
    ],
  },
  {
    title: 'Category',
    collapsible: true,
    items: [{ icon: 'folder-open-outline', label: 'Category', editable: true }],
  },
  {
    title: 'Personal details',
    collapsible: true,
    items: [
      { icon: 'location-outline', label: 'Location', visibility: 'Public', editable: true },
      { icon: 'home-outline', label: 'Hometown', visibility: 'Public', editable: true },
      { icon: 'gift-outline', label: 'Date of birth', editable: true },
      { icon: 'heart-outline', label: 'Relationship status', visibility: 'Public', editable: true },
      { icon: 'people-outline', label: 'Pronouns', editable: true },
      { icon: 'male-female-outline', label: 'Gender', editable: true },
    ],
  },
  { title: 'Links', collapsible: true, items: [{ icon: 'link-outline', label: 'Websites, blogs, portfolios' }] },
  { title: 'Communities', collapsible: true, items: [{ icon: 'people-circle-outline', label: 'SparkNexa groups' }] },
  { title: 'Offers', collapsible: true, items: [{ icon: 'pricetag-outline', label: 'Promotions or affiliate links' }] },
  {
    title: 'Work',
    collapsible: true,
    items: [
      { icon: 'briefcase-outline', label: 'Work experience' },
      { icon: 'briefcase-outline', label: 'Current role', visibility: 'Public', editable: true },
      { icon: 'briefcase-outline', label: 'Workplace', visibility: 'Public', editable: true },
      { icon: 'briefcase-outline', label: 'Previous role', visibility: 'Public', editable: true },
    ],
  },
  {
    title: 'Education',
    collapsible: true,
    items: [
      { icon: 'school-outline', label: 'High school or college' },
      { icon: 'school-outline', label: 'University', visibility: 'Public', editable: true },
      { icon: 'school-outline', label: 'Secondary school', visibility: 'Public', editable: true },
    ],
  },
  { title: 'Hobbies', collapsible: true, items: [{ icon: 'shapes-outline', label: 'Hobbies' }] },
  {
    title: 'Interests',
    collapsible: true,
    items: [
      { icon: 'musical-notes-outline', label: 'Music' },
      { icon: 'tv-outline', label: 'TV shows' },
      { icon: 'film-outline', label: 'Movies' },
      { icon: 'game-controller-outline', label: 'Games' },
      { icon: 'basketball-outline', label: 'Sports teams and athletes' },
    ],
  },
  { title: 'Travel', collapsible: true, items: [{ icon: 'airplane-outline', label: 'Places' }] },
  {
    title: 'Contact info',
    collapsible: true,
    items: [
      { icon: 'at-outline', label: 'Social media' },
      { icon: 'call-outline', label: 'Phone number', editable: true },
      { icon: 'mail-outline', label: 'Add email' },
      { icon: 'newspaper-outline', label: 'Media kit' },
    ],
  },
  { title: 'Badges', collapsible: true, items: [{ icon: 'ribbon-outline', label: "You haven't earned any badges this week." }] },
];

export default function EditProfileScreen() {
  const { activeTheme, isDark } = useAppTheme();
  const handleBack = () => router.back();

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: activeTheme.border }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={16} color={activeTheme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: activeTheme.text }]}>Edit profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={isDark ? ['#3A2F8C', '#161A46'] : ['#B49DFF', '#EFE9FF']}
            style={styles.cover}
          >
            <TouchableOpacity style={styles.coverCamera}>
              <Ionicons name="camera-outline" size={16} color={activeTheme.text} />
              <View style={styles.iconAccent} />
            </TouchableOpacity>
          </LinearGradient>

          <View style={[styles.avatarWrap, { borderColor: activeTheme.background }]}>
            <View style={[styles.avatarCircle, { backgroundColor: activeTheme.card }]}>
              <Text style={[styles.avatarText, { color: activeTheme.text }]}>AR</Text>
            </View>
            <TouchableOpacity style={[styles.avatarCamera, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
              <Ionicons name="camera-outline" size={16} color={activeTheme.text} />
              <View style={styles.iconAccent} />
            </TouchableOpacity>
          </View>

          <View style={[styles.listCard, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
            {TOP_ITEMS.map((item, idx) => (
              <View key={item.label}>
                <EditRow item={item} theme={activeTheme} />
                {idx !== TOP_ITEMS.length - 1 ? <Divider theme={activeTheme} /> : null}
              </View>
            ))}
          </View>

          {SECTIONS.map((section) => (
            <View key={section.title} style={styles.sectionBlock}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: activeTheme.text }]}>{section.title}</Text>
                {section.collapsible ? <Ionicons name="chevron-up" size={16} color={activeTheme.textMuted} /> : null}
              </View>
              <View style={[styles.listCard, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
                {section.items.map((item, idx) => (
                  <View key={`${section.title}-${item.label}`}>
                    <EditRow item={item} theme={activeTheme} />
                    {idx !== section.items.length - 1 ? <Divider theme={activeTheme} /> : null}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function EditRow({ item, theme }: { item: EditItem; theme: any }) {
  return (
    <TouchableOpacity style={styles.row} disabled={!item.editable}>
      <View style={[styles.iconFrame, { borderColor: theme.border, backgroundColor: theme.background }]}>
        <Ionicons name={item.icon} size={16} color={theme.text} />
        <View style={styles.iconAccent} />
      </View>
      <View style={styles.rowTextWrap}>
        <Text style={[styles.rowLabel, { color: theme.text }]}>{item.label}</Text>
        {item.visibility ? (
          <View style={styles.visibilityRow}>
            <Ionicons name={item.visibility === 'Public' ? 'globe-outline' : 'lock-closed-outline'} size={16} color={theme.textMuted} />
            <Text style={[styles.visibilityText, { color: theme.textMuted }]}>{item.visibility}</Text>
          </View>
        ) : null}
      </View>
      {item.editable ? <Ionicons name="create-outline" size={16} color={theme.textMuted} /> : null}
    </TouchableOpacity>
  );
}

function Divider({ theme }: { theme: any }) {
  return <View style={[styles.divider, { backgroundColor: theme.border }]} />;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { width: 34, alignItems: 'flex-start' },
  headerTitle: { fontSize: 26, fontWeight: '900', letterSpacing: -0.4 },
  headerSpacer: { width: 34 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 },
  cover: { height: 170, borderRadius: 24, overflow: 'hidden', justifyContent: 'flex-end', alignItems: 'flex-end', padding: 12 },
  coverCamera: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrap: {
    marginTop: -34,
    marginLeft: 14,
    width: 106,
    height: 106,
    borderRadius: 26,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  avatarCircle: { width: 96, height: 96, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 30, fontWeight: '900', letterSpacing: 0.8 },
  avatarCamera: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionBlock: { marginTop: 16 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  sectionTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.3 },
  listCard: { borderWidth: 1, borderRadius: 18, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 12, paddingVertical: 12 },
  iconFrame: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  iconAccent: {
    position: 'absolute',
    right: 2,
    top: 2,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Theme.brand.primary,
  },
  rowTextWrap: { flex: 1, paddingRight: 10 },
  rowLabel: { fontSize: 16, fontWeight: '700', letterSpacing: -0.1 },
  visibilityRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  visibilityText: { fontSize: 12, fontWeight: '600' },
  divider: { height: 1, marginLeft: 52 },
});


