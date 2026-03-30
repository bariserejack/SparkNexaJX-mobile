import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { Theme } from '../constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useAppTheme } from '../lib/theme';
import CustomDrawerContent from '../assets/components/CustomDrawerContent';
import { useFonts, Roboto_700Bold } from '@expo-google-fonts/roboto';

function drawerIcon(name: keyof typeof Ionicons.glyphMap) {
  return ({ color }: { color: string }) => <Ionicons name={name} size={16} color={color} />;
}

function RootDrawer() {
  const { activeTheme, themeMode, isReady } = useAppTheme();

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Theme.light.background }}>
        <ActivityIndicator size="large" color={Theme.brand.primary} />
      </View>
    );
  }

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
          name="tune-requests"
          options={{ drawerItemStyle: { display: 'none' } }}
        />
        <Drawer.Screen
          name="tune-request-detail"
          options={{ drawerItemStyle: { display: 'none' } }}
        />
        <Drawer.Screen
          name="tuned-profile"
          options={{ drawerItemStyle: { display: 'none' } }}
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
          name="about"
          options={{ drawerItemStyle: { display: 'none' } }}
        />
        <Drawer.Screen
          name="terms"
          options={{ drawerItemStyle: { display: 'none' } }}
        />
        <Drawer.Screen
          name="privacy-policy"
          options={{ drawerItemStyle: { display: 'none' } }}
        />
        <Drawer.Screen
          name="cookies-policy"
          options={{ drawerItemStyle: { display: 'none' } }}
        />
        <Drawer.Screen
          name="community-standards"
          options={{ drawerItemStyle: { display: 'none' } }}
        />
        <Drawer.Screen
          name="settings-detail/[slug]"
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
          name="new-contact"
          options={{ drawerItemStyle: { display: 'none' } }}
        />
        <Drawer.Screen
          name="country-picker"
          options={{ drawerItemStyle: { display: 'none' } }}
        />
        <Drawer.Screen
          name="contact-settings"
          options={{ drawerItemStyle: { display: 'none' } }}
        />
        <Drawer.Screen
          name="study-room"
          options={{ drawerItemStyle: { display: 'none' } }}
        />
        <Drawer.Screen
          name="app-lock"
          options={{ drawerItemStyle: { display: 'none' } }}
        />
        <Drawer.Screen
          name="groups/index"
          options={{ drawerItemStyle: { display: 'none' } }}
        />
        <Drawer.Screen
          name="groups/new"
          options={{ drawerItemStyle: { display: 'none' } }}
        />
        <Drawer.Screen
          name="communities/index"
          options={{ drawerItemStyle: { display: 'none' } }}
        />
        <Drawer.Screen
          name="communities/new"
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
  const [fontsLoaded] = useFonts({ Roboto_700Bold });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Theme.light.background }}>
        <ActivityIndicator size="large" color={Theme.brand.primary} />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <RootDrawer />
    </ThemeProvider>
  );
}
