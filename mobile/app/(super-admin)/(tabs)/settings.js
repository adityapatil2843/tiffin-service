import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../src/theme';
import { useAuthStore } from '../../../src/store/authStore';
import Avatar from '../../../src/components/ui/Avatar';
import Card from '../../../src/components/ui/Card';

const SettingsItem = ({ icon, label, onPress, color }) => (
  <TouchableOpacity style={styles.settingsItem} onPress={onPress} activeOpacity={0.7}>
    <Ionicons name={icon} size={20} color={color || theme.colors.textPrimary} />
    <Text style={[styles.settingsLabel, color && { color }]}>{label}</Text>
    <Ionicons name="chevron-forward" size={20} color={theme.colors.border} />
  </TouchableOpacity>
);

export default function SuperAdminSettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    Toast.show({ type: 'info', text1: 'Signed out' });
    router.replace('/(auth)/login');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Avatar name={user?.name} size={72} />
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <Card style={styles.section} padded={false}>
          <SettingsItem icon="person-outline" label="Edit Profile" onPress={() => Toast.show({ type: 'info', text1: 'Coming Soon' })} />
          <View style={styles.divider} />
          <SettingsItem icon="lock-closed-outline" label="Change Password" onPress={() => Toast.show({ type: 'info', text1: 'Coming Soon' })} />
        </Card>

        <Card style={styles.section} padded={false}>
          <SettingsItem icon="notifications-outline" label="Notifications" onPress={() => Toast.show({ type: 'info', text1: 'Coming Soon' })} />
          <View style={styles.divider} />
          <SettingsItem icon="server-outline" label="System Status" onPress={() => Toast.show({ type: 'info', text1: 'All systems operational' })} />
        </Card>

        <Card style={styles.section} padded={false}>
          <SettingsItem icon="log-out-outline" label="Sign Out" onPress={handleLogout} color={theme.colors.error} />
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingHorizontal: theme.spacing[5], paddingBottom: 100, gap: theme.spacing[6] },
  hero: { alignItems: 'center', paddingVertical: theme.spacing[6], gap: theme.spacing[2] },
  name: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.size.xl, color: theme.colors.textPrimary },
  email: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.size.sm, color: theme.colors.textMuted },
  section: { overflow: 'hidden' },
  settingsItem: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing[4], gap: theme.spacing[3] },
  settingsLabel: { flex: 1, fontFamily: theme.typography.fontFamily.medium, fontSize: theme.typography.size.base, color: theme.colors.textPrimary },
  divider: { height: 1, backgroundColor: theme.colors.border, marginHorizontal: theme.spacing[4] },
});
