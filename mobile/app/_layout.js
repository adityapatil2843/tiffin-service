import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import Toast from 'react-native-toast-message';
import { StatusBar } from 'expo-status-bar';

import { toastConfig } from '../src/components/ui/Toast';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'), // We will mock these or download them
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
  });

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // For now, we simulate font loading since we haven't downloaded the files yet
    // In real app, we wait for `fontsLoaded`
    setTimeout(() => {
      setIsReady(true);
      SplashScreen.hideAsync();
    }, 500);
  }, []);

  if (!isReady) {
    return null; // Or a custom loading view
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        {/* We will route based on index.js logic */}
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(super-admin)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(owner)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(user)" options={{ animation: 'fade' }} />
      </Stack>
      
      {/* Global Toast component configured with our custom UI */}
      <Toast config={toastConfig} />
    </>
  );
}
