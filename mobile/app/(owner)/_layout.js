import { Stack } from 'expo-router';

export default function OwnerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="users/create" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="users/[id]" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
