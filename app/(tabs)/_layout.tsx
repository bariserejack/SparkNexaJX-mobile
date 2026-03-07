import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Theme } from '../../constants/Theme';
import { useAppTheme } from '../../lib/theme';

function makeTabOptions(
  label: string,
  inactiveIcon: keyof typeof Ionicons.glyphMap,
  activeIcon: keyof typeof Ionicons.glyphMap,
  activeBg: string
) {
  return {
    title: label,
    tabBarLabel: label,
    tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
      <View style={[styles.iconWrap, focused && { backgroundColor: activeBg }]}>
        <Ionicons name={focused ? activeIcon : inactiveIcon} size={16} color={color} />
      </View>
    ),
  };
}

export default function TabLayout() {
  const { activeTheme, themeMode } = useAppTheme();

  return (
    <Tabs
      key={themeMode}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: activeTheme.text,
        tabBarInactiveTintColor: activeTheme.textMuted,
        tabBarLabelStyle: styles.label,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: activeTheme.tabBar,
            borderTopColor: activeTheme.border,
          },
        ],
      }}
    >
      <Tabs.Screen name="index" options={makeTabOptions('Home', 'home-outline', 'home', 'rgba(115, 103, 240, 0.16)')} />
      <Tabs.Screen name="learn" options={makeTabOptions('Learn', 'library-outline', 'library', 'rgba(0, 210, 255, 0.16)')} />
      <Tabs.Screen name="explore" options={makeTabOptions('Explore', 'compass-outline', 'compass', 'rgba(255, 75, 43, 0.16)')} />
      <Tabs.Screen name="profile" options={makeTabOptions('Profile', 'person-outline', 'person', 'rgba(52, 199, 89, 0.16)')} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    borderTopWidth: 1,
    paddingBottom: 6,
    paddingTop: 8,
    elevation: 0,
  },
  iconWrap: {
    width: 36,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
});
