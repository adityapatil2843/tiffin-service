import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { theme } from '../src/theme';

// This acts as the routing orchestrator based on auth state
export default function Index() {
  // In a real implementation, we would check the Zustand authStore here
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null); // 'superAdmin', 'owner', 'user', or null

  useEffect(() => {
    // Simulate checking secure storage for a token
    const checkAuth = async () => {
      // Mock logic:
      setUserRole(null); // Force login screen initially
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
      </View>
    );
  }

  // Route based on role
  if (!userRole) {
    return <Redirect href="/(auth)/login" />;
  }

  if (userRole === 'superAdmin') return <Redirect href="/(super-admin)/(tabs)/dashboard" />;
  if (userRole === 'owner') return <Redirect href="/(owner)/(tabs)/dashboard" />;
  if (userRole === 'user') return <Redirect href="/(user)/(tabs)/home" />;

  return null;
}
