import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack initialRouteName="signup" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="signup" />
      <Stack.Screen name="login" />
      <Stack.Screen name="logout" />
    </Stack>
  );
}
