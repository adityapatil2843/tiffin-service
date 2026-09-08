import { Stack } from 'expo-router';

export default function SuperAdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="owners/create" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="owners/[id]" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
