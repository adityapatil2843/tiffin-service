import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../src/theme';
import api from '../../../src/services/api';
import Card from '../../../src/components/ui/Card';
import Badge from '../../../src/components/ui/Badge';
import EmptyState from '../../../src/components/ui/EmptyState';

export default function SuperAdminOwnersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [owners, setOwners] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOwners = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/super-admin/owners');
      setOwners(res.data.data.owners);
    } catch (e) {} finally { setIsLoading(false); }
  };

  useEffect(() => { fetchOwners(); }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Tiffin Services</Text>
          <Text style={styles.subtitle}>{owners.length} registered owners</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/(super-admin)/owners/create')} activeOpacity={0.8}>
          <Ionicons name="add" size={22} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchOwners} tintColor={theme.colors.primary.main} />}
      >
        {isLoading && owners.length === 0 ? (
          <ActivityIndicator color={theme.colors.primary.main} style={{ marginTop: 48 }} />
        ) : owners.length === 0 ? (
          <EmptyState icon="🏢" title="No owners yet" subtitle="Add your first tiffin service owner." action={() => router.push('/(super-admin)/owners/create')} actionLabel="Add Owner" />
        ) : (
          <View style={styles.list}>
            {owners.map((owner) => (
              <Card key={owner._id} style={styles.ownerCard}>
                <View style={styles.ownerHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.serviceName}>{owner.serviceId?.name || 'Unnamed Service'}</Text>
                    <Text style={styles.ownerName}>{owner.name} • {owner.phone}</Text>
                  </View>
                  <Badge label={owner.status} type={owner.status === 'active' ? 'success' : 'error'} />
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: theme.spacing[5], paddingVertical: theme.spacing[4] },
  title: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.size['2xl'], color: theme.colors.textPrimary },
  subtitle: { fontFamily: theme.typography.fontFamily.regular, fontSize: theme.typography.size.sm, color: theme.colors.textMuted, marginTop: 2 },
  addBtn: { width: 44, height: 44, borderRadius: theme.radius.md, backgroundColor: theme.colors.primary.main, justifyContent: 'center', alignItems: 'center', ...theme.shadow.glow },
  content: { paddingHorizontal: theme.spacing[5], paddingBottom: 100 },
  list: { gap: theme.spacing[3] },
  ownerCard: { padding: theme.spacing[4] },
  ownerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  serviceName: { fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.size.lg, color: theme.colors.primary.main, marginBottom: 2 },
  ownerName: { fontFamily: theme.typography.fontFamily.medium, fontSize: theme.typography.size.sm, color: theme.colors.textPrimary },
});
