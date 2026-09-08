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
import Badge from '../../../src/components/ui/Badge';

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={18} color={theme.colors.textMuted} />
    <View style={{ flex: 1 }}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '—'}</Text>
    </View>
  </View>
);

export default function UserProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    Toast.show({ type: 'info', text1: 'Signed out', text2: 'See you soon!' });
    router.replace('/(auth)/login');
  };

  const addr = user?.deliveryAddress;
  const addressString = addr
    ? [addr.line1, addr.line2, addr.city, addr.pincode].filter(Boolean).join(', ')
    : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Profile Hero */}
        <View style={styles.hero}>
          <Avatar name={user?.name} uri={user?.profileImage} size={80} />
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.userId}>{user?.userId}</Text>
          <View style={styles.badges}>
            <Badge label={user?.dietType || 'veg'} type={user?.dietType === 'veg' ? 'veg' : 'non-veg'} size="md" />
            <Badge label={user?.planType || 'monthly'} type="info" size="md" />
            <Badge label={user?.subscriptionStatus || 'active'} type={user?.subscriptionStatus === 'active' ? 'success' : 'warning'} size="md" />
          </View>
        </View>

        {/* Contact Info */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <InfoRow icon="call-outline" label="Phone" value={user?.phone} />
          <InfoRow icon="mail-outline" label="Email" value={user?.email} />
          <InfoRow icon="location-outline" label="Delivery Address" value={addressString} />
        </Card>

        {/* Subscription Info */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription Details</Text>
          <InfoRow icon="calendar-outline" label="Plan Type" value={user?.planType?.toUpperCase()} />
          <InfoRow icon="time-outline" label="Start Date" value={user?.planStartDate ? new Date(user.planStartDate).toLocaleDateString('en-IN') : null} />
        </Card>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingHorizontal: theme.spacing[5], paddingBottom: 100, gap: theme.spacing[4] },
  hero: { alignItems: 'center', paddingVertical: theme.spacing[6], gap: theme.spacing[2] },
  name: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.size['2xl'], color: theme.colors.textPrimary },
  userId: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.size.base, color: theme.colors.textMuted },
  badges: { flexDirection: 'row', gap: theme.spacing[2], marginTop: theme.spacing[2] },
  section: { gap: theme.spacing[3] },
  sectionTitle: { fontFamily: theme.typography.fontFamily.semiBold, fontSize: theme.typography.size.base, color: theme.colors.textPrimary, marginBottom: theme.spacing[1] },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing[3], paddingVertical: theme.spacing[2], borderTopWidth: 1, borderTopColor: theme.colors.border },
  infoLabel: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.size.xs, color: theme.colors.textMuted },
  infoValue: { fontFamily: theme.typography.fontFamily.medium, fontSize: theme.typography.size.base, color: theme.colors.textPrimary, marginTop: 2 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing[2], borderWidth: 1.5, borderColor: theme.colors.error, borderRadius: theme.radius.md, padding: theme.spacing[4], marginTop: theme.spacing[2] },
  logoutText: { fontFamily: theme.typography.fontFamily.semiBold, fontSize: theme.typography.size.base, color: theme.colors.error },
});
