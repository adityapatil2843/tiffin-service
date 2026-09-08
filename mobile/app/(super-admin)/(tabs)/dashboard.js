import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

export default function SuperAdminDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Super Admin Portal</Text>
          <Text style={styles.name}>{user?.name} 👑</Text>
        </View>

        <Text style={styles.sectionTitle}>Platform Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard label="Total Owners" value="—" icon="🏢" />
          <StatCard label="Total Users" value="—" icon="👥" color={theme.colors.secondary.main} />
          <StatCard label="Active Services" value="—" icon="✅" color={theme.colors.success} />
          <StatCard label="Platform Revenue" value="₹—" icon="💎" color={theme.colors.gold} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingHorizontal: theme.spacing[5], paddingBottom: 100, gap: theme.spacing[5] },
  header: { paddingTop: theme.spacing[4], gap: theme.spacing[1] },
  greeting: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.size.base, color: theme.colors.textMuted },
  name: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.size['3xl'], color: theme.colors.textPrimary },
  sectionTitle: { fontFamily: theme.typography.fontFamily.semiBold, fontSize: theme.typography.size.lg, color: theme.colors.textPrimary },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[3] },
  statCard: { width: '47%', alignItems: 'center', gap: theme.spacing[2], paddingVertical: theme.spacing[5] },
  statIcon: { fontSize: 28 },
  statValue: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.size['2xl'] },
  statLabel: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.size.sm, color: theme.colors.textMuted, textAlign: 'center' },
});
