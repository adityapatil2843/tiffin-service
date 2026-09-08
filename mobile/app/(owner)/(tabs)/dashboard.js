import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { theme } from '../../../src/theme';
import { useAuthStore } from '../../../src/store/authStore';
import Card from '../../../src/components/ui/Card';

const StatCard = ({ label, value, icon, color }) => (
  <Card style={styles.statCard}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={[styles.statValue, { color: color || theme.colors.primary.main }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </Card>
);

export default function OwnerDashboardScreen() {
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
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{user?.name} 👋</Text>
            <Text style={styles.service}>{user?.prefix} Service</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={24} color={theme.colors.error} />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <Text style={styles.sectionTitle}>Quick Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard label="Total Users" value="—" icon="👥" />
          <StatCard label="Today Deliveries" value="—" icon="🛵" color={theme.colors.secondary.main} />
          <StatCard label="Pending Requests" value="—" icon="⏳" color={theme.colors.warning} />
          <StatCard label="Monthly Revenue" value="₹—" icon="💰" color={theme.colors.success} />
        </View>

        <Card style={styles.hintCard}>
          <Text style={styles.hintTitle}>🚀 Getting Started</Text>
          <Text style={styles.hintText}>
            Add your first users, set up the weekly menu, and start managing deliveries from the tabs below.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingHorizontal: theme.spacing[5], paddingBottom: 100, gap: theme.spacing[5] },
  header: { paddingTop: theme.spacing[4], gap: theme.spacing[1], flexDirection: 'row', alignItems: 'center' },
  logoutBtn: { padding: 8, backgroundColor: theme.colors.error + '1A', borderRadius: theme.radius.full },
  greeting: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.size.base, color: theme.colors.textMuted },
  name: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.size['3xl'], color: theme.colors.textPrimary },
  service: { fontFamily: theme.typography.fontFamily.medium, fontSize: theme.typography.size.base, color: theme.colors.primary.main },
  sectionTitle: { fontFamily: theme.typography.fontFamily.semiBold, fontSize: theme.typography.size.lg, color: theme.colors.textPrimary },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[3] },
  statCard: { width: '47%', alignItems: 'center', gap: theme.spacing[2], paddingVertical: theme.spacing[5] },
  statIcon: { fontSize: 28 },
  statValue: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.size['2xl'] },
  statLabel: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.size.sm, color: theme.colors.textMuted, textAlign: 'center' },
  hintCard: { gap: theme.spacing[2] },
  hintTitle: { fontFamily: theme.typography.fontFamily.semiBold, fontSize: theme.typography.size.base, color: theme.colors.textPrimary },
  hintText: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.size.sm, color: theme.colors.textSecondary, lineHeight: 20 },
});
