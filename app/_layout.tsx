import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { Theme } from '../constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useAppTheme } from '../lib/theme';
import CustomDrawerContent from '../assets/components/CustomDrawerContent';

function drawerIcon(name: keyof typeof Ionicons.glyphMap) {
  return ({ color }: { color: string }) => <Ionicons name={name} size={16} color={color} />;
}

function RootDrawer() {
  const { activeTheme, themeMode } = useAppTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        key={themeMode}
        drawerContent={(props: any) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          overlayColor: 'rgba(2, 6, 23, 0.22)',
          sceneContainerStyle: {
            backgroundColor: activeTheme.background,
          },
          drawerStyle: {
            backgroundColor: activeTheme.tabBar,
            width: 310,
            borderTopRightRadius: 28,
            borderBottomRightRadius: 28,
            paddingTop: 10,
          },
          drawerType: 'front',
          swipeEdgeWidth: 48,
          drawerActiveTintColor: Theme.brand.primary,
          drawerInactiveTintColor: activeTheme.textMuted,
          drawerItemStyle: {
            borderRadius: 14,
            marginHorizontal: 10,
            marginVertical: 4,
          },
          drawerActiveBackgroundColor: activeTheme.iconBackground,
          drawerLabelStyle: {
            fontWeight: '700',
            marginLeft: -6,
            fontSize: 14,
          },
        }}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{ drawerItemStyle: { display: 'none' } }}
        />
        <Drawer.Screen
          name="index"
          options={{ drawerItemStyle: { display: 'none' } }}
        />

        <Drawer.Screen
          name="projects"
          options={{
            drawerLabel: 'Projects',
            drawerIcon: drawerIcon('layers-outline'),
          }}
        />
        <Drawer.Screen
          name="pulse"
          options={{
            drawerLabel: 'Neural Pulse',
            drawerIcon: drawerIcon('pulse-outline'),
          }}
        />
        <Drawer.Screen
          name="vault"
          options={{
            drawerLabel: 'Secure Vault',
            drawerIcon: drawerIcon('shield-checkmark-outline'),
          }}
        />
        <Drawer.Screen
          name="analytics"
          options={{
            drawerLabel: 'Analytics',
            drawerIcon: drawerIcon('bar-chart-outline'),
          }}
        />
        <Drawer.Screen
          name="notifications"
          options={{
            drawerLabel: 'Notifications',
            drawerIcon: drawerIcon('notifications-outline'),
          }}
        />
        <Drawer.Screen
          name="reminders"
          options={{
            drawerLabel: 'Daily Reminders',
            drawerIcon: drawerIcon('alarm-outline'),
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            drawerLabel: 'Settings',
            drawerIcon: drawerIcon('settings-outline'),
          }}
        />
        <Drawer.Screen
          name="privacy"
          options={{ drawerItemStyle: { display: 'none' } }}
        />
        <Drawer.Screen
          name="privacy-checkup"
          options={{ drawerItemStyle: { display: 'none' } }}
        />
        <Drawer.Screen
          name="help"
          options={{ drawerItemStyle: { display: 'none' } }}
        />
        <Drawer.Screen
          name="account"
          options={{ drawerItemStyle: { display: 'none' } }}
        />
        <Drawer.Screen
          name="profile-settings"
          options={{ drawerItemStyle: { display: 'none' } }}
        />
        <Drawer.Screen
          name="edit-profile"
          options={{ drawerItemStyle: { display: 'none' } }}
        />
        <Drawer.Screen
          name="post-audience"
          options={{ drawerItemStyle: { display: 'none' } }}
        />
        <Drawer.Screen
          name="storage-data"
          options={{ drawerItemStyle: { display: 'none' } }}
        />
        <Drawer.Screen
          name="app-lock"
          options={{ drawerItemStyle: { display: 'none' } }}
        />

        <Drawer.Screen
          name="auth"
          options={{ drawerItemStyle: { display: 'none' } }}
        />
        <Drawer.Screen
          name="onboarding"
          options={{ drawerItemStyle: { display: 'none' } }}
        />
        <Drawer.Screen
          name="+not-found"
          options={{ drawerItemStyle: { display: 'none' } }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootDrawer />
    </ThemeProvider>
  );
}
